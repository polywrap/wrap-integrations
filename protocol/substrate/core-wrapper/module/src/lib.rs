pub mod wrap;
use wrap::imported::*;
pub use wrap::*;
use polywrap_wasm_rs::wrap_debug_log;

use api::BaseApi;
use serde_json::Value;

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

pub fn chain_get_metadata(url: ArgsChainGetMetadata) -> Option<ChainMetadataOutput> {
    debug!("url: {:?}", url);
    let metadata = BaseApi::new("http://localhost:9933").fetch_metadata();
    debug!("metadata: {:?}", metadata);
    Some(ChainMetadataOutput {
        metadata: Value::Null,
        pallets: Value::Null,
        events: vec![],
        errors: vec![],
    })
}
