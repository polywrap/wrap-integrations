pub mod wrap;
pub use wrap::*;
pub mod util;
pub use util::*;

pub fn cat(args: ArgsCat, env: Env) -> Vec<u8> {
    let options: Options = get_options(&args.options, &env);
    if options.disable_parallel_requests || options.providers.len() == 0 {
        let exec: &dyn Fn(&str) -> Result<Vec<u8>, String> =
            &|provider: &str| exec_cat(provider, args.cid.as_ref(), options.timeout);
        return exec_sequential(options.providers, exec);
    }
    let task: &dyn Fn(&str) -> ConcurrentTask =
        &|provider: &str| cat_task(provider, args.cid.as_ref(), options.timeout);
    return exec_parallel(options.providers, task, cat_task_result);
}

pub fn resolve(args: ArgsResolve, env: Env) -> Option<IpfsResolveResult> {
    let options: Options = get_options(&args.options, &env);
    if options.disable_parallel_requests || options.providers.len() == 0 {
        let exec: &dyn Fn(&str) -> Result<IpfsResolveResult, String> =
            &|provider: &str| exec_resolve(provider, args.cid.as_ref(), options.timeout);
        return Some(exec_sequential(options.providers, exec));
    }
    let task: &dyn Fn(&str) -> ConcurrentTask =
        &|provider: &str| resolve_task(provider, args.cid.as_ref(), options.timeout);
    return Some(exec_parallel(options.providers, task, resolve_task_result));
}

pub fn add_file(args: ArgsAddFile, env: Env) -> String {
    let options: Options = get_options(&None, &env);
    if options.disable_parallel_requests || options.providers.len() == 0 {
        let exec: &dyn Fn(&str) -> Result<String, String> =
            &|provider: &str| exec_add_file(provider, &args.data, options.timeout);
        return exec_sequential(options.providers, exec);
    }
    let task: &dyn Fn(&str) -> ConcurrentTask =
        &|provider: &str| add_file_task(provider, &args.data, options.timeout);
    return exec_parallel(options.providers, task, add_file_task_result);
}
