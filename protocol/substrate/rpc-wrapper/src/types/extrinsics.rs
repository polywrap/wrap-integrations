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

use crate::{
    error::Error,
    types::extrinsic_params::GenericExtra,
    utils::FromHexStr,
    wrap::SignedExtrinsicPayload,
    ExtrinsicPayload,
};
use codec::{
    Decode,
    Encode,
    Error as CodecError,
    Input,
};
use num_traits::ToPrimitive;
use sp_core::{
    crypto::Ss58Codec,
    sr25519::Signature,
};
use sp_runtime::{
    generic::Era,
    MultiSignature,
};
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

    pub fn new_unsigned(function: Call) -> Self {
        UncheckedExtrinsicV4 {
            signature: None,
            function,
        }
    }

    pub fn hex_encode(&self) -> String {
        let mut hex_str = hex::encode(self.encode());
        hex_str.insert_str(0, "0x");
        hex_str
    }
}

impl TryFrom<ExtrinsicPayload> for UncheckedExtrinsicV4<Vec<u8>> {
    type Error = Error;

    fn try_from(payload: ExtrinsicPayload) -> Result<Self, Error> {
        let call = hex::decode(&payload.method)?;
        Ok(Self::new_unsigned(call))
    }
}

impl TryFrom<SignedExtrinsicPayload> for UncheckedExtrinsicV4<Vec<u8>> {
    type Error = Error;

    fn try_from(payload: SignedExtrinsicPayload) -> Result<Self, Error> {
        // call is a hex string we can pass right through
        let call = <Vec<u8>>::from_hex(payload.extrinsic.method)?;

        // signer is ss58 encoding string
        let signer = GenericAddress::from(AccountId32::from_ss58check(
            &payload.extrinsic.address,
        )?);

        // signature is a hex string of a multisignature
        // The first byte indicates the signature type
        // TODO: In future match on this to create different types.
        // For now just skip it and assume sr2559
        let multisig_bytes = <[u8; 65]>::from_hex(&payload.signature)?;
        let signature = MultiSignature::from(
            Signature::from_raw(multisig_bytes[1..].try_into().unwrap()), // this cannot fail
        );

        // era is hex string (2 bytes exactly)
        let era_bytes = <[u8; 2]>::from_hex(&payload.extrinsic.era)?;
        let era = Era::decode(&mut era_bytes.as_slice())?;

        let nonce = payload.extrinsic.nonce;
        let tip = payload
            .extrinsic
            .tip
            .to_u128()
            .ok_or(Error::OversizedBigInt)?;
        let extra = GenericExtra::new(era, nonce, tip);

        Ok(Self::new_signed(call, signer, signature, extra))
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
    fn decode<I: Input>(input: &mut I) -> Result<Self, CodecError> {
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
    use polywrap_wasm_rs::BigInt;
    use sp_core::Pair;
    use sp_runtime::{
        generic::Era,
        testing::sr25519,
        MultiSignature,
    };

    #[test]
    fn encode_decode_roundtrip_works() {
        let (pair, signature) = gen_valid_signature();
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
    fn convert_from_known_good_payload() {
        // This payload is known to be good and comes from the polkadot-js extensions
        // test lib https://github.com/polkadot-js/extension/blob/607f4b3e3b045020659587771fd3eba7b3214862/packages/extension-ui/src/Popup/Signing/Signing.spec.tsx#L86
        let extrinsic = ExtrinsicPayload {
            address: "5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5".to_string(),
            block_hash: "0x661f57d206d4fecda0408943427d4d25436518acbff543735e7569da9db6bdd7".to_string(),
            block_number: 99,
            era: "0xb502".to_string(),
            genesis_hash: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e".to_string(),
            method: "0x0403c6111b239376e5e8b983dc2d2459cbb6caed64cc1d21723973d061ae0861ef690b00b04e2bde6f".to_string(),
            nonce: 3,
            signed_extensions: vec![
              "CheckSpecVersion".to_string(),
              "CheckTxVersion".to_string(),
              "CheckGenesis".to_string(),
              "CheckMortality".to_string(),
              "CheckNonce".to_string(),
              "CheckWeight".to_string(),
              "ChargeTransactionPayment".to_string(),
            ],
            spec_version: 2,
            tip: BigInt::from(4294967295u32),
            transaction_version: 4,
            version: 4
        };

        // create a random valid signature
        let (_, signature) = gen_valid_signature();

        let signed_payload = SignedExtrinsicPayload {
            extrinsic,
            signature: hex::encode(signature.encode()),
        };

        let _xt = UncheckedExtrinsicV4::try_from(signed_payload).unwrap();
    }

    #[test]
    fn decode_encoded_payload() {
        let payload_hex = "0xb9018400d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01aa976fea2fb2e941b3d74590375a578196a9c793100e7731539409b889d5321b27c183e484be0dcadf67366d384577692b66fb671823ec668dff946afd72958ea816000009001022686922";
        let payload_bytes = <Vec<u8>>::from_hex(payload_hex).unwrap();
        let extrinsic = UncheckedExtrinsicV4::<Vec<u8>>::decode(
            &mut payload_bytes.as_slice(),
        );
        println!("{:?}", extrinsic);
    }

    fn gen_valid_signature() -> (sr25519::Pair, MultiSignature) {
        let msg = &b"test-message"[..];
        let (pair, _) = sr25519::Pair::generate();
        let signature = MultiSignature::from(pair.sign(&msg));
        (pair, signature)
    }
}
