use futures::executor::block_on;

use ethers_core::types::{Address, Bytes, H256};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;
use ethers_middleware::SignerMiddleware;
use ethers_providers::Provider;

pub mod provider;
pub mod signer;
pub mod wrap;
use wrap::*;
use crate::provider::PolywrapProvider;
use crate::signer::PolywrapSigner;

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
        format!("{}", bytes).to_string()
    })
}

pub fn encode_params(input: wrap::ArgsEncodeParams) -> String {
    let bytes: Bytes = api::encode_params(input.types, input.values).into();
    format!("{}", bytes).to_string()
}

pub fn encode_function(input: wrap::ArgsEncodeFunction) -> String {
    let args: Vec<String> = input.args.unwrap_or(vec![]);
    let bytes: Bytes = api::encode_function(&input.method, args).into();
    format!("{}", bytes).to_string()
}

pub fn decode_function(input: wrap::ArgsDecodeFunction) -> Vec<String> {
    let data = Bytes::from_str(&input.data).unwrap().to_vec();
    let tokens = api::decode_function(&input.method, data);
    tokens
        .iter()
        .map(|t| format::format_token(t))
        .collect()
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
        let provider = Provider::new(PolywrapProvider {});
        let signer = PolywrapSigner::new();
        let client = SignerMiddleware::new(provider, signer);
        let tx_hash = api::sign_and_send_transaction(client, tx).await;
        let response = api::await_transaction(tx_hash).await;
        let tx_response = mapping::to_wrap_response(response).await;
        tx_response
    })
}

pub fn send_transaction_and_wait(input: wrap::ArgsSendTransactionAndWait) -> wrap::TxReceipt {
    block_on(async {
        let tx = mapping::from_wrap_request(input.tx);
        let provider = Provider::new(PolywrapProvider {});
        let signer = PolywrapSigner::new();
        let client = SignerMiddleware::new(provider, signer);
        let tx_hash = api::sign_and_send_transaction(client, tx).await;
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

        let tx_options: mapping::EthersTxOptions = mapping::from_wrap_tx_options(input.options);
        let tx = api::create_deploy_contract_transaction(abi, bytecode, args, &tx_options).unwrap();
        let provider = Provider::new(PolywrapProvider {});
        let signer = PolywrapSigner::new();
        let client = SignerMiddleware::new(provider, signer);
        let tx_hash = api::sign_and_send_transaction(client, tx.into()).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        let address = receipt.contract_address.expect("Contract failed to deploy.");
        format!("{:#x}", address)
    })
}

pub fn estimate_contract_call_gas(input: wrap::ArgsEstimateContractCallGas) -> BigInt {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let tx_options: mapping::EthersTxOptions = mapping::from_wrap_tx_options(input.options);
        let gas = api::estimate_contract_call_gas(address, &input.method, &args, &tx_options).await;
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
        format::format_tokens(&tokens)
    })
}

pub fn call_contract_static(input: ArgsCallContractStatic) -> wrap::StaticTxResult {
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };
        let args: Vec<String> = input.args.unwrap_or(vec![]);
        let tx_options: mapping::EthersTxOptions = mapping::from_wrap_tx_options(input.options);
        let result = api::call_contract_static(address, &input.method, args, &tx_options).await;
        match result {
            Ok(tokens) => wrap::StaticTxResult {
                result: format::format_tokens(&tokens),
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
        let tx_options: mapping::EthersTxOptions = mapping::from_wrap_tx_options(input.options);
        let tx_hash = api::call_contract_method(address, &input.method, args, &tx_options).await;
        let response = api::await_transaction(tx_hash).await;
        let tx_response = mapping::to_wrap_response(response).await;
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
        let tx_options: mapping::EthersTxOptions = mapping::from_wrap_tx_options(input.options);
        let tx_hash = api::call_contract_method(address, &input.method, args, &tx_options).await;
        let receipt = api::get_transaction_receipt(tx_hash).await;
        let tx_receipt = mapping::to_wrap_receipt(receipt);
        tx_receipt
    })
}
