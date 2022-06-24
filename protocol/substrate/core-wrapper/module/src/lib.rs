pub mod w3;
use w3::imported::*;
pub use w3::*;
use web3api_wasm_rs::w3_debug_log;

use api::BaseApi;
use serde_json::Value;

mod api;
mod error;
mod types;
mod utils;

#[macro_export]
macro_rules! debug {
    ($($arg: expr),*) => {
        web3api_wasm_rs::w3_debug_log(&format!($($arg,)*));
    }
}

pub fn chain_get_block_hash(input: InputChainGetBlockHash) -> CustomType {
    let url = String::from("https://jsonplaceholder.typicode.com/photos/1");

    let response = HttpQuery::get(&http_query::InputGet {
        url: url,
        request: Some(HttpRequest {
            response_type: HttpResponseType::TEXT,
            headers: Some(vec![HttpHeader {
                key: String::from("user-agent"),
                value: String::from("HttpDemo"),
            }]),
            url_params: Some(vec![HttpUrlParam {
                key: String::from("dummyQueryParam"),
                value: String::from("20"),
            }]),
            body: Some(String::from("")),
        }),
    })
    .unwrap()
    .unwrap();

    w3_debug_log("foo");

    CustomType {
        prop: response.body.unwrap(),
    }
}

pub fn chain_get_metadata(url: InputChainGetMetadata) -> Option<ChainMetadataOutput> {
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
