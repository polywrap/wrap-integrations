use super::wrap::imported::{ArgsSendTransaction, ArgsSendTransactionAndWait,
  SignerModule, signer_tx_receipt, signer_tx_response, ArgsCallContractView};
use super::mapping::to_tx_request;
use super::utils::{encode_function_args, tokenize_str_args, contract_call_to_tx, get_address};

use ethers_core::{
  abi::{AbiParser, ParamType, encode},
  utils::{parse_ether, format_ether},
  types::{transaction::request::TransactionRequest, Bytes, Address, U256}
};
use std::str::FromStr;
use polywrap_wasm_rs::{BigInt};

pub fn call_contract_view(input: super::wrap::ArgsCallContractView) -> String {
  let tx_request = contract_call_to_tx(&input.address, &input.method, input.args);

  let contract_call_args = ArgsCallContractView {
    address: tx_request.to.unwrap(),
    method: tx_request.data.unwrap(),
    args: None,
    connection: input.connection
  };

  match super::wrap::imported::SignerModule::call_contract_view(&contract_call_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn call_contract_static(input: super::wrap::ArgsCallContractStatic) -> super::wrap::imported::signer_static_tx_result::SignerStaticTxResult {
  let to = match Address::from_str(&input.address) {
    Ok(a) => a,
    Err(e) => panic!("Invalid contract address: {}. Error: {}", &input.address, e)
  };

  let contract_call_args = super::wrap::imported::signer_module::ArgsCallContractStatic {
    address: to.to_string(),
    method: input.method,
    args: input.args,
    connection: input.connection,
    tx_overrides: input.tx_overrides
  };

  match SignerModule::call_contract_static(&contract_call_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn encode_params(input: super::wrap::ArgsEncodeParams) -> String {
  //Ethers's parse_param function is private. So we parse a mock function to extract the param_types
  let types_str = input.types.join(", ");
  let mock_function = AbiParser::default().parse_function(&format!("foo({})", types_str)).unwrap();

  match tokenize_str_args(
    mock_function.inputs.clone().into_iter().map(|x| x.kind).collect(),
    input.values.clone()) {
      Ok(data) => String::from_utf8(encode(&data)).unwrap(),
      Err(e) => panic!("Error tokenizing args: {}. Error: {}", input.values.join(", "), e)
  }
}

pub fn encode_function(input: super::wrap::ArgsEncodeFunction) -> String {
  let args = match input.args {
    Some(a) => a,
    None => vec![]
  };

  match encode_function_args(&input.method, args) {
    Ok(data) => String::from_utf8(data.to_vec()).unwrap(),
    Err(e) => panic!("Error encoding function '{}'. Error: {}", &input.method, e)
  }
}

pub fn get_signer_address(input: super::wrap::ArgsGetSignerAddress) -> String {
  match SignerModule::get_signer_address(&super::wrap::imported::signer_module::ArgsGetSignerAddress {
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn get_signer_balance(input: super::wrap::ArgsGetSignerBalance) -> BigInt {
  match SignerModule::get_signer_balance(&super::wrap::imported::signer_module::ArgsGetSignerBalance {
    block_tag: input.block_tag,
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn get_signer_transaction_count(input: super::wrap::ArgsGetSignerTransactionCount) -> BigInt {
  match SignerModule::get_signer_transaction_count(&super::wrap::imported::signer_module::ArgsGetSignerTransactionCount {
    block_tag: input.block_tag,
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn get_gas_price(input: super::wrap::ArgsGetGasPrice) -> BigInt {
  match SignerModule::get_gas_price(&super::wrap::imported::signer_module::ArgsGetGasPrice {
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn estimate_transaction_gas(input: super::wrap::ArgsEstimateTransactionGas) -> BigInt {
  match SignerModule::estimate_transaction_gas(&super::wrap::imported::signer_module::ArgsEstimateTransactionGas {
    tx: input.tx,
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn estimate_contract_call_gas(input: super::wrap::ArgsEstimateContractCallGas) -> BigInt {
  let contract_call_estimate_args = super::wrap::imported::signer_module::ArgsEstimateTransactionGas {
    tx: contract_call_to_tx(&input.address, &input.method, input.args),
    connection: input.connection
  };
  
  match SignerModule::estimate_transaction_gas(&contract_call_estimate_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn check_address(input: super::wrap::ArgsCheckAddress) -> bool {
  match get_address(&input.address) {
    Ok(a) => true,
    Err(e) => false
  }
}

pub fn to_wei(input: super::wrap::ArgsToWei) -> String {
  match parse_ether(input.eth) {
    Ok(wei) => wei.to_string(),
    Err(e) => panic!("{}", e)
  }
}

pub fn to_eth(input: super::wrap::ArgsToEth) -> String {
  let wei = match U256::from_dec_str(&input.wei) {
    Ok(w) => w,
    Err(_) => panic!("Invalid Wei number: {}", input.wei)
  };

  format_ether(wei).to_string()
}

pub fn await_transaction(input: super::wrap::ArgsAwaitTransaction) -> super::wrap::imported::signer_tx_receipt::SignerTxReceipt {
  match SignerModule::await_transaction(&super::wrap::imported::signer_module::ArgsAwaitTransaction {
    tx_hash: input.tx_hash,
    confirmations: input.confirmations,
    timeout: input.timeout,
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn wait_for_event(input: super::wrap::ArgsWaitForEvent) -> super::wrap::imported::signer_event_notification::SignerEventNotification {
  match SignerModule::wait_for_event(&super::wrap::imported::signer_module::ArgsWaitForEvent {
    address: input.address,
    event: input.event,
    args: input.args,
    timeout: input.timeout,
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn get_network(input: super::wrap::ArgsGetNetwork) -> super::wrap::imported::signer_network::SignerNetwork {
  match SignerModule::get_network(&super::wrap::imported::signer_module::ArgsGetNetwork {
    connection: input.connection
  }) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn deploy_contract(input: super::wrap::ArgsDeployContract) -> signer_tx_receipt::SignerTxReceipt {
  let abi = AbiParser::default().parse_str(&input.abi).unwrap();
  let args_list = match input.args {
    Some(a) => a,
    None => vec![]
  };
  let bytecode = Bytes::from_str(&input.bytecode).unwrap();
  
  let data: Bytes = match (abi.constructor(), args_list.is_empty()) {
    (None, false) => panic!("Constructor error"),
    (None, true) => bytecode.clone(),
    (Some(constructor), _) => {
        let param_types: Vec<ParamType> = constructor.inputs.clone().into_iter().map(|x| x.kind).collect();
        let str_args = tokenize_str_args(param_types, args_list).unwrap();

        constructor.encode_input(bytecode.to_vec(), &str_args).unwrap().into()
    }
  };
  
  let tx = TransactionRequest { to: None, data: Some(data), ..Default::default() };
  let tx_request = to_tx_request(tx);

  let send_transaction_args = ArgsSendTransactionAndWait {
    tx: tx_request,
    connection: input.connection
  };

  match SignerModule::send_transaction_and_wait(&send_transaction_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn call_contract_method(input: super::wrap::ArgsCallContractMethod) -> signer_tx_response::SignerTxResponse {
  let tx_request = contract_call_to_tx(&input.address, &input.method, input.args);

  let send_transaction_args = ArgsSendTransaction {
    tx: tx_request,
    connection: input.connection
  };

  match SignerModule::send_transaction(&send_transaction_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn call_contract_method_and_wait(input: super::wrap::ArgsCallContractMethodAndWait) -> signer_tx_receipt::SignerTxReceipt {
  let tx_request = contract_call_to_tx(&input.address, &input.method, input.args);

  let send_transaction_args = ArgsSendTransactionAndWait {
    tx: tx_request,
    connection: input.connection
  };

  match SignerModule::send_transaction_and_wait(&send_transaction_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn send_transaction(input: super::wrap::ArgsSendTransaction) -> signer_tx_response::SignerTxResponse {
  let send_transaction_args = ArgsSendTransaction {
    tx: input.tx,
    connection: input.connection
  };

  match SignerModule::send_transaction(&send_transaction_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn send_transaction_and_wait(input: super::wrap::ArgsSendTransactionAndWait) -> signer_tx_receipt::SignerTxReceipt {
  let send_transaction_args = ArgsSendTransactionAndWait {
    tx: input.tx,
    connection: input.connection
  };

  match SignerModule::send_transaction_and_wait(&send_transaction_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn sign_message(input: super::wrap::ArgsSignMessage) -> String {
  let sign_message_args = super::wrap::imported::signer_module::ArgsSignMessage {
    message: input.message,
    connection: input.connection
  };

  match SignerModule::sign_message(&sign_message_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}

pub fn send_rpc(input: super::wrap::ArgsSendRpc) -> Option<String> {
  let send_rpc_args = super::wrap::imported::signer_module::ArgsSendRPC {
    method: input.method,
    params: input.params,
    connection: input.connection
  };

  match SignerModule::send_r_p_c(&send_rpc_args) {
    Ok(result) => result,
    Err(e) => panic!("{}", e)
  }
}