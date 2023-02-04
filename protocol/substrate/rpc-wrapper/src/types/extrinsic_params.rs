use codec::{
    Compact,
    Decode,
    Encode,
};
use sp_core::{
    blake2_256,
    H256,
};
use sp_std::prelude::*;
use sp_runtime::generic::Era;
use crate::utils::Encoded;

/// Simple generic extra mirroring the SignedExtra currently used in extrinsics. Does not implement
/// the SignedExtension trait. It simply encodes to the same bytes as the real SignedExtra. The
/// Order is (CheckVersion, CheckGenesis, Check::Era, CheckNonce, CheckWeight, transactionPayment::ChargeTransactionPayment).
/// This can be locked up in the System module. Fields that are merely PhantomData are not encoded and are
/// therefore omitted here.
#[derive(Decode, Encode, Clone, Eq, PartialEq, Debug)]
pub struct GenericExtra(pub Era, pub Compact<u32>, pub Compact<u128>);

impl GenericExtra {
    pub fn immortal_with_nonce_and_tip(nonce: u32, tip: u128) -> Self {
        Self(Era::immortal(), Compact(nonce), Compact(tip))
    }

    pub fn new(era: Era, nonce: u32, tip: u128) -> Self {
        Self(era, Compact(nonce), Compact(tip))
    }
}

impl Default for GenericExtra {
    fn default() -> Self {
        Self::new(Era::Immortal, 0, 0_u128)
    }
}

/// additionalSigned fields of the respective SignedExtra fields.
/// Order is the same as declared in the extra.
pub type AdditionalSigned = (u32, u32, H256, H256, (), (), ());

#[derive(Decode, Encode, Clone, Eq, PartialEq, Debug)]
pub struct SignedPayload<Call>((Call, GenericExtra, AdditionalSigned));

impl<Call> SignedPayload<Call>
where
    Call: Encode,
{
    pub fn from_raw(
        call: Call,
        extra: GenericExtra,
        additional_signed: AdditionalSigned,
    ) -> Self {
        Self((call, extra, additional_signed))
    }

    /// Get an encoded version of this payload.
    ///
    /// Payloads longer than 256 bytes are going to be `blake2_256`-hashed.
    pub fn using_encoded<R, F: FnOnce(&[u8]) -> R>(&self, f: F) -> R {
        self.0.using_encoded(|payload| {
            if payload.len() > 256 {
                f(&blake2_256(payload)[..])
            } else {
                f(payload)
            }
        })
    }
}
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
            mortality_checkpoint: mortality_checkpoint.unwrap_or(genesis_hash)
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

