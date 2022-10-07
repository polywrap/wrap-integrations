use std::fmt::Debug;
use crate::options::Options;
use crate::wrap::imported::client_module::{
    ArgsCat as ClientArgsCat,
    ArgsResolve as ClientArgsResolve,
    ArgsAddFile as ClientArgsAddFile,
};
use crate::wrap::{
    ClientModule,
    ClientCatOptions,
    ClientResolveOptions,
    ClientAddOptions,
    ClientAddResult,
    ClientFileEntry,
    IpfsResolveResult
};

pub fn exec_cat(ipfs_provider: &str, cid: &str) -> Result<Vec<u8>, String> {
    let result = ClientModule::cat(&ClientArgsCat {
        cid: cid.to_owned(),
        ipfs_provider: ipfs_provider.to_owned(),
        cat_options: None,
    });
    if result.is_err() {
        let error = build_exec_error("cat", ipfs_provider, 0, result.unwrap_err().as_ref());
        return Err(error);
    }
    result
}

pub fn exec_resolve(ipfs_provider: &str, cid: &str, timeout: u32) -> Result<IpfsResolveResult, String> {
    let result = ClientModule::resolve(&ClientArgsResolve {
        cid: cid.to_owned(),
        ipfs_provider: ipfs_provider.to_owned(),
        resolve_options: Some(ClientResolveOptions {
            recursive: None,
            dht_record_count: None,
            dht_timeout: Some(format!("{}ms", timeout))
        }),
    });
    if result.is_err() {
        let error = build_exec_error("resolve", ipfs_provider, timeout, result.unwrap_err().as_ref());
        return Err(error);
    }
    Ok(IpfsResolveResult {
        cid: result.unwrap(),
        provider: String::from(ipfs_provider),
    })
}

pub fn exec_add_file(ipfs_provider: &str, bytes: &Vec<u8>) -> Result<String, String> {
    let result = ClientModule::add_file(&ClientArgsAddFile {
        data: ClientFileEntry {
            name: String::from("file"),
            data: bytes.to_owned()
        },
        ipfs_provider: ipfs_provider.to_owned(),
        add_options: None,
    });
    if result.is_err() {
        let error = build_exec_error("addFile", ipfs_provider, 0, result.unwrap_err().as_ref());
        return Err(error);
    }
    Ok(result.unwrap().hash)
}

pub fn exec_sequential<TReturn: Debug>(
    providers: Vec<&str>,
    func: &dyn Fn(&str) -> Result<TReturn, String>
) -> TReturn {
    let mut errors: Vec<String> = Vec::new();
    for provider in providers {
        let result = func(provider);
        if result.is_ok() {
            return result.unwrap();
        }
        errors.push(result.unwrap_err());
    }
    panic!("{}", errors.join("\n"));
}

fn build_exec_error(operation: &str, provider: &str, timeout: u32, error: &str) -> String  {
    return format!("An error occurred\nOperation: {}\nProvider: {}\nTimeout: {}\nError: {}",
        operation,
        provider,
        timeout,
        error
    );
}