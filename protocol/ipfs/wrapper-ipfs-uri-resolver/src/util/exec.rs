use crate::wrap::{
    Concurrent,
    ConcurrentModule,
    ConcurrentReturnWhen,
    ConcurrentTask,
    ConcurrentTaskResult,
};
use crate::wrap::imported::{ArgsSchedule, ArgsResult};
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
    // get Concurrent implementation
    let impls = Concurrent::get_implementations();
    if impls.len() < 1 {
        println!("Parallel execution is not available. Executing sequentially instead. \
        Parallel execution requires an implementation of the Concurrent interface. \
        You can declare an interface implementation in your Polywrap Client configuration.");
        return exec_sequential(providers, cid, timeout);
    }
    let concurrent_module = ConcurrentModule::new(impls[0].as_str());

    // schedule tasks
    let mut tasks: Vec<ConcurrentTask> = Vec::new();
    for &provider in providers {
        tasks.push(cat_task(provider, cid, timeout));
    }
    let task_ids: Vec<i32> = concurrent_module.schedule(&ArgsSchedule { tasks })?;

    // request task results
    let return_when = ConcurrentReturnWhen::ANY_COMPLETED;
    let result_args = &ArgsResult { task_ids: task_ids.clone(), return_when };
    let results: Vec<ConcurrentTaskResult> = concurrent_module.result(result_args)?;

    // return completed result value or panic
    let mut errors: Vec<String> = Vec::new();
    for i in 0..results.len() {
        let result = cat_task_result(&results[i]);
        if result.is_ok() {
            return result;
        }
        let error = build_exec_error(providers[i], timeout, result.unwrap_err().as_str());
        errors.push(error);
    }
    return Err(errors.join("\n"));
}

fn build_exec_error(provider: &str, timeout: u32, error: &str) -> String  {
    return format!("An error occurred\nOperation: cat\nProvider: {}\nTimeout: {}\nError: {}",
                   provider,
                   timeout,
                   error
    );
}