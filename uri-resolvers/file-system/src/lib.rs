pub mod wrap;
pub use wrap::{
    *,
    imported::{
        ArgsGetFile,
        ArgsExists,
        ArgsReadFile
    }
};
use std::path::{Path, PathBuf};

const MANIFEST_SEARCH_PATTERN: &str = "wrap.info";

pub fn try_resolve_uri(args: ArgsTryResolveUri) -> Option<UriResolverMaybeUriOrManifest> {
    if args.authority != "fs" && args.authority != "file" {
        return None;
    }

    let base_path = Path::new(&args.path);
    let manifest_path = base_path
        .join(MANIFEST_SEARCH_PATTERN)
        .as_path()
        .to_str()
        .unwrap()
        .to_string();

    let exists = FileSystemModule::exists(&ArgsExists {
        path: manifest_path.clone()
    });

    if exists.is_err() || exists.unwrap() == false {
        return Some(UriResolverMaybeUriOrManifest {
            uri: None,
            manifest: None
        });
    }

    let bytes = FileSystemModule::read_file(&ArgsReadFile {
        path: manifest_path
    });

    if bytes.is_err() {
        return Some(UriResolverMaybeUriOrManifest {
            uri: None,
            manifest: None
        });
    }

    Some(UriResolverMaybeUriOrManifest {
        manifest: Some(bytes.unwrap()),
        uri: None
    })
}

pub fn get_file(args: ArgsGetFile) -> Option<Vec<u8>> {
    let res = FileSystemModule::read_file(&ArgsReadFile {
        path: args.path
    });

    if res.is_err() {
        return None;
    }

    Some(res.unwrap())
}
