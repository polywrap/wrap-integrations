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
        let err_string: String = result.unwrap_err();
        let error = build_exec_error(&provider, timeout, err_string.as_str());
        errors.push(error);
    }
    return Err(errors.join("\n"));
}

pub fn exec_parallel(
    providers: &Vec<&str>,
    cid: &str,
    timeout: u32,
) -> Result<Vec<u8>, String> {
    return exec_sequential(providers, cid, timeout);
}

fn build_exec_error(provider: &str, timeout: u32, error: &str) -> String  {
    return format!("An error occurred\nOperation: cat\nProvider: {}\nTimeout: {}\nError: {}",
                   provider,
                   timeout,
                   error
    );
}