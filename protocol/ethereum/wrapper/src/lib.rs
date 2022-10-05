use futures::executor::block_on;

use ethers_core::types::{Address, Bytes, H256};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

pub mod provider;
pub mod signer;
pub mod wrap;
use wrap::*;
pub mod api;
pub mod error;
pub mod format;
pub mod mapping;

pub fn get_chain_id(_input: wrap::ArgsGetChainId) -> String {
    block_on(api::get_chain_id()).to_string()
}

pub fn get_balance(input: wrap::ArgsGetBalance) -> BigInt {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid address: {}. Error: {}", &input.address, e),
        };
        let balance = api::get_balance(address).await;
        BigInt::from_str(&balance.to_string()).unwrap()
    })
}

pub fn check_address(input: wrap::ArgsCheckAddress) -> bool {
    match Address::from_str(&input.address) {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn get_gas_price(_input: wrap::ArgsGetGasPrice) -> BigInt {
    block_on(async {
        let price = api::get_gas_price().await;
        BigInt::from_str(&price.to_string()).unwrap()
    })
}

pub fn get_signer_address(_input: wrap::ArgsGetSignerAddress) -> String {
    format!("{}", api::get_signer_address())
}

pub fn get_signer_balance(_input: wrap::ArgsGetSignerBalance) -> BigInt {
    block_on(async {
        let balance = api::get_signer_balance().await;
        BigInt::from_str(&balance.to_string()).unwrap()
    })
}

pub fn get_signer_transaction_count(_input: wrap::ArgsGetSignerTransactionCount) -> BigInt {
    block_on(async {
        let count = api::get_signer_transaction_count().await;
        BigInt::from_str(&count.to_string()).unwrap()
    })
}

pub fn sign_message(input: wrap::ArgsSignMessage) -> String {
    block_on(async {
        let signature = api::sign_message(&input.message).await;
        let bytes: Bytes = signature.to_vec().into();
        serde_json::to_string(&bytes).unwrap()
    })
}

pub fn encode_params(input: wrap::ArgsEncodeParams) -> String {
    let bytes: Bytes = api::encode_params(input.types, input.values).into();
    serde_json::to_string(&bytes).unwrap()
}

pub fn encode_function(input: wrap::ArgsEncodeFunction) -> String {
    let args: Vec<String> = input.args.unwrap_or(vec![]);
    let bytes: Bytes = api::encode_function(&input.method, args).into();
    serde_json::to_string(&bytes).unwrap()
}

pub fn to_wei(input: ArgsToWei) -> String {
    api::to_wei(input.eth).to_string()
}

pub fn to_eth(input: ArgsToEth) -> String {
    api::to_eth(input.wei).to_string()
}

pub fn send_rpc(input: wrap::ArgsSendRpc) -> String {
    block_on(api::send_rpc(&input.method, input.params))
}

pub fn estimate_transaction_gas(input: wrap::ArgsEstimateTransactionGas) -> BigInt {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let gas = api::estimate_transaction_gas(tx).await;
        BigInt::from_str(&gas.to_string()).unwrap()
    })
}

pub fn await_transaction(input: wrap::ArgsAwaitTransaction) -> wrap::TxReceipt {
    block_on(async {
        let receipt = api::get_transaction_receipt(H256::from_str(&input.tx_hash).unwrap()).await;
        let tx_receipt = mapping::to_wrap_receipt(receipt);
        tx_receipt
    })
}

pub fn send_transaction(input: wrap::ArgsSendTransaction) -> wrap::TxResponse {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let tx_hash = api::send_transaction(tx).await;
        let response = api::await_transaction(tx_hash).await;
        let tx_response = mapping::to_wrap_response(response, None, None).await;
        tx_response
    })
}

pub fn send_transaction_and_wait(input: wrap::ArgsSendTransactionAndWait) -> wrap::TxReceipt {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let tx_hash = api::send_transaction(tx).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        let tx_receipt = mapping::to_wrap_receipt(receipt);
        tx_receipt
    })
}

pub fn deploy_contract(input: wrap::ArgsDeployContract) -> String {
    block_on(async {
        let abi = serde_json::from_str(&input.abi).unwrap();
        let bytecode = Bytes::from_str(&input.bytecode).unwrap();
        let args: Vec<String> = input.args.unwrap_or(vec![]);

        let tx = api::deploy_contract(abi, bytecode, args).unwrap();
        let tx_hash = api::send_transaction(tx.into()).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        receipt.contract_address.unwrap().to_string()
    })
}

pub fn estimate_contract_call_gas(input: wrap::ArgsEstimateContractCallGas) -> BigInt {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let gas = api::estimate_contract_call_gas(address, &input.method, args).await;
        BigInt::from_str(&gas.to_string()).unwrap()
    })
}

pub fn call_contract_view(input: wrap::ArgsCallContractView) -> String {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let tokens = api::call_contract_view(address, &input.method, args).await;
        format::format_tokens(tokens)
    })
}

pub fn call_contract_static(input: ArgsCallContractStatic) -> wrap::StaticTxResult {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let result = api::call_contract_static(address, &input.method, args).await;
        match result {
            Ok(tokens) => wrap::StaticTxResult {
                result: format::format_tokens(tokens),
                error: false,
            },
            Err(e) => wrap::StaticTxResult {
                result: e.to_string(),
                error: true,
            },
        }
    })
}

pub fn call_contract_method(input: wrap::ArgsCallContractMethod) -> wrap::TxResponse {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let (data, raw, tx_hash) = api::call_contract_method(address, &input.method, args).await;
        let response = api::await_transaction(tx_hash).await;
        let tx_response = mapping::to_wrap_response(response, Some(data), Some(raw)).await;
        tx_response
    })
}

pub fn call_contract_method_and_wait(
    input: wrap::ArgsCallContractMethodAndWait,
) -> wrap::TxReceipt {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let (_, _, tx_hash) = api::call_contract_method(address, &input.method, args).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        let tx_receipt = mapping::to_wrap_receipt(receipt);
        tx_receipt
    })
}
