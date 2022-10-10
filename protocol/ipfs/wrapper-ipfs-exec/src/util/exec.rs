use std::fmt::Debug;
use crate::{ConcurrentReturnWhen, ConcurrentTaskResult};
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
    result_func: fn(&ConcurrentTaskResult, &str) -> Result<TReturn, String>
) -> TReturn {
    // schedule tasks
    let mut tasks: Vec<ConcurrentTask> = Vec::new();
    for provider in &providers {
        tasks.push(task_func(provider));
    }

    let task_ids: Vec<i32> = ConcurrentModule::schedule(&ArgsSchedule { tasks })
        .unwrap_or_else(|e| panic!("{}", e));

    // request task results
    let return_when = ConcurrentReturnWhen::ANY_COMPLETED;
    let results: Vec<ConcurrentTaskResult> = ConcurrentModule::result(&ArgsResult { task_ids, return_when })
        .unwrap_or_else(|e| panic!("{}", e));

    // return completed result value or panic
    let mut errors: Vec<String> = Vec::new();
    for i in 0..results.len() {
        let result = result_func(&results[i], providers[i]);
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