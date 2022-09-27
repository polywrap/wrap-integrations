use crate::provider::PolywrapProvider;
use crate::wrap::{Access, TxResponse};
use ethers_core::types::{Bytes, Transaction};
use ethers_providers::{Middleware, Provider};
use polywrap_wasm_rs::BigInt;
use std::str::FromStr;

pub async fn to_tx_response(data: Bytes, raw: Bytes, response: Transaction) -> TxResponse {
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
