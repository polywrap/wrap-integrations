use crate::provider::PolywrapProvider;
use crate::wrap::{Access, TxResponse, TxRequest, TxReceipt};
use ethers_core::types::{Bytes, Transaction, TransactionRequest, Log};
use ethers_providers::{Middleware, Provider};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

pub fn from_wrap_request(request: TxRequest) -> TypedTransaction {
    TransactionRequest {
        from: request.from.map(|v| H160::from_str(v).unwrap()),
        to: request.to.(|v| NameOrAddress::from_str(v).unwrap()),
        gas: request.gas_limit.map(Into::into),
        gas_price: request.gas_price.map(Into::into),
        value: request.value.map(|v| U256::from_str(v.to_string()).unwrap()),
        data: request.data(|v| Bytes::from_str(v).unwrap()),
        nonce: request.nonce.map(Into::into),
        chain_id: request.chain_id.map(|v| U64::from_str(v.to_string())),
        fee_currency: None,
        gateway_fee_recipient: None,
        gateway_fee: None
    }.into()
}

fn to_wrap_log(log: Log) -> wrap::Log {
    wrap::Log {
        block_number: log.block_number.unwrap().into(),
        block_hash: log.block_hash.unwrap().into(),
        transaction_index: log.transaction_index.unwrap().into(),
        removed: log.transaction_index.unwrap(),
        address: format!("{:?}", log.address),
        data: format!("{:?}", log.data),
        topics: log.topics.map(|v| v.to_string()),
        transaction_hash: log.transaction_hash.unwrap().to_string(),
        log_index: log.log_index.unwrap().as_u32(),
    }
}

pub fn to_wrap_receipt(receipt: TransactionReceipt) -> TxReceipt {
    TxReceipt {
        to: receipt.to.map(Into::into),
        from: receipt.from.into(),
        contract_address: receipt.contract_address.unwrap().into(),
        transaction_index: receipt.transaction_index.into(),
        root: receipt.root.map(Into::into),
        gas_used: receipt.gas_used.map(Into::into),
        logs_bloom: format!("{}", receipt.logs_bloom),
        transaction_hash: receipt.transaction_hash.to_string(),
        logs: receipt.logs.map(|v| to_log(v)),
        block_number: receipt.block_number.unwrap().to_string().into(),
        block_hash: receipt.block_hash.unwrap().to_string(),
        confirmations: 1,
        cumulative_gas_used: receipt.cumulative_gas_used.to_string().into(),
        effective_gas_price: receipt.effective_gas_price.to_string().into(),
        byzantium: true,
        _type: match receipt.transaction_type { Some(1) => 1, _ => 0 },
        status: receipt.status.map(Into::into)
    }
}

pub async fn to_wrap_response(data: Bytes, raw: Bytes, response: Transaction) -> TxResponse {
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
        data: format!("{}", data),
        value: BigInt::from_str(&response.value.to_string()).unwrap(),
        chain_id: BigInt::from_str(&response.chain_id.unwrap_or(chain_id).to_string()).unwrap(),
        block_number: response
            .block_number
            .map(|n| BigInt::from_str(&n.to_string()).unwrap()),
        block_hash: response.block_hash.map(|v| format!("{:?}", v)),
        timestamp: block.map(|v| v.timestamp.as_u32()),
        confirmations: 1,
        raw: Some(format!("{}", raw)),
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
