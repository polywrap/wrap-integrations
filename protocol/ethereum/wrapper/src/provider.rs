use super::wrap::imported::{ArgsRequest, TransportModule};
use ethers_providers::{JsonRpcClient, ProviderError};
use serde::{de::DeserializeOwned, Serialize};
use thiserror::Error;

#[derive(Clone, Debug)]
pub struct PolywrapProvider {}

impl PolywrapProvider {
    pub fn new() -> Self {
        Self {}
    }
}

impl JsonRpcClient for PolywrapProvider {
    type Error = ClientError;

    fn request<T: Serialize + Send + Sync, R: DeserializeOwned>(
        &self,
        method: &str,
        params: T,
    ) -> Result<R, ClientError> {
        let res = TransportModule::request(&ArgsRequest {
            method: method.to_string(),
            params: None,
        })
        .unwrap();
        let response: R = serde_json::from_str("{}").unwrap();

        Ok(serde_json::from_str(
            "0x0000000000000000000000000000000000000000",
        )?)
    }
}

impl From<ClientError> for ProviderError {
    fn from(src: ClientError) -> Self {
        ProviderError::JsonRpcClientError(Box::new(src))
    }
}

#[derive(Error, Debug)]
pub enum ClientError {
    /// Thrown if deserialization failed
    #[error(transparent)]
    JsonError(#[from] serde_json::Error),
}
