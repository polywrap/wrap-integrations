use crate::wrap::imported::{
    ConcurrentTask,
    ConcurrentTaskResult,
    ConcurrentTaskStatus,
    ClientCatOptions,
};
use crate::wrap::imported::client_module::{
    ClientModule,
    ArgsCat as ClientArgsCat,
    deserialize_cat_result,
    serialize_cat_args,
};
use crate::util::build_exec_error;

pub fn cat_args(ipfs_provider: &str, cid: &str, timeout: u32) -> ClientArgsCat {
    ClientArgsCat {
        cid: cid.to_string(),
        ipfs_provider: ipfs_provider.to_string(),
        timeout: Some(timeout),
        cat_options: None,
    }
}

pub fn exec_cat(ipfs_provider: &str, cid: &str, timeout: u32) -> Result<Vec<u8>, String> {
    let result = ClientModule::cat(&cat_args(ipfs_provider, cid, timeout));
    if result.is_err() {
        let error = build_exec_error("cat", ipfs_provider, timeout, result.unwrap_err().as_ref());
        return Err(error);
    }
    result
}

pub fn cat_task(ipfs_provider: &str, cid: &str, timeout: u32) -> ConcurrentTask {
    ConcurrentTask {
        uri: String::from("ens/ipfs-client.polywrap.eth"), // TODO: replace with interface
        method: String::from("cat"),
        args: serialize_cat_args(&cat_args(ipfs_provider, cid, timeout)).unwrap()
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