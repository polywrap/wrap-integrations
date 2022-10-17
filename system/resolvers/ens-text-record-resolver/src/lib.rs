pub mod wrap;
use wrap::{*, imported::{ArgsGetResolver, ArgsGetTextRecord}};

const ENS_REGISTRY_ADDRESS: &str = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const POLYWRAP_TEXT_RECORD_PREFIX: &str = "wrap/";
const TEXT_RECORD_SEPARATOR: &str = ":";
const PATH_SEPARATOR: &str = "/";

struct TextRecordInfo {
    network_name: String,
    carry_over_path: String,
    domain: String,
    text_record_key: String
}

fn parse_uri(args: &ArgsTryResolveUri) -> Option<TextRecordInfo> {
    if args.authority != "ens" {
        return None;
    }

    let path_parts: Vec<&str> = args.path.split(PATH_SEPARATOR).collect();

    if path_parts.len() < 1 {
        return None;
    }

    let domain_or_network = path_parts[0];

    if domain_or_network.is_empty() {
        return None;
    }

    let network_name;
    let domain_and_text_record;
    let carry_over_path;

    if domain_or_network.contains(".eth") {
        network_name = "mainnet";
        domain_and_text_record = domain_or_network;
        carry_over_path = path_parts[1..].join(PATH_SEPARATOR);
    } else if path_parts.len() < 2 {
        return None;
    } else {
        network_name = domain_or_network;
        domain_and_text_record = path_parts[1];
        carry_over_path = path_parts[2..].join(PATH_SEPARATOR);
    };

    let domain_parts: Vec<&str> = domain_and_text_record.split(TEXT_RECORD_SEPARATOR).collect();
    let domain = domain_parts[0];
    let text_record_key = domain_parts[1];

    Some(
        TextRecordInfo {
            network_name: network_name.to_string(),
            carry_over_path: carry_over_path,
            domain: domain.to_string(),
            text_record_key: POLYWRAP_TEXT_RECORD_PREFIX.to_string() + text_record_key
         }
    )
}

// wrap://ens/test.eth:v1/wrap.info
// wrap://ens/goerli/test.eth:v1/wrap.info
pub fn try_resolve_uri(args: ArgsTryResolveUri) -> Option<UriResolverMaybeUriOrManifest> {
    _try_resolve_uri(&args, &ENSModule::get_resolver, &ENSModule::get_text_record)
}

fn _try_resolve_uri(
    args: &ArgsTryResolveUri, 
    get_resolver: &dyn Fn(&ArgsGetResolver) -> Result<String, String>,
    get_text_record:  &dyn Fn(&ArgsGetTextRecord) -> Result<String, String>
) -> Option<UriResolverMaybeUriOrManifest> {
    let text_record_info = parse_uri(args);

    if let None = text_record_info {
        return not_found(args);
    }

    let TextRecordInfo {
        network_name,
        carry_over_path,
        domain,
        text_record_key
    } = text_record_info.unwrap();

    let resolver_address = get_resolver(&ArgsGetResolver {
        registry_address: ENS_REGISTRY_ADDRESS.to_string(),
        domain: domain.to_string(),
        connection: network_to_connection(network_name.clone())
    });

    match resolver_address {
        Ok(resolver_address) => {
            let text_record = get_text_record(&ArgsGetTextRecord{
                domain: domain.to_string(),
                resolver_address,
                key: text_record_key.to_string(),
                connection: network_to_connection(network_name.clone())
            });
        
            match text_record {
                Ok(text_record) => {
                    if carry_over_path.is_empty() {
                        redirect(text_record)
                    } else {
                        redirect(text_record + "/" + &carry_over_path)
                    }
                }
                Err(_) => {
                    not_found(&args)
                }
            }
        },
        Err(_) => not_found(&args)
    }
}

fn not_found(args: &ArgsTryResolveUri) -> Option<UriResolverMaybeUriOrManifest> {
    return redirect("wrap://".to_string() + &args.authority + "/" + &args.path);
} 

fn network_to_connection<T: Into<String>>(network_name: T) -> Option<ENSEthereumConnection> {
    Some(ENSEthereumConnection {
        network_name_or_chain_id: Some(network_name.into()),
        node: None
    })
} 

fn redirect<T: Into<String>>(uri: T) -> Option<UriResolverMaybeUriOrManifest> {
    Some(UriResolverMaybeUriOrManifest {
        uri: Some(uri.into()),
        manifest: None
    })
} 

pub fn get_file(_: ArgsGetFile) -> Option<Vec<u8>> {
    None
}

#[cfg(test)]
mod tests {
    use crate::{TextRecordInfo, parse_uri, _try_resolve_uri};
    pub use crate::wrap::*;

    use self::imported::ArgsGetTextRecord;

    #[test]
    fn path_parse() {
        assert_parse_uri(
            &ArgsTryResolveUri {
                authority: "ens".to_string(),
                path: "domain.eth:some_key".to_string(),
            }, 
            &Some(
                TextRecordInfo {
                    network_name: "mainnet".to_string(),
                    carry_over_path: "".to_string(),
                    domain: "domain.eth".to_string(),
                    text_record_key: "polywrap/some_key".to_string()
                }
            )
        );
    }

