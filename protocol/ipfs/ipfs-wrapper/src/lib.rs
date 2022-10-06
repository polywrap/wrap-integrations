pub mod wrap;
pub use wrap::*;
pub mod util;
pub use util::*;

// cat(cid: String!, options: Options): Bytes!
pub fn cat(args: ArgsCat, env: Env) -> Vec<u8> {
    let options: Options = get_options(&args.options, &env);
    return vec![0u8];
}

// resolve(cid: String!, options: Options): ResolveResult
pub fn resolve(args: ArgsResolve, env: Env) -> Option<IpfsResolveResult> {
    let options: Options = get_options(&args.options, &env);
    return Some(IpfsResolveResult {
        cid: String::from(""),
        provider: String::from(""),
    });
}

// addFile(data: Bytes!): String!
pub fn add_file(args: ArgsAddFile, env: Env) -> String {
    let options: Options = get_options(&None, &env);
    return String::from("");
}
