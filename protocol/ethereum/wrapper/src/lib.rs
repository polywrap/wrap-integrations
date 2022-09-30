use futures::executor::block_on;

use ethers_core::types::{Address, Bytes};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

pub mod provider;
pub mod signer;
pub mod wrap;
use wrap::*;
pub mod api;
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
        Ok(addr) => true,
        Err(e) => false,
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

pub fn send_rpc(input: wrap::ArgsSendRpc) -> String {
    block_on(api::send_rpc(&input.message, input.params))
}

pub fn encode_function(input: wrap::ArgsEncodeFunction) -> String {
    let args: Vec<String> = input.args.unwrap_or(vec![]);
    let bytes: Bytes = api::encode_function(&input.method, args).into();
    serde_json::to_string(&bytes).unwrap()
}

pub fn estimate_transaction_gas(input: wrap::ArgsEstimateTransactionGas) -> BigInt {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let gas = api::estimate_transaction_gas(tx).await;
        BigInt::from_str(&gas.to_string()).unwrap()
    })
}

pub fn await_transaction(input: wrap::ArgsAwaitTransaction) -> wrap::TxResponse {
    block_on(async {
        let response = api::await_transaction(input.tx_hash).await;
        let tx_response = mapping::to_wrap_response(response, None, None).await;
        tx_response
    })
}

pub fn send_transaction(input: wrap::ArgsSendTransaction) -> wrap::TxResponse {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let response = api::send_transaction(tx).await;
        let tx_response = mapping::to_wrap_response(response, None, None).await;
        tx_response
    })
}

pub fn send_transaction(input: wrap::ArgsSendTransaction) -> wrap::TxResponse {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let (data, raw, tx_hash) = api::send_transaction(mut tx).await;
        let response = api::get_transaction_receipt(tx_hash).await;
        let tx_response = mapping::to_wrap_response(response, Some(data), Some(raw)).await;
        tx_response
    })
}

pub fn send_transaction_and_wait(input: wrap::ArgsSendTransaction) -> wrap::TxReceipt {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let (data, raw, tx_hash) = api::send_transaction(mut tx).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        let tx_receipt = mapping::to_wrap_receipt(receipt).await;
        tx_receipt
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

pub fn call_contract_static(input: ArgsCallContractStatic) -> String {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let tokens = api::call_contract_static(address, &input.method, args).await;
        format::format_tokens(tokens)
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

pub fn call_contract_method_and_wait(input: wrap::ArgsCallContractMethodAndWait) -> wrap::TxReceipt {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let (data, raw, tx_hash) = api::call_contract_method(address, &input.method, args).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        let tx_receipt = mapping::to_wrap_receipt(receipt).await;
        tx_receipt
    })
}
