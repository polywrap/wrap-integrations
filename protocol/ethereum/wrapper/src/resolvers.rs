use super::mapping::to_tx_request;
use super::utils::{contract_call_to_tx, encode_function_args, get_address, tokenize_str_args};
use super::wrap::imported::signer_event_notification::SignerEventNotification;
use super::wrap::imported::signer_module;
use super::wrap::imported::signer_network::SignerNetwork;
use super::wrap::imported::signer_static_tx_result::SignerStaticTxResult;
use super::wrap::imported::signer_tx_receipt::SignerTxReceipt;
use super::wrap::imported::signer_tx_response::SignerTxResponse;
use super::wrap::{
    ArgsAwaitTransaction, ArgsCallContractMethod, ArgsCallContractMethodAndWait,
    ArgsCallContractStatic, ArgsCallContractView, ArgsCheckAddress, ArgsDeployContract,
    ArgsEncodeFunction, ArgsEncodeParams, ArgsEstimateContractCallGas, ArgsEstimateTransactionGas,
    ArgsGetGasPrice, ArgsGetNetwork, ArgsGetSignerAddress, ArgsGetSignerBalance, ArgsGetBalance,
    ArgsGetSignerTransactionCount, ArgsSendRpc, ArgsSendTransaction,
    ArgsSendTransactionAndWait, ArgsSignMessage, ArgsToEth, ArgsToWei,
    ArgsWaitForEvent, SignerModule,
};

use ethers_core::{
    abi::{encode, AbiParser, ParamType},
    types::{transaction::request::TransactionRequest, Address, Bytes, U256},
    utils::{format_ether, parse_ether},
};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