    #[test]
    fn path_parse_netowork() {
        assert_parse_uri(
            &ArgsTryResolveUri {
                authority: "ens".to_string(),
                path: "domain.eth:some_key".to_string(),
            }, 
            &Some(
                TextRecordInfo {
                    network_name: "mainnet".to_string(),
                    carry_over_path: "".to_string(),
                    domain: "domain.eth".to_string(),
                    text_record_key: "polywrap/some_key".to_string()
                }
            )
        );
    }

    #[test]
    fn network_and_carry_over_path() {
        assert_parse_uri(
            &ArgsTryResolveUri {
                authority: "ens".to_string(),
                path: "goerli/domain.eth:some_key/dir/wrap.info".to_string(),
            }, 
            &Some(
                TextRecordInfo {
                    network_name: "goerli".to_string(),
                    carry_over_path: "dir/wrap.info".to_string(),
                    domain: "domain.eth".to_string(),
                    text_record_key: "polywrap/some_key".to_string()
                }
            )
        );
    }

    #[test]
    fn invalid_authority() {
        assert_parse_uri(
            &ArgsTryResolveUri {
                authority: "non_matched_authority".to_string(),
                path: "goerli/domain.eth:some_key/dir/wrap.info".to_string(),
            }, 
            &None
        );
    }

    #[test]
    fn not_found() {
        assert_resolve_uri(&ArgsTryResolveUri {
            authority: "ens".to_string(),
            path: "domain.eth:invalid_key".to_string(),
        },
        "polywrap/some_key".to_string(),
        "wrap://ens/test.eth".to_string(), 
        &Some(
            UriResolverMaybeUriOrManifest {
                uri: Some("wrap://ens/domain.eth:invalid_key".to_string()),
                manifest: None
            }
        ));
    }

    #[test]
    fn valid_redirect() {
        assert_resolve_uri(
            &ArgsTryResolveUri {
                authority: "ens".to_string(),
                path: "goerli/domain.eth:some_key".to_string(),
            },
            "polywrap/some_key".to_string(),
            "ipfs/Qmdasd".to_string(), 
            &Some(
                UriResolverMaybeUriOrManifest {
                    uri: Some("ipfs/Qmdasd".to_string()),
                    manifest: None
                }
            )
        );
    }

    #[test]
    fn valid_redirect_carry_over_path() {
        assert_resolve_uri(&ArgsTryResolveUri {
            authority: "ens".to_string(),
            path: "goerli/domain.eth:some_key/dir/wrap.info".to_string(),
        },
        "polywrap/some_key".to_string(),
        "ipfs/Qmdasd".to_string(), 
        &Some(
            UriResolverMaybeUriOrManifest {
                uri: Some("ipfs/Qmdasd/dir/wrap.info".to_string()),
                manifest: None
            }
        ));
    }

    fn assert_resolve_uri(args: &ArgsTryResolveUri, text_record_key: String, text_record_value: String, expected_uri: &Option<UriResolverMaybeUriOrManifest>) {
        match _try_resolve_uri(
            &args, 
            &|_| Ok("0x123".to_string()),
            &|args| {
                let ArgsGetTextRecord{
                    domain: _,
                    resolver_address: _,
                    key,
                    connection: _
                } = args;

                if key.to_string() == text_record_key {
                    Ok(text_record_value.clone())
                } else {
                    Err("".to_string())
                }
            }
        ) {
            Some(UriResolverMaybeUriOrManifest {
                uri: Some(uri),
                manifest: None
            }) => match expected_uri {
                Some(expected_uri) => {
                    match expected_uri {
                        UriResolverMaybeUriOrManifest {
                            uri: Some(expected_uri),
                            manifest: None
                        } => {
                            assert_eq!(&uri, expected_uri);
                        }
                        _ => {
                            panic!("Unexpected uri");
                        }
                    }
                }
                None => {
                    panic!("Unexpected uri");
                }
            },
            _ => assert!(false)
        }
    }

    fn assert_parse_uri(args: &ArgsTryResolveUri, expected_info: &Option<TextRecordInfo>) {
        let text_record_info = parse_uri(&args);

        match text_record_info {
            Some(text_record_info) => {
                match expected_info {
                    Some(expected_info) => {
                        let TextRecordInfo {
                            network_name,
                            carry_over_path,
                            domain,
                            text_record_key
                        } = text_record_info;
            
                        assert_eq!(network_name, expected_info.network_name);
                        assert_eq!(domain, expected_info.domain);
                        assert_eq!(text_record_key, expected_info.text_record_key);
                        assert_eq!(carry_over_path, expected_info.carry_over_path);
                    }
                    None => {
                        panic!("expected None, got Some");
                    }
                }

            }
            None => {
                match expected_info {
                    Some(_) => {
                        panic!("expected Some, got None");
                    }
                    None => {
                    }
                }
            }
        }
    }
}