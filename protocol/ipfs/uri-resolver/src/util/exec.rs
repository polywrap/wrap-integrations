use std::future::Future;
use futures::future::{FutureExt, select_ok};
use futures::executor::block_on;
use futures::{pin_mut, TryFutureExt};
use crate::util::exec_cat::*;


pub fn exec_sequential(
    providers: &Vec<&str>,
    cid: &str,
    timeout: u32,
) -> Result<Vec<u8>, String> {
    let mut errors: Vec<String> = Vec::new();
    for provider in providers {
        let result: Result<Vec<u8>, String> = exec_cat(provider, cid, timeout);
        if result.is_ok() {
            return result;
        }
        errors.push(result.unwrap_err());
    }
    return Err(errors.join("\n"));
}

pub fn exec_parallel(
    providers: &Vec<&str>,
    cid: &str,
    timeout: u32,
) -> Result<Vec<u8>, String> {
    block_on(async {
        let primary = Box::pin(exec_cat_async(providers[0], cid, timeout));
        let mut futures = vec![primary];
        for i in 1..futures.len() {
           let provider = providers[i];
           let future = Box::pin(exec_cat_async(provider, cid, timeout));
           futures.push(future);
        }
        select_ok(futures)
            .await
            .map(|(item_resolved, _remaining_futures)| item_resolved)
    })
}