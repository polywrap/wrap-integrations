use crate::{
    content::*,
    Error,
};
use async_recursion::async_recursion;
use codec::{
    Compact,
    Decode,
    Encode,
};
use frame_support::BoundedVec;
use sauron::prelude::*;
use serde::{
    de::DeserializeOwned,
    Deserialize,
    Serialize,
};
use serde_json::json;
use sp_core::{
    crypto::{
        AccountId32,
        Ss58Codec,
    },
    Pair,
    H256,
};
use sp_keyring::AccountKeyring;
use sp_runtime::{
    generic::Era,
    traits::IdentifyAccount,
    MultiAddress,
    MultiSignature,
    MultiSigner,
};
use std::fmt;
use sp_core::sr25519::Signature;

#[wasm_bindgen]
extern "C" {

    #[derive(Debug, Clone)]
    pub type PolywrapClientWrapper;

    #[wasm_bindgen(constructor)]
    pub fn new() -> PolywrapClientWrapper;

    #[wasm_bindgen(method)]
    pub async fn invoke_method(
        this: &PolywrapClientWrapper,
        method: &str,
        args: JsValue,
    ) -> JsValue;

    #[wasm_bindgen(method)]
    pub async fn invoke(this: &PolywrapClientWrapper, args: JsValue)
        -> JsValue;
}

#[wasm_bindgen]
extern "C" {
    #[derive(Debug, Clone)]
    pub type SignerProvider;

    #[wasm_bindgen(constructor)]
    pub fn new() -> SignerProvider;

    #[wasm_bindgen(method)]
    pub async fn signer_accounts(this: &SignerProvider) -> JsValue;

    #[wasm_bindgen(method)]
    pub async fn sign_payload(this: &SignerProvider, payload: &str) -> JsValue;
}

#[derive(Clone)]
pub struct Api {
    client: PolywrapClientWrapper,
    signer_provider: SignerProvider,
    pub url: String,
}

impl Api {
    pub async fn new(url: &str) -> Result<Self, Error> {
        Ok(Self {
            client: PolywrapClientWrapper::new(),
            signer_provider: SignerProvider::new(),
            url: url.to_string(),
        })
    }

    pub async fn invoke_method<D: DeserializeOwned>(
        &self,
        method: &str,
        args: serde_json::Value,
    ) -> Result<D, Error> {
        let args = JsValue::from_serde(&args)?;
        let result = self.client.invoke_method(method, args).await;
        Ok(result.into_serde::<D>()?)
    }

    pub async fn sign_payload(&self, payload: &[u8]) -> Result<Signature, Error> {
        let payload_hex: String = prefix_hex::encode(payload);
        log::info!("api payload_hex: {}", payload_hex);
        let signature_hex: JsValue = self.signer_provider.sign_payload(&payload_hex).await;
        log::info!("api signature_hex: {:?}", signature_hex);
        let signature_str = signature_hex.as_string().expect("must be string");
        log::error!("api signature_str: {}", signature_str);
        let signature_bytes: Vec<u8> = prefix_hex::decode(&signature_str).expect("must decode");
        log::info!("api signature length: {:?}", signature_bytes.len());
        log::info!("api signature: {:?}", signature_bytes);
        Ok(Signature::from_slice(&signature_bytes).expect("must not error"))
    }
}
