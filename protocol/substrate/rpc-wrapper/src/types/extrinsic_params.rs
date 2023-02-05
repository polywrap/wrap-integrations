use crate::utils::Encoded;
use codec::{Compact, Decode, Encode};
use sp_core::H256;
use sp_runtime::generic::Era;
use sp_std::prelude::*;

/// A tip payment.
#[derive(Copy, Clone, Debug, Default, Encode, Decode)]
pub struct PlainTip {
    #[codec(compact)]
    tip: u128,
}

#[derive(Encode, Decode)]
pub struct ExtrinsicParams {
    era: Era,
    nonce: u32,
    spec_version: u32,
    transaction_version: u32,
    genesis_hash: H256,
    mortality_checkpoint: H256,
    tip: PlainTip,
}

impl ExtrinsicParams {
    /// Create new extrinsic params.
    pub fn new(
        nonce: u32,
        spec_version: u32,
        transaction_version: u32,
        genesis_hash: H256,
        era: Option<Era>,
        mortality_checkpoint: Option<H256>,
        tip: Option<PlainTip>,
    ) -> Self {
        Self {
            era: era.unwrap_or(Era::Immortal),
            nonce,
            tip: tip.unwrap_or_default(),
            spec_version,
            transaction_version,
            genesis_hash,
            mortality_checkpoint: mortality_checkpoint.unwrap_or(genesis_hash),
        }
    }

    /// Encode extra params to buffer.
    pub fn encode_extra_to(&self, v: &mut Vec<u8>) {
        let nonce: u64 = self.nonce.into();
        let tip = Encoded(self.tip.encode());
        (self.era, Compact(nonce), tip).encode_to(v);
    }

    /// Encode additional params to buffer.
    pub fn encode_additional_to(&self, v: &mut Vec<u8>) {
        (
            self.spec_version,
            self.transaction_version,
            self.genesis_hash,
            self.mortality_checkpoint,
        )
            .encode_to(v);
    }
}
