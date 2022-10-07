pub mod wrap;
pub use wrap::*;
pub mod util;
pub use util::*;

pub fn cat(args: ArgsCat, env: Env) -> Vec<u8> {
    let options: Options = get_options(&args.options, &env);
    let closure: &dyn Fn(&str) -> Result<Vec<u8>, String> =
        &|provider: &str| exec_cat(provider, args.cid.as_ref(), options.timeout);
    return exec_fallbacks(options.providers, options.disable_parallel_requests, closure);
}

pub fn resolve(args: ArgsResolve, env: Env) -> Option<IpfsResolveResult> {
    let options: Options = get_options(&args.options, &env);
    let closure: &dyn Fn(&str) -> Result<IpfsResolveResult, String> =
        &|provider: &str| exec_resolve(provider, args.cid.as_ref(), options.timeout);
    return Some(exec_fallbacks(options.providers, options.disable_parallel_requests, closure));
}

pub fn add_file(args: ArgsAddFile, env: Env) -> String {
    let options: Options = get_options(&None, &env);
    let closure: &dyn Fn(&str) -> Result<String, String> =
        &|provider: &str| exec_add_file(provider, &args.data, options.timeout);
    return exec_fallbacks(options.providers, options.disable_parallel_requests, closure);
}
