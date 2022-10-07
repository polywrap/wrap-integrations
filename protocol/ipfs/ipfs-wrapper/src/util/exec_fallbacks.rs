use std::fmt::Debug;

pub fn exec_fallbacks<TReturn: Debug>(
    providers: Vec<&str>,
    disable_parallel_requests: bool,
    func: &dyn Fn(&str) -> Result<TReturn, String>
) -> TReturn {
    if disable_parallel_requests {
        return exec_sequential(providers, func);
    }
    return exec_parallel(providers, func);
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

pub fn exec_parallel<TReturn: Debug>(
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