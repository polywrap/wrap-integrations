pub mod wrap;
use wrap::imported::*;
pub use wrap::*;

pub use api::Api;
use api::BaseApi;
pub use error::Error;
use serde_json::Value;
pub use types::metadata::Metadata;

mod api;
mod error;
mod types;
mod utils;

#[macro_export]
macro_rules! debug {
    ($($arg: expr),*) => {
        polywrap_wasm_rs::wrap_debug_log(&format!($($arg,)*));
    }
}

getrandom::register_custom_getrandom!(custom_random_number);

/// TODO: use polywraps random plugin for this
pub fn custom_random_number(buf: &mut [u8]) -> Result<(), getrandom::Error> {
    for b in buf.iter_mut() {
        *b = 4;
    }
    Ok(())
}

pub fn chain_get_metadata(url: ArgsChainGetMetadata) -> Option<ChainMetadataOutput> {
    debug!("url: {:?}", url);
    let metadata = BaseApi::new("http://localhost:9933").fetch_metadata();
    debug!("metadata: {:?}", metadata);

    let api = BaseApi::new("http://localhost:9933");
    let block_hash = api.fetch_block_hash(0);
    debug!("block_hash: {:?}", block_hash);
    Some(ChainMetadataOutput {
        metadata: Value::Null,
        pallets: Value::Null,
        events: vec![],
        errors: vec![],
    })
}

pub fn state_get_runtime_version() {}

pub fn rpc_methods() {}

pub fn block_hash(arg: ArgsBlockHash) -> Option<String> {
    let api = BaseApi::new("http://localhost:9933");
    let block_hash = api.fetch_block_hash(0);
    block_hash.ok().flatten().map(|h| h.to_string())
}

pub fn balance_transfer() {}

pub fn state_get_storage_value() {}
pub fn state_get_storage_map() {}
