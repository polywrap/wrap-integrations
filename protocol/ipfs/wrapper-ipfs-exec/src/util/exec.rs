use std::fmt::Debug;
use crate::{Concurrent, ConcurrentReturnWhen, ConcurrentTaskResult};
use crate::imported::ArgsResult;
use crate::wrap::imported::{ConcurrentTask, ConcurrentModule, ArgsSchedule};

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
    task_func: &dyn Fn(&str) -> ConcurrentTask,
    result_func: fn(&ConcurrentTaskResult) -> Result<TReturn, String>
) -> TReturn {
    // get Concurrent implementation
    let impls = Concurrent::get_implementations();
    if impls.len() < 1 {
        panic!("Parallel execution requires an implementation of the Concurrent interface. \
         You can declare an interface implementation in your Polywrap Client configuration.");
    }
    let concurrent_module = ConcurrentModule::new(impls[0].as_str());

    // schedule tasks
    let mut tasks: Vec<ConcurrentTask> = Vec::new();
    for &provider in &providers {
        tasks.push(task_func(provider));
    }
    let task_ids: Vec<i32> = concurrent_module
        .schedule(&ArgsSchedule { tasks })
        .unwrap_or_else(|e| panic!("{}", e));

    // request task results
    let return_when = ConcurrentReturnWhen::ANY_COMPLETED;
    let results: Vec<ConcurrentTaskResult> = concurrent_module
        .result(&ArgsResult { task_ids: task_ids.clone(), return_when })
        .unwrap_or_else(|e| panic!("{}", e));

    // return completed result value or panic
    let mut errors: Vec<String> = Vec::new();
    for i in 0..results.len() {
        let result = result_func(&results[i]);
        if result.is_ok() {
            return result.unwrap();
        }
        errors.push(result.unwrap_err());
    }
    panic!("{}", errors.join("\n"));
}

pub fn build_exec_error(operation: &str, provider: &str, timeout: u32, error: &str) -> String  {
    return format!("An error occurred\nOperation: {}\nProvider: {}\nTimeout: {}\nError: {}",
                   operation,
                   provider,
                   timeout,
                   error
    );
}