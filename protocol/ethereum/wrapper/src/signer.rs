use super::wrap::imported::{ArgsRequest, ArgsAddress, ArgsChainId, ArgsSignDigest};
use super::wrap::ProviderModule;
use async_trait::async_trait;
use ethers_core::types::{transaction::{eip2718::TypedTransaction, eip712::Eip712}, Address, Signature, H256, SignatureError};
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
        let address = ProviderModule::address(&ArgsAddress {}).unwrap();
        let chain_id = ProviderModule::chain_id(&ArgsChainId {})
            .expect("failed to obtain signer chain id from provider plugin");
        Self {
            address: Address::from_str(&address).unwrap(),
            chain_id: u64::from_str(&chain_id).unwrap(),
        }
    }

    /// Signs the provided hash.
    pub fn sign_hash(&self, hash: H256) -> Result<Signature, String> {
        let digest = hash.as_bytes().to_vec();
        let signature = ProviderModule::sign_digest(&ArgsSignDigest { digest })?;
        Ok(Signature::from_str(&signature).unwrap())
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl Signer for PolywrapSigner {
    type Error = SignerError;

    // TODO: format errors correctly for Eip712 spec

    async fn sign_message<S: Send + Sync + AsRef<[u8]>>(
        &self,
        message: S,
    ) -> Result<Signature, Self::Error> {
        let message = message.as_ref();
        let hash = hash_message(message);
        self.sign_hash(hash).map_err(|e| SignerError::Eip712Error(e))
    }

    async fn sign_transaction(&self, tx: &TypedTransaction) -> Result<Signature, Self::Error> {
        // rlp (for sighash) must have the same chain id as v in the signature
        let chain_id = tx.chain_id().map(|id| id.as_u64()).unwrap_or(self.chain_id);
        let mut tx = tx.clone();
        tx.set_chain_id(chain_id);

        let sighash = tx.sighash();

        match self.sign_hash(sighash) {
            Ok(mut sig) => {
                // sign_hash sets `v` to recid + 27, so we need to subtract 27 before normalizing
                sig.v = to_eip155_v(sig.v as u8 - 27, chain_id);
                Ok(sig)
            },
            Err(e) => Err(SignerError::Eip712Error(e))
        }
    }

    async fn sign_typed_data<T: Eip712 + Send + Sync>(
        &self,
        payload: &T,
    ) -> Result<Signature, Self::Error> {
        let encoded = payload
            .encode_eip712()
            .map_err(|e| Self::Error::Eip712Error(e.to_string()))?;
        let hash = H256::from(encoded);
        self.sign_hash(hash).map_err(|e| SignerError::Eip712Error(e))
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
