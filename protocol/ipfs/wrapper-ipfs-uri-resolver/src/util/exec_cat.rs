use crate::wrap::imported::{
    ConcurrentTask,
    ConcurrentTaskResult,
    ConcurrentTaskStatus,
};
use crate::wrap::imported::client_module::{
    ClientModule,
    ArgsCat as ClientArgsCat,
    deserialize_cat_result,
    serialize_cat_args,
};

pub fn exec_cat(ipfs_provider: &str, cid: &str, timeout: u32) -> Result<Vec<u8>, String> {
    return ClientModule::cat(&ClientArgsCat {
        cid: cid.to_string(),
        ipfs_provider: ipfs_provider.to_string(),
        timeout: Some(timeout),
    });
}

pub fn cat_task(ipfs_provider: &str, cid: &str, timeout: u32) -> ConcurrentTask {
    ConcurrentTask {
        uri: String::from("ens/ipfs-resolver-client.polywrap.eth"), // TODO: replace with interface
        method: String::from("cat"),
        args: serialize_cat_args(&ClientArgsCat {
            cid: cid.to_string(),
            ipfs_provider: ipfs_provider.to_string(),
            timeout: Some(timeout),
        }).unwrap()
    }
}

pub fn cat_task_result(task_result: &ConcurrentTaskResult) -> Result<Vec<u8>, String> {
    if matches!(task_result.status, ConcurrentTaskStatus::COMPLETED) {
        return match &task_result.result {
            Some(result) => Ok(deserialize_cat_result(result.as_ref()).unwrap()),
            None => Err(String::from("Received empty result from concurrent task"))
        };
    }
    return match &task_result.error {
        Some(error) => Err(error.to_string()),
        None => Err(String::from("Received empty result from concurrent task"))
    };
}