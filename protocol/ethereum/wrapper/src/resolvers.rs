use ethers_core::{
    abi::{encode, AbiParser, ParamType},
    types::{transaction::request::TransactionRequest, Address, Bytes, U256},
    utils::{format_ether, parse_ether},
};
use ethers_providers::Provider;
use ethers_signers::Signer;
use hex::FromHex;

use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

use super::provider::PolywrapProvider;
use super::signer::PolywrapSigner;

use super::wrap::{ArgsCallContractView, ArgsSignMessage};

pub fn call_contract_view(input: ArgsCallContractView) -> String {
    // verify address
    let address = match Address::from_str(&input.address) {
        Ok(a) => a,
        Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e),
    };

    // instantiate contract
    let abi = AbiParser::default().parse(&[&input.method]).unwrap();

    let client = Provider::new(PolywrapProvider::new());

    let contract = ethers_contract::Contract::new(address, abi, client);

    let args = match input.args {
        Some(a) => a,
        None => vec![],
    };

    let param = <[u8; 32]>::from_hex(&args[0]).unwrap();

    let response = contract
        .method::<_, Address>(input.method, param)
        .unwrap()
        .call()
        .unwrap();

    response
}

pub fn sign_message(input: ArgsSignMessage) -> String {
    let signer = PolywrapSigner::new();

    let signature = signer.sign_message(input.message).unwrap();

    let str_hex = ethers_core::utils::hex::encode(signature.to_vec());
    let str_encoded = format!("0x{}", str_hex);
    str_encoded
}
