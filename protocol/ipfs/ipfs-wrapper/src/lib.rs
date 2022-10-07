pub mod wrap;
pub use wrap::*;
pub mod util;
pub use util::*;

pub fn cat(args: ArgsCat, env: Env) -> Vec<u8> {
    let options: Options = get_options(&args.options, &env);
    if options.disable_parallel_requests {
        return exec_sequential(
            options.providers,
            &|provider: &str| exec_cat(provider, args.cid.as_ref())
        );
    }
    return vec![0u8];
}

pub fn resolve(args: ArgsResolve, env: Env) -> Option<IpfsResolveResult> {
    let options: Options = get_options(&args.options, &env);
    if options.disable_parallel_requests {
        let resolve_result = exec_sequential(
            options.providers,
            &|provider: &str| exec_resolve(provider, args.cid.as_ref(), options.timeout)
        );
        return Some(resolve_result);
    }
    None
}

pub fn add_file(args: ArgsAddFile, env: Env) -> String {
    let options: Options = get_options(&None, &env);
    if options.disable_parallel_requests {
        return exec_sequential(
            options.providers,
            &|provider: &str| exec_add_file(provider, &args.data)
        );
    }
    String::from("")
}
