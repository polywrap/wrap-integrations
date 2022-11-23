use polywrap_wasm_rs::{Map};
use base64::{decode};
use crate::imported::{HttpRequest, HttpResponse, HttpResponseType, HttpModule, ArgsGet};

pub fn exec_cat(ipfs_provider: &str, cid: &str, timeout: u32) -> Result<Vec<u8>, String> {
    let url: String = format!("{}/api/v0/cat", ipfs_provider);

    let url_params: Map<String, String> = Map::from([("arg".to_string(), cid.to_string())]);
    let request: HttpRequest = HttpRequest {
        headers: None,
        url_params: Some(url_params),
        response_type: HttpResponseType::BINARY,
        body: None,
        timeout: Some(timeout),
    };

    let http_result = HttpModule::get(&ArgsGet { url, request: Some(request) });
    let result = unwrap_http_result(http_result)?;
    decode(result).map_err(|e| format!("{}", e))
}

fn unwrap_http_result(http_result: Result<Option<HttpResponse>, String>) -> Result<String, String> {
    let response = http_result
        .map_err(|e| format!("IPFS method 'cat' failed. {}", parse_http_error(e)))?
        .ok_or("IPFS method 'cat' failed. HTTP response is null.".to_string())?;

    if response.status != 200 {
        panic!("IPFS method 'cat' failed. Http error. Status code: {}. Status: {}", response.status, response.status_text);
    }

    response.body.ok_or("IPFS method 'cat' failed. HTTP response body is null.".to_string())
}

fn parse_http_error(err: String) -> String {
    let mut message = err.clone();
    if message.starts_with("Error: ") {
        message = message[7..].to_owned();
        message = message[0..1].to_ascii_uppercase() + &message[1..];
    }
    message
}