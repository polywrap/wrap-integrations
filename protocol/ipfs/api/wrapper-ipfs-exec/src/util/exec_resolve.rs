use crate::wrap::imported::{
    ConcurrentTask,
    ConcurrentTaskResult,
    ConcurrentTaskStatus,
    ClientResolveOptions,
    IpfsResolveResult,
};
use crate::wrap::imported::client_module::{
    ClientModule,
    ArgsResolve as ClientArgsResolve,
    serialize_resolve_args,
    deserialize_resolve_result,
};
use crate::util::build_exec_error;

pub fn resolve_args(ipfs_provider: &str, cid: &str, timeout: u32) -> ClientArgsResolve {
    ClientArgsResolve {
        cid: cid.to_string(),
        ipfs_provider: ipfs_provider.to_string(),
        timeout: Some(timeout),
        resolve_options: Some( ClientResolveOptions {
            dht_timeout: Some(format!("{}ms", timeout)),
            dht_record_count: None,
            recursive: None,
        }),
    }
}

pub fn exec_resolve(ipfs_provider: &str, cid: &str, timeout: u32) -> Result<IpfsResolveResult, String> {
    let result = ClientModule::resolve(&resolve_args(ipfs_provider, cid, timeout));
    if result.is_err() {
        let error = build_exec_error("resolve", ipfs_provider, timeout, result.unwrap_err().as_ref());
        return Err(error);
    }
    let resolve_result = result.unwrap();
    Ok(IpfsResolveResult {
        cid: resolve_result.cid,
        provider: resolve_result.provider,
    })
}

pub fn resolve_task(ipfs_provider: &str, cid: &str, timeout: u32) -> ConcurrentTask {
    ConcurrentTask {
        uri: String::from("ens/ipfs-client.polywrap.eth"), // TODO: replace with interface
        method: String::from("resolve"),
        args: serialize_resolve_args(&resolve_args(ipfs_provider, cid, timeout)).unwrap()
    }
}

pub fn resolve_task_result(task_result: &ConcurrentTaskResult) -> Result<IpfsResolveResult, String> {
    if matches!(task_result.status, ConcurrentTaskStatus::COMPLETED) {
        return match &task_result.result {
            Some(result) => {
                let resolve_result = deserialize_resolve_result(result.as_ref()).unwrap();
                Ok(IpfsResolveResult {
                    cid: resolve_result.cid,
                    provider: resolve_result.provider,
                })
            },
            None => Err(String::from("Received empty result from concurrent task"))
        };
    }
    return match &task_result.error {
        Some(error) => Err(error.to_string()),
        None => Err(String::from("Received empty result from concurrent task"))
    };
}
