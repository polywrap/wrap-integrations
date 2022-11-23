use crate::provider::PolywrapProvider;
use crate::wrap::{Access, Log as TxLog, TxReceipt, TxRequest, TxResponse};
use ethers_core::types::{
    transaction::eip2718::TypedTransaction, Bytes, Log, NameOrAddress, Transaction,
    TransactionReceipt, TransactionRequest, H160, U256, U64,
};
use ethers_providers::{Middleware, Provider};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

pub fn from_wrap_request(request: TxRequest) -> TypedTransaction {
    TransactionRequest {
        from: request.from.map(|v| H160::from_str(&v).unwrap()),
        to: request
            .to
            .map(|v| NameOrAddress::Address(H160::from_str(&v).unwrap())),
        gas: request
            .gas_limit
            .map(|v| U256::from_str(&v.to_string()).unwrap()),
        gas_price: request
            .gas_price
            .map(|v| U256::from_str(&v.to_string()).unwrap()),
        value: request
            .value
            .map(|v| U256::from_str(&v.to_string()).unwrap()),
        data: request.data.map(|v| Bytes::from_str(&v).unwrap()),
        nonce: request.nonce.map(Into::into),
        chain_id: request
            .chain_id
            .map(|v| U64::from_str(&v.to_string()).unwrap()),
    }
    .into()
}

fn to_wrap_log(log: &Log) -> TxLog {
    TxLog {
        block_number: BigInt::from_str(&log.block_number.unwrap().to_string()).unwrap(),
        block_hash: log.block_hash.unwrap().to_string(),
        transaction_index: log.transaction_index.unwrap().as_u32(),
        removed: log.removed.unwrap(),
        address: format!("{:?}", log.address),
        data: format!("{:?}", log.data),
        topics: log.topics.iter().map(|v| v.to_string()).collect(),
        transaction_hash: log.transaction_hash.unwrap().to_string(),
        log_index: log.log_index.unwrap().as_u32(),
    }
}

pub fn to_wrap_receipt(receipt: TransactionReceipt) -> TxReceipt {
    TxReceipt {
        to: match receipt.to {
            Some(addr) => addr.to_string(),
            None => "".to_owned(),
        },
        from: receipt.from.to_string(),
        contract_address: match receipt.contract_address {
            Some(addr) => addr.to_string(),
            None => "".to_owned(),
        },
        transaction_index: receipt.transaction_index.as_u32(),
        root: receipt.root.map(|v| v.to_string()),
        gas_used: BigInt::from_str(&receipt.gas_used.unwrap().to_string()).unwrap(),
        logs_bloom: format!("{}", receipt.logs_bloom),
        transaction_hash: receipt.transaction_hash.to_string(),
        logs: receipt.logs.iter().map(|v| to_wrap_log(v)).collect(),
        block_number: BigInt::from_str(&receipt.block_number.unwrap().to_string()).unwrap(),
        block_hash: receipt.block_hash.unwrap().to_string(),
        confirmations: 1,
        cumulative_gas_used: BigInt::from_str(&receipt.cumulative_gas_used.to_string()).unwrap(),
        effective_gas_price: BigInt::from_str(&match receipt.effective_gas_price {
            Some(price) => price.to_string(),
            None => "0".to_owned(),
        })
        .unwrap(),
        byzantium: true,
        _type: match receipt.transaction_type {
            Some(U64([1])) => 1,
            _ => 0,
        },
        status: receipt.status.map(|v| v.as_u32()),
    }
}

pub async fn to_wrap_response(
    response: Transaction,
    data: Option<Bytes>,
    raw: Option<Bytes>,
) -> TxResponse {
    let provider = Provider::new(PolywrapProvider {});
    let block = match response.block_hash {
        Some(h) => provider.get_block(h).await.ok(),
        None => None,
    }
    .flatten();
    let chain_id = provider.get_chainid().await.unwrap();
    TxResponse {
        hash: format!("{:?}", response.hash),
        to: response.to.map(|v| format!("{:?}", v)),
        from: format!("{:?}", response.from),
        nonce: response.nonce.as_u32(),
        gas_limit: BigInt::from_str(&response.gas.to_string()).unwrap(),
        gas_price: response
            .gas_price
            .map(|v| BigInt::from_str(&v.to_string()).unwrap()),
        data: match data {
            Some(b) => format!("{}", b),
            None => "".to_string(),
        },
        value: BigInt::from_str(&response.value.to_string()).unwrap(),
        chain_id: BigInt::from_str(&response.chain_id.unwrap_or(chain_id).to_string()).unwrap(),
        block_number: response
            .block_number
            .map(|n| BigInt::from_str(&n.to_string()).unwrap()),
        block_hash: response.block_hash.map(|v| format!("{:?}", v)),
        timestamp: block.map(|v| v.timestamp.as_u32()),
        confirmations: 1,
        raw: raw.map(|v| format!("{}", v)),
        r: Some(response.v.to_string()),
        s: Some(response.v.to_string()),
        v: Some(response.v.as_u32()),
        _type: None,
        access_list: response.access_list.as_ref().map(|v| {
            v.0.iter()
                .map(|i| Access {
                    address: serde_json::to_string(&i.address).unwrap(),
                    storage_keys: i
                        .storage_keys
                        .iter()
                        .map(|k| serde_json::to_string(&k).unwrap())
                        .collect(),
                })
                .collect()
        }),
    }
}
