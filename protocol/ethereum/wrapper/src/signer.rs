use super::wrap::imported::ArgsRequest;
use super::wrap::ProviderModule;
use async_trait::async_trait;
use ethers_core::types::{
    transaction::{eip2718::TypedTransaction, eip712::Eip712},
    Address, Signature, H256,
};
use ethers_core::utils::hash_message;
use ethers_signers::{to_eip155_v, Signer};
use std::str::FromStr;
use thiserror::Error;

#[derive(Clone, Debug)]
pub struct PolywrapSigner {
    /// The wallet's address
    pub(crate) address: Address,
    /// The wallet's chain id (for EIP-155)
    pub(crate) chain_id: u64,
}

#[derive(Error, Debug)]
/// Error thrown when sending an HTTP request
pub enum SignerError {
    /// Error type from Eip712Error message
    #[error("error encoding eip712 struct: {0:?}")]
    Eip712Error(String),
}

impl PolywrapSigner {
    pub fn new() -> Self {
        let address = ProviderModule::request(&ArgsRequest {
            method: "personal_address".to_owned(),
            params: None,
        })
        .expect("provider request failed");
        let chain_id = ProviderModule::request(&ArgsRequest {
            method: "personal_chainId".to_owned(),
            params: None,
        })
        .expect("provider request failed");

        Self {
            address: Address::from_str(&address).unwrap(),
            chain_id: u64::from_str(&chain_id).unwrap(),
        }
    }

    /// Signs the provided hash.
    pub fn sign_hash(&self, hash: H256) -> Signature {
        let params_s = serde_json::to_string(&hash).unwrap();
        let signature = ProviderModule::request(&ArgsRequest {
            method: "personal_signDigest".to_owned(),
            params: Some(params_s),
        })
        .expect("provider request failed");
        Signature::from_str(&signature).unwrap()
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl Signer for PolywrapSigner {
    type Error = SignerError;

    async fn sign_message<S: Send + Sync + AsRef<[u8]>>(
        &self,
        message: S,
    ) -> Result<Signature, Self::Error> {
        let message = message.as_ref();
        let message_hash = hash_message(message);

        Ok(self.sign_hash(message_hash))
    }

    async fn sign_transaction(&self, tx: &TypedTransaction) -> Result<Signature, Self::Error> {
        // rlp (for sighash) must have the same chain id as v in the signature
        let chain_id = tx.chain_id().map(|id| id.as_u64()).unwrap_or(self.chain_id);
        let mut tx = tx.clone();
        tx.set_chain_id(chain_id);

        let sighash = tx.sighash();
        let mut sig = self.sign_hash(sighash);

        // sign_hash sets `v` to recid + 27, so we need to subtract 27 before normalizing
        sig.v = to_eip155_v(sig.v as u8 - 27, chain_id);
        Ok(sig)
    }

    async fn sign_typed_data<T: Eip712 + Send + Sync>(
        &self,
        payload: &T,
    ) -> Result<Signature, Self::Error> {
        let encoded = payload
            .encode_eip712()
            .map_err(|e| Self::Error::Eip712Error(e.to_string()))?;

        Ok(self.sign_hash(H256::from(encoded)))
    }

    fn address(&self) -> Address {
        self.address
    }

    /// Gets the wallet's chain id
    fn chain_id(&self) -> u64 {
        self.chain_id
    }

    /// Sets the wallet's chain_id, used in conjunction with EIP-155 signing
    fn with_chain_id<T: Into<u64>>(mut self, chain_id: T) -> Self {
        self.chain_id = chain_id.into();
        self
    }
}
