use ethers_core::types::U256;
use ethers_providers::{Middleware, Provider};

pub mod provider;
pub mod task;
pub mod wrap;
use wrap::*;

use task::spawn_local;
use wrap::ArgsChainId;

pub fn chain_id(input: ArgsChainId) -> String {
    futures::executor::block_on(async {
        let p = Provider::new(provider::Provider {});
        let id: U256 = p.get_chainid().await.unwrap();
        id.to_string()
    })
}
