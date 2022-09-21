/*
   Copyright 2019 Supercomputing Systems AG

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

//! Primitives for substrate extrinsics.

use sp_runtime::generic::Era;
use sp_core::crypto::Ss58Codec;
use sp_core::sr25519::Signature;
use crate::types::extrinsic_params::GenericExtra;
use crate::wrap::SignedExtrinsicPayload;
use codec::{
    Decode,
    Encode,
    Error,
    Input,
};
use sp_runtime::MultiSignature;
pub use sp_runtime::{
    AccountId32,
    MultiAddress,
};
use sp_std::{
    fmt,
    prelude::*,
};

pub type GenericAddress = sp_runtime::MultiAddress<AccountId32, ()>;

/// Mirrors the currently used Extrinsic format (V4) from substrate. Has less traits and methods though.
/// The SingedExtra used does not need to implement SingedExtension here.
#[derive(Clone, Eq, PartialEq)]
pub struct UncheckedExtrinsicV4<Call> {
    pub signature: Option<(GenericAddress, MultiSignature, GenericExtra)>,
    pub function: Call,
}

impl<Call> UncheckedExtrinsicV4<Call>
where
    Call: Encode,
{
    pub fn new_signed(
        function: Call,
        signed: GenericAddress,
        signature: MultiSignature,
        extra: GenericExtra,
    ) -> Self {
        UncheckedExtrinsicV4 {
            signature: Some((signed, signature, extra)),
            function,
        }
    }
}

impl From<SignedExtrinsicPayload> for UncheckedExtrinsicV4<Vec<u8>> {
    fn from(payload: SignedExtrinsicPayload) -> Self {
        let call = hex::decode(&payload.extrinsic.method).unwrap();
        let signer = GenericAddress::from(AccountId32::from_ss58check(&payload.extrinsic.address).unwrap());
        let signature = MultiSignature::from(
            Signature::from_slice(&hex::decode(&payload.signature).unwrap()).unwrap()
        );

        let era_bytes = hex::decode(&payload.extrinsic.era).unwrap();
        let era = Era::decode(&mut era_bytes.as_slice()).unwrap();
        let nonce = 0;
        let tip = 0;
        let extra = GenericExtra::new(era, nonce, tip);

        Self::new_signed(
            call,
            signer,
            signature,
            extra,
        )
    }
}

impl<Call> fmt::Debug for UncheckedExtrinsicV4<Call>
where
    Call: fmt::Debug,
{
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "UncheckedExtrinsic({:?}, {:?})",
            self.signature.as_ref().map(|x| (&x.0, &x.2)),
            self.function
        )
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

impl<Call> Decode for UncheckedExtrinsicV4<Call>
where
    Call: Decode + Encode,
{
    fn decode<I: Input>(input: &mut I) -> Result<Self, Error> {
        // This is a little more complicated than usual since the binary format must be compatible
        // with substrate's generic `Vec<u8>` type. Basically this just means accepting that there
        // will be a prefix of vector length (we don't need
        // to use this).
        let _length_do_not_remove_me_see_above: Vec<()> =
            Decode::decode(input)?;

        let version = input.read_byte()?;

        let is_signed = version & 0b1000_0000 != 0;
        let version = version & 0b0111_1111;
        if version != V4 {
            return Err("Invalid transaction version".into());
        }

        Ok(UncheckedExtrinsicV4 {
            signature: if is_signed {
                Some(Decode::decode(input)?)
            } else {
                None
            },
            function: Decode::decode(input)?,
        })
    }
}

/// Same function as in primitives::generic. Needed to be copied as it is private there.
fn encode_with_vec_prefix<T: Encode, F: Fn(&mut Vec<u8>)>(
    encoder: F,
) -> Vec<u8> {
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ExtrinsicPayload;
    use sp_core::Pair;
    use sp_runtime::{
        generic::Era,
        testing::sr25519,
        MultiSignature,
    };

    #[test]
    fn encode_decode_roundtrip_works() {
        let msg = &b"test-message"[..];
        let (pair, _) = sr25519::Pair::generate();
        let signature = pair.sign(&msg);
        let multi_sig = MultiSignature::from(signature);
        let account: AccountId32 = pair.public().into();

        let xt = UncheckedExtrinsicV4::new_signed(
            vec![1, 1, 1],
            account.into(),
            multi_sig,
            GenericExtra::new(Era::mortal(8, 0), 0, 0),
        );
        let xt_enc = xt.encode();
        assert_eq!(xt, Decode::decode(&mut xt_enc.as_slice()).unwrap())
    }

    #[test]
    fn convert_from_json_form() {
        let msg = &b"test-message"[..];
        let (pair, _) = sr25519::Pair::generate();
        let signature = pair.sign(&msg);
        let multi_sig = MultiSignature::from(signature.clone());
        let account: AccountId32 = pair.public().into();
        let call = vec![1, 1, 1];

        let xt = UncheckedExtrinsicV4::new_signed(
            call.clone(),
            account.clone().into(),
            multi_sig.clone(),
            GenericExtra::new(Era::mortal(8, 0), 0, 0),
        );


        // create the same extrinsic using the JSONPayload style
        let extrinsic = ExtrinsicPayload {
            address: account.to_string(),
            block_hash: String::new(), // not encoded
            block_number: "0".to_string(), // not encoded
            era: hex::encode(xt.signature.clone().unwrap().2.0.encode()),
            genesis_hash: String::new(), // not encoded
            method: hex::encode(call),
            nonce: "0".to_string(),
            spec_version: String::new(),
            tip: String::new(),
            transaction_version: String::new(),
            signed_extensions: Vec::new(),
            version: 4
        };
        let xt_json = SignedExtrinsicPayload {
            extrinsic,
            signature: hex::encode(signature.encode()),
        };

        assert_eq!(xt, xt_json.into());
    }
}
