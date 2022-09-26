use ethers_core::types::{Address, U256, BlockId, BlockNumber};
use ethers_providers::{Middleware, Provider};
use std::str::FromStr;
use polywrap_wasm_rs::BigInt;

pub mod provider;
pub mod task;
pub mod wrap;
use wrap::*;

use futures::executor::block_on;
use provider::PolywrapProvider;
use task::spawn_local;

pub fn chain_id(input: wrap::ArgsChainId) -> String {
    block_on(async {
        let client = Provider::new(PolywrapProvider {});
        let id: U256 = client.get_chainid().await.unwrap();
        id.to_string()
    })
}

pub fn call_contract_view(input: wrap::ArgsCallContractView) -> String {
    // address, method, args
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };

        let function = match ethers_core::abi::AbiParser::default().parse_function(&input.method) {
            Ok(f) => f,
            Err(e) => panic!("Invalid method: {}. Error: {}", &input.method, e),
        };


        let args = match input.args {
            Some(args) => args,
            None => vec![],
        };

        let abi = ethers_core::abi::parse_abi(&[&input.method]).unwrap();

        let client = Provider::new(PolywrapProvider {});

        let arg: &[u8] = args[0].as_bytes();
        let arr: [u8; 32] = arg[0..32].try_into().unwrap();
        let data = ethers_contract::encode_function_data(&function, arr).unwrap();

        let tx = ethers_core::types::Eip1559TransactionRequest {
            to: Some(address.into()),
            data: Some(data),
            ..Default::default()
        };

        let tx = tx.into();

        let bytes = client
            .call(&tx, None)
            .await
            .unwrap();

        bytes.to_string()
    })
}

// pub fn call_contract_static(input: ArgsCallContractStatic) -> String {}

pub fn get_balance(input: wrap::ArgsGetBalance) -> BigInt {
    // address, blockTag
    block_on(async {
        let address = match Address::from_str(&input.address) {
            Ok(addr) => addr,
            Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
        };

        let block_tag: BlockId = BlockNumber::Latest.into(); 

        let client = Provider::new(PolywrapProvider {});

        let balance = client.get_balance(address, Some(block_tag)).await.unwrap().to_string();
        BigInt::from_str(&balance).unwrap()
    })
}

// pub fn get_gas_price(input: ArgsGetGasPrice) -> String {}

pub fn check_address(input: ArgsCheckAddress) -> bool {
        match Address::from_str(&input.address) {
            Ok(addr) => true,
            Err(e) => false,
        }
}

// pub fn get_network(input: ArgsGetNetwork) -> String {}

// pub fn call_contract_view(input: ArgsCallContractView) -> String {}
