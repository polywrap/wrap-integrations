use crate::wrap::imported::{
    ConcurrentTask,
    ConcurrentTaskResult,
    ConcurrentTaskStatus,
    ClientAddOptions,
    ClientAddResult,
    ClientFileEntry,
};
use crate::wrap::imported::client_module::{
    ClientModule,
    ArgsAddFile as ClientArgsAddFile,
    deserialize_add_file_result,
    serialize_add_file_args,
};
use crate::util::build_exec_error;

pub fn add_file_args(ipfs_provider: &str, bytes: &Vec<u8>, timeout: u32) -> ClientArgsAddFile {
    ClientArgsAddFile {
        data: ClientFileEntry {
            name: String::from("file"),
            data: bytes.to_vec(),
        },
        ipfs_provider: ipfs_provider.to_string(),
        timeout: Some(timeout),
        add_options: None,
    }
}

pub fn exec_add_file(ipfs_provider: &str, bytes: &Vec<u8>, timeout: u32) -> Result<String, String> {
    let result = ClientModule::add_file(&add_file_args(ipfs_provider, bytes, timeout));
    if result.is_err() {
        let error = build_exec_error("addFile", ipfs_provider, timeout, result.unwrap_err().as_ref());
        return Err(error);
    }
    Ok(result.unwrap().hash)
}

pub fn add_file_task(ipfs_provider: &str, bytes: &Vec<u8>, timeout: u32) -> ConcurrentTask {
    ConcurrentTask {
        uri: String::from("ens/ipfs-client.polywrap.eth"),
        method: String::from("addFile"),
        args: serialize_add_file_args(&add_file_args(ipfs_provider, bytes, timeout)).unwrap()
    }
}

pub fn add_file_task_result(task_result: &ConcurrentTaskResult, ipfs_provider: &str) -> Result<String, String> {
    if matches!(task_result.status, ConcurrentTaskStatus::COMPLETED) {
        return match &task_result.result {
            Some(result) => {
                let add_result: ClientAddResult = deserialize_add_file_result(result.as_ref()).unwrap();
                Ok(add_result.hash)
            },
            None => Err(String::from("Received empty result from concurrent task"))
        };
    }
    return match &task_result.error {
        Some(error) => Err(error.to_string()),
        None => Err(String::from("Received empty result from concurrent task"))
    };
}
