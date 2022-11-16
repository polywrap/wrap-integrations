pub mod wrap;
pub use wrap::{*, imported::{ArgsGet}};
use std::path::{Path, PathBuf};
use base64::{decode};

const MANIFEST_SEARCH_PATTERN: &str = "wrap.info";

pub fn try_resolve_uri(args: ArgsTryResolveUri) -> Option<UriResolverMaybeUriOrManifest> {
    if args.authority != "http" && args.authority != "https" {
        return None;
    }

    let result = HttpModule::get(&ArgsGet {
        url: args.path + "/" + MANIFEST_SEARCH_PATTERN,
        request: Some(HttpHttpRequest{
            response_type: HttpHttpResponseType::BINARY,
            headers: None,
            url_params: None,
            body: None
        })
    });

    if result.is_err() {
        return Some(UriResolverMaybeUriOrManifest {
            uri: None,
            manifest: None
        });
    }

    let response = match result.unwrap() {
        None => return Some(UriResolverMaybeUriOrManifest {
            uri: None,
            manifest: None
        }),
        Some(x) => x
    };

    match response.body {
        None => return Some(UriResolverMaybeUriOrManifest {
            uri: None,
            manifest: None
        }),
        Some(body) => return Some(UriResolverMaybeUriOrManifest {
            uri: None,
            manifest: Some(decode(body).unwrap())
        })
    };
}

pub fn get_file(args: ArgsGetFile) -> Option<Vec<u8>> {
    let result = HttpModule::get(&ArgsGet {
        url: args.path,
        request: Some(HttpHttpRequest{
            response_type: HttpHttpResponseType::BINARY,
            headers: None,
            url_params: None,
            body: None
        })
    });

    if result.is_err() {
        return None;
    }

    let response = match result.unwrap() {
        None => return None,
        Some(x) => x
    };

    match response.body {
        None => return None,
        Some(body) => return Some(decode(body).unwrap())
    };
}
