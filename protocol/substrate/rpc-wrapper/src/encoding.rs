//! Encoding strategy for a SignedExtrinsicPayload

use crate::types::extrinsic_params::GenericExtra;
use codec::{
    Encode,
};

pub use sp_runtime::{
    AccountId32,
    MultiAddress,
};
use sp_std::{
    prelude::*,
};
use crate::wrap::SignedExtrinsicPayload;

const V4: u8 = 4;

impl SignedExtrinsicPayload {
    pub fn hex_encode(&self) -> String {
        let mut hex_str = hex::encode(self.encode());
        hex_str.insert_str(0, "0x");
        hex_str
    }
}

impl Encode for SignedExtrinsicPayload {
    fn encode(&self) -> Vec<u8> {
        encode_with_vec_prefix::<Self, _>(|v| {
            v.push(V4 | 0b1000_0000);
            // TODO - support unsigned extrinsics
            // v.push(V4 & 0b0111_1111);

            // address
            self.extrinsic.address.encode_to(v);

            // signature
            self.signature.encode_to(v);

            // extras (era, nonce, tip)
            GenericExtra::default().encode_to(v);
            
            self.extrinsic.method.encode_to(v);
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

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use sp_core::Pair;
//     use sp_runtime::{
//         generic::Era,
//         testing::sr25519,
//         MultiSignature,
//     };

//     #[test]
//     fn encode_decode_roundtrip_works() {
//         let msg = &b"test-message"[..];
//         let (pair, _) = sr25519::Pair::generate();
//         let signature = pair.sign(&msg);
//         let multi_sig = MultiSignature::from(signature);
//         let account: AccountId32 = pair.public().into();

//         let xt = UncheckedExtrinsicV4::new_signed(
//             vec![1, 1, 1],
//             account.into(),
//             multi_sig,
//             GenericExtra::new(Era::mortal(8, 0), 0, 0),
//         );
//         let xt_enc = xt.encode();
//         assert_eq!(xt, Decode::decode(&mut xt_enc.as_slice()).unwrap())
//     }
// }