pub fn call_contract_view(input: ArgsCallContractView) -> String {
    let contract_call_args = signer_module::ArgsCallContractView {
        address: input.address,
        method: input.method,
        args: input.args,
        connection: input.connection,
    };

    match SignerModule::call_contract_view(&contract_call_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn call_contract_static(input: ArgsCallContractStatic) -> SignerStaticTxResult {
    let contract_call_args = signer_module::ArgsCallContractStatic {
        address: input.address,
        method: input.method,
        args: input.args,
        connection: input.connection,
        tx_overrides: None,
        // TODO: tx_overrides
    };

    match SignerModule::call_contract_static(&contract_call_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn encode_params(input: ArgsEncodeParams) -> String {
    //Ethers's parse_param function is private. So we parse a mock function to extract the param_types
    let types_str = input.types.join(", ");
    let mock_function = AbiParser::default()
        .parse_function(&format!("foo({})", types_str))
        .unwrap();

    match tokenize_str_args(
        mock_function
            .inputs
            .clone()
            .into_iter()
            .map(|x| x.kind)
            .collect(),
        input.values.clone(),
    ) {
        Ok(data) => {
            let vec_u8 = encode(&data);
            let str_hex = ethers_core::utils::hex::encode(vec_u8);
            let str_encoded = format!("0x{}", str_hex);
            str_encoded
        },
        Err(e) => panic!(
            "Error tokenizing args: {}. Error: {}",
            input.values.join(", "),
            e
        ),
    }
}

pub fn encode_function(input: ArgsEncodeFunction) -> String {
    let args = match input.args {
        Some(a) => a,
        None => vec![],
    };

    match encode_function_args(&input.method, args) {
        Ok(data) => {
            let str_hex = ethers_core::utils::hex::encode(data);
            let str_encoded = format!("0x{}", str_hex);
            str_encoded
        },
        Err(e) => panic!("Error encoding function '{}'. Error: {}", &input.method, e),
    }
}

pub fn get_balance(input: ArgsGetBalance) -> BigInt {
    match SignerModule::get_balance(&signer_module::ArgsGetBalance {
        address: input.address,
        block_tag: input.block_tag,
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn get_signer_address(input: ArgsGetSignerAddress) -> String {
    match SignerModule::get_signer_address(&signer_module::ArgsGetSignerAddress {
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn get_signer_balance(input: ArgsGetSignerBalance) -> BigInt {
    match SignerModule::get_signer_balance(&signer_module::ArgsGetSignerBalance {
        block_tag: input.block_tag,
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn get_signer_transaction_count(input: ArgsGetSignerTransactionCount) -> BigInt {
    match SignerModule::get_signer_transaction_count(&signer_module::ArgsGetSignerTransactionCount {
        block_tag: input.block_tag,
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn get_gas_price(input: ArgsGetGasPrice) -> BigInt {
    match SignerModule::get_gas_price(&signer_module::ArgsGetGasPrice {
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn estimate_transaction_gas(input: ArgsEstimateTransactionGas) -> BigInt {
    match SignerModule::estimate_transaction_gas(&signer_module::ArgsEstimateTransactionGas {
        tx: input.tx,
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn estimate_contract_call_gas(input: ArgsEstimateContractCallGas) -> BigInt {
    let estimate_contract_call_gas_args = signer_module::ArgsEstimateContractCallGas {
        address: input.address,
        method: input.method,
        args: input.args,
        connection: input.connection,
        tx_overrides: None,
    };

    match SignerModule::estimate_contract_call_gas(&estimate_contract_call_gas_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn check_address(input: ArgsCheckAddress) -> bool {
    match get_address(&input.address) {
        Ok(a) => true,
        Err(e) => false,
    }
}

pub fn to_wei(input: ArgsToWei) -> String {
    match parse_ether(input.eth) {
        Ok(wei) => wei.to_string(),
        Err(e) => panic!("{}", e),
    }
}

pub fn to_eth(input: ArgsToEth) -> String {
    let wei = match U256::from_dec_str(&input.wei) {
        Ok(w) => w,
        Err(_) => panic!("Invalid Wei number: {}", input.wei),
    };

    format_ether(wei).to_string()
}

pub fn await_transaction(input: ArgsAwaitTransaction) -> SignerTxReceipt {
    match SignerModule::await_transaction(&signer_module::ArgsAwaitTransaction {
        tx_hash: input.tx_hash,
        confirmations: input.confirmations,
        timeout: input.timeout,
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn wait_for_event(input: ArgsWaitForEvent) -> SignerEventNotification {
    match SignerModule::wait_for_event(&signer_module::ArgsWaitForEvent {
        address: input.address,
        event: input.event,
        args: input.args,
        timeout: input.timeout,
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn get_network(input: ArgsGetNetwork) -> SignerNetwork {
    match SignerModule::get_network(&signer_module::ArgsGetNetwork {
        connection: input.connection,
    }) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn deploy_contract(input: ArgsDeployContract) -> SignerTxReceipt {
    let abi = AbiParser::default().parse_str(&input.abi).unwrap();
    let args_list = match input.args {
        Some(a) => a,
        None => vec![],
    };
    let bytecode = Bytes::from_str(&input.bytecode).unwrap();

    let data: Bytes = match (abi.constructor(), args_list.is_empty()) {
        (None, false) => panic!("Constructor error"),
        (None, true) => bytecode.clone(),
        (Some(constructor), _) => {
            let param_types: Vec<ParamType> = constructor
                .inputs
                .clone()
                .into_iter()
                .map(|x| x.kind)
                .collect();
            let str_args = tokenize_str_args(param_types, args_list).unwrap();

            constructor
                .encode_input(bytecode.to_vec(), &str_args)
                .unwrap()
                .into()
        }
    };

    let tx = TransactionRequest {
        to: None,
        data: Some(data),
        ..Default::default()
    };
    let tx_request = to_tx_request(tx);

    let send_transaction_args = signer_module::ArgsSendTransactionAndWait {
        tx: tx_request,
        connection: input.connection,
    };

    match SignerModule::send_transaction_and_wait(&send_transaction_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn call_contract_method(input: ArgsCallContractMethod) -> SignerTxResponse {
    let tx_request = contract_call_to_tx(&input.address, &input.method, input.args);

    let send_transaction_args = signer_module::ArgsSendTransaction {
        tx: tx_request,
        connection: input.connection,
    };

    match SignerModule::send_transaction(&send_transaction_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn call_contract_method_and_wait(input: ArgsCallContractMethodAndWait) -> SignerTxReceipt {
    let tx_request = contract_call_to_tx(&input.address, &input.method, input.args);

    let send_transaction_args = signer_module::ArgsSendTransactionAndWait {
        tx: tx_request,
        connection: input.connection,
    };

    match SignerModule::send_transaction_and_wait(&send_transaction_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn send_transaction(input: ArgsSendTransaction) -> SignerTxResponse {
    let send_transaction_args = signer_module::ArgsSendTransaction {
        tx: input.tx,
        connection: input.connection,
    };

    match SignerModule::send_transaction(&send_transaction_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn send_transaction_and_wait(
    input: ArgsSendTransactionAndWait,
) -> SignerTxReceipt {
    let send_transaction_args = signer_module::ArgsSendTransactionAndWait {
        tx: input.tx,
        connection: input.connection,
    };

    match SignerModule::send_transaction_and_wait(&send_transaction_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn sign_message(input: ArgsSignMessage) -> String {
    let sign_message_args = signer_module::ArgsSignMessage {
        message: input.message,
        connection: input.connection,
    };

    match SignerModule::sign_message(&sign_message_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}

pub fn send_rpc(input: ArgsSendRpc) -> Option<String> {
    let send_rpc_args = signer_module::ArgsSendRPC {
        method: input.method,
        params: input.params,
        connection: input.connection,
    };

    match SignerModule::send_r_p_c(&send_rpc_args) {
        Ok(result) => result,
        Err(e) => panic!("{}", e),
    }
}
