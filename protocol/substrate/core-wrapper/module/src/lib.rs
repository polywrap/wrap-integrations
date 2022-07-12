pub mod wrap;
use wrap::imported::*;
pub use wrap::*;

pub use api::Api;
use api::BaseApi;
pub use error::Error;
use serde_json::Value;
use sp_runtime::traits::BlakeTwo256;
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
/// [#901](https://github.com/polywrap/monorepo/issues/901)
pub fn custom_random_number(buf: &mut [u8]) -> Result<(), getrandom::Error> {
    for b in buf.iter_mut() {
        *b = 4;
    }
    Ok(())
}

pub fn chain_get_metadata(arg: ArgsChainGetMetadata) -> Option<ChainMetadataOutput> {
    let metadata = BaseApi::new(&arg.url).fetch_metadata();
    let meta = metadata.ok().flatten().expect("must have a metadata");

    let meta_json = serde_json::to_value(meta.metadata).expect("unable to convert to json");
    let pallet_json = serde_json::to_value(meta.pallets).expect("unable to convert to json");

    let events = meta.events.into_values().collect::<Vec<_>>();
    let events_json = serde_json::to_value(events).expect("unable to convert to json");
    let errors = meta.errors.into_values().collect::<Vec<_>>();
    let errors_json = serde_json::to_value(errors).expect("unable to convert to json");

    Some(ChainMetadataOutput {
        metadata: meta_json,
        pallets: pallet_json,
        events: events_json,
        errors: errors_json,
    })
}

pub fn state_get_runtime_version() {}

pub fn rpc_methods() {}

pub fn block_hash(arg: ArgsBlockHash) -> Option<String> {
    let api = BaseApi::new(&arg.url);
    let block_hash = api.fetch_block_hash(arg.number);
    block_hash.ok().flatten().map(|h| h.to_string())
}

pub fn chain_get_block(arg: ArgsChainGetBlock) -> Option<BlockOutput> {
    let api = BaseApi::new(&arg.url);
    let block = api.fetch_opaque_block(arg.number);
    block.ok().flatten().map(|block| BlockOutput { block })
}

pub fn balance_transfer() {}

pub fn state_get_storage_value() {}
pub fn state_get_storage_map() {}
