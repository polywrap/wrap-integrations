use ethers_core::types::{
    transaction::{eip2718::TypedTransaction, eip712::Eip712},
    Address, Signature,
};
use ethers_signers::Signer;
use std::str::FromStr;
use thiserror::Error;

#[derive(Clone, Debug)]
pub struct PolywrapSigner {}

impl PolywrapSigner {
    pub fn new() -> Self {
        Self {}
    }
}

impl Signer for PolywrapSigner {
    type Error = SignerError;

    fn sign_message<S: Send + Sync + AsRef<[u8]>>(
        &self,
        message: S,
    ) -> Result<Signature, Self::Error> {
        let s1 = Signature::from_str(
            "0xa4708243bf782c6769ed04d83e7192dbcf4fc131aa54fde9d889d8633ae39dab03d7babd2392982dff6bc20177f7d887e27e50848c851320ee89c6c63d18ca761c").unwrap();
        Ok(s1)
    }

    fn sign_transaction(&self, tx: &TypedTransaction) -> Result<Signature, Self::Error> {
        let s1 = Signature::from_str(
            "0xaa231fbe0ed2b5418e6ba7c19bee2522852955ec50996c02a2fe3e71d30ddaf1645baf4823fea7cb4fcc7150842493847cfb6a6d63ab93e8ee928ee3f61f503500").unwrap();
        Ok(s1)
    }

    fn sign_typed_data<T: Eip712 + Send + Sync>(
        &self,
        payload: &T,
    ) -> Result<Signature, Self::Error> {
        let s1 = Signature::from_str(
            "0xaa231fbe0ed2b5418e6ba7c19bee2522852955ec50996c02a2fe3e71d30ddaf1645baf4823fea7cb4fcc7150842493847cfb6a6d63ab93e8ee928ee3f61f503500").unwrap();
        Ok(s1)
    }

    fn address(&self) -> Address {
        Address::from_str("0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552").unwrap()
    }

    /// Gets the wallet's chain id
    fn chain_id(&self) -> u64 {
        1
    }

    /// Sets the wallet's chain_id, used in conjunction with EIP-155 signing
    fn with_chain_id<T: Into<u64>>(mut self, chain_id: T) -> Self {
        self
    }
}

#[derive(Error, Debug)]
/// Error thrown by the Wallet module
pub enum SignerError {
    /// Error propagated from the hex crate.
    #[error(transparent)]
    HexError(#[from] hex::FromHexError),
}
