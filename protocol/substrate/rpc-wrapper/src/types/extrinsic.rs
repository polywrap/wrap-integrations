//! Primitives for substrate extrinsics.
use crate::{
    signer_provider_module, types::extrinsic_params::ExtrinsicParams,
    utils::Encoded, SignerProviderModule, SignerProviderSignerPayloadRaw,
};
use codec::{Compact, Encode};
use sp_core::{
    crypto::{AccountId32, Ss58Codec},
    sr25519::Signature,
};
use sp_runtime::{MultiAddress, MultiSignature};

/// Builder of custom extrinsics.
pub struct ExtrinsicBuilder {
    call_data: Encoded,
    params: ExtrinsicParams,
}

impl ExtrinsicBuilder {
    /// New extrinsic builder.
    pub fn new(call_data: Encoded, params: ExtrinsicParams) -> Self {
        Self { call_data, params }
    }

    // Construct signature.
    //
    // This is compatible with the Encode impl for SignedPayload (which is this payload of bytes that we'd like)
    // to sign. See: https://github.com/paritytech/substrate/blob/9a6d706d8db00abb6ba183839ec98ecd9924b1f8/primitives/runtime/src/generic/unchecked_extrinsic.rs#L215)
    fn signature(&self, signer: &str) -> MultiSignature {
        let mut bytes = Vec::new();
        self.call_data.encode_to(&mut bytes);
        self.params.encode_extra_to(&mut bytes);
        self.params.encode_additional_to(&mut bytes);

        let data = if bytes.len() > 256 {
            sp_core::blake2_256(&bytes).to_vec()
        } else {
            bytes
        };

        let sig = SignerProviderModule::sign_raw(
            &signer_provider_module::ArgsSignRaw {
                payload: SignerProviderSignerPayloadRaw {
                    _type: "bytes".into(),
                    address: signer.into(),
                    data: hex::encode(data),
                },
            },
        )
        .expect("Failed to sign extrinsic.")
        .signature;

        let mut sr25519_sig = [0; 64];
        sr25519_sig.copy_from_slice(
            &hex::decode(sig.trim_start_matches("0x"))
                .expect("Invalid signature"),
        );
        MultiSignature::Sr25519(Signature(sr25519_sig))
    }

    /// Encode extrinsic (protocol version 4).
    pub fn build(&self, acc: AccountId32) -> Vec<u8> {
        let address = acc.to_ss58check();
        let mut encoded_inner = Vec::new();
        // "is signed" + transaction protocol version (4)
        (0b10000000 + 4u8).encode_to(&mut encoded_inner);
        // from address for signature
        MultiAddress::<AccountId32, u32>::Id(acc).encode_to(&mut encoded_inner);
        // the signature bytes
        self.signature(&address).encode_to(&mut encoded_inner);
        // attach custom extra params
        self.params.encode_extra_to(&mut encoded_inner);
        // and now, call data
        self.call_data.encode_to(&mut encoded_inner);
        // now, prefix byte length:
        let len = Compact(
            u32::try_from(encoded_inner.len())
                .expect("extrinsic size expected to be <4GB"),
        );
        let mut encoded = Vec::new();
        len.encode_to(&mut encoded);
        encoded.extend(encoded_inner);
        encoded
    }
}
