use crate::content::*;
use crate::Api;
use crate::Error;
use async_recursion::async_recursion;
use codec::Compact;
use codec::Decode;
use codec::Encode;
use frame_support::traits::Get;
use frame_support::BoundedVec;
use sauron::prelude::*;
use serde::de::DeserializeOwned;
use serde::Deserialize;
use serde::Serialize;
use serde_json::json;
use sp_core::crypto::AccountId32;
use sp_core::crypto::Ss58Codec;
use sp_core::Pair;
use sp_core::H256;
use sp_keyring::AccountKeyring;
use sp_runtime::generic::Era;
use sp_runtime::traits::IdentifyAccount;
use sp_runtime::MultiAddress;
use sp_runtime::MultiSignature;
use sp_runtime::MultiSigner;
use std::fmt;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct RuntimeVersion {
    pub spec_name: String,
    pub impl_name: String,
    pub authoring_version: u32,
    pub spec_version: u32,
    pub impl_version: u32,
    pub transaction_version: u32,
    pub state_version: u8,
}

#[derive(Clone, Eq, PartialEq)]
pub struct UncheckedExtrinsicV4<Call> {
    pub signature: Option<(
        MultiAddress<AccountId32, ()>,
        MultiSignature,
        (Era, Compact<u32>, Compact<u128>),
    )>,
    pub function: Call,
}

impl<Call> UncheckedExtrinsicV4<Call>
where
    Call: Encode,
{
    pub fn hex_encode(&self) -> String {
        let mut hex_str = hex::encode(self.encode());
        hex_str.insert_str(0, "0x");
        hex_str
    }
}

const V4: u8 = 4;

impl<Call> Encode for UncheckedExtrinsicV4<Call>
where
    Call: Encode,
{
    fn encode(&self) -> Vec<u8> {
        encode_with_vec_prefix::<Self, _>(|v| {
            match self.signature.as_ref() {
                Some(s) => {
                    v.push(V4 | 0b1000_0000);
                    s.encode_to(v);
                }
                None => {
                    v.push(V4 & 0b0111_1111);
                }
            }
            self.function.encode_to(v);
        })
    }
}

/// Same function as in primitives::generic. Needed to be copied as it is private there.
fn encode_with_vec_prefix<T: Encode, F: Fn(&mut Vec<u8>)>(encoder: F) -> Vec<u8> {
    let size = sp_std::mem::size_of::<T>();
    let reserve = match size {
        0..=0b0011_1111 => 1,
        0b0100_0000..=0b0011_1111_1111_1111 => 2,
        _ => 4,
    };
    let mut v = Vec::with_capacity(reserve + size);
    v.resize(reserve, 0);
    encoder(&mut v);

    // need to prefix with the total length to ensure it's binary compatible with
    // Vec<u8>.
    let mut length: Vec<()> = Vec::new();
    length.resize(v.len() - reserve, ());
    length.using_encoded(|s| {
        v.splice(0..reserve, s.iter().cloned());
    });

    v
}

#[derive(Decode, Encode, Clone, Eq, PartialEq, Debug)]
pub struct SignedPayload<Call> {
    call: Call,
    extra: (Era, Compact<u32>, Compact<u128>), //(era, period, tip)
    additional: (u32, u32, H256, H256), // (spec_version, transaction_version, genesis_hash, head_or_genesis_hash)
}

/// TODO: This should be hookup to the browser extension
pub async fn sign_call_and_encode<Call>(api: &Api, call: Call) -> Result<String, Error>
where
    Call: Encode + Clone + fmt::Debug,
{
    // we use alice for now, for simplicity
    let signer: sp_core::sr25519::Pair = AccountKeyring::Alice.pair();
    let multi_signer = MultiSigner::from(signer.public());
    let signer_account = multi_signer.into_account();

    let signing_function = |payload: &[u8]| signer.sign(payload);

    let nonce = get_nonce_for_account(api, &signer_account).await?;
    let signer_address: MultiAddress<AccountId32, ()> = signer_account.into();

    let runtime_version = get_runtime_version(api).await?;
    let genesis_hash = get_genesis_hash(api)
        .await?
        .expect("must have a genesis hash");

    let extra = (Era::Immortal, Compact(nonce), Compact(0));

    let raw_payload = SignedPayload {
        call: call.clone(),
        extra: extra.clone(),
        additional: (
            runtime_version.spec_version,
            runtime_version.transaction_version,
            genesis_hash,
            genesis_hash,
        ),
    };

    let signature = raw_payload.using_encoded(signing_function);
    let multi_signature = MultiSignature::from(signature);

    let extrinsic = UncheckedExtrinsicV4 {
        function: call,
        signature: Some((signer_address, multi_signature, extra)),
    };

    let encoded = extrinsic.hex_encode();
    Ok(encoded)
}

pub async fn get_nonce_for_account(api: &Api, account: &AccountId32) -> Result<u32, Error> {
    let args = json!({
        "url": api.url,
        "account": account.to_ss58check(),
    });
    let nonce: u32 = api.invoke_method("getNonceForAccount", args).await?;
    Ok(nonce)
}

pub async fn get_genesis_hash(api: &Api) -> Result<Option<H256>, Error> {
    let args = json!({
        "url": api.url,
    });
    let runtime_version: Option<H256> = api.invoke_method("genesisHash", args).await?;
    Ok(runtime_version)
}

pub async fn get_runtime_version(api: &Api) -> Result<RuntimeVersion, Error> {
    let args = json!({
        "url": api.url,
    });
    let runtime_version: RuntimeVersion = api.invoke_method("getRuntimeVersion", args).await?;
    Ok(runtime_version)
}
