use ethers_providers::{JsonRpcClient, ProviderError};

use super::wrap::imported::ArgsRequest;
use super::wrap::ProviderModule;
use async_trait::async_trait;
use serde::{de::DeserializeOwned, Serialize};
use thiserror::Error;

#[derive(Debug)]
pub struct PolywrapProvider {}

#[derive(Error, Debug)]
/// Error thrown when sending an HTTP request
pub enum ClientError {
    #[error("Deserialization Error: {err}. Response: {text}")]
    /// Serde JSON Error
    SerdeJson {
        err: serde_json::Error,
        text: String,
    },
}

impl From<ClientError> for ProviderError {
    fn from(src: ClientError) -> Self {
        match src {
            _ => ProviderError::JsonRpcClientError(Box::new(src)),
        }
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl JsonRpcClient for PolywrapProvider {
    type Error = ClientError;

    /// Sends a POST request with the provided method and the params serialized as JSON
    /// over HTTP
    async fn request<T: Serialize + Send + Sync, R: DeserializeOwned>(
        &self,
        method: &str,
        params: T,
    ) -> Result<R, ClientError> {
        let params_s = serde_json::to_string(&params).unwrap();
        let res = ProviderModule::request(&ArgsRequest {
            method: method.to_string(),
            params: Some(params_s),
        })
        .expect("provider request failed");
        let res = serde_json::from_str(&res).map_err(|err| ClientError::SerdeJson {
            err,
            text: "from str failed".to_string(),
        })?;
        Ok(res)
    }
}

impl PolywrapProvider {
    pub fn new() -> Self {
        Self {}
    }
}

impl Clone for PolywrapProvider {
    fn clone(&self) -> Self {
        Self {}
    }
}
