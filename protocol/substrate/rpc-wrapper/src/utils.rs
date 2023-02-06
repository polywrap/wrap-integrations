#[cfg(not(feature = "std"))]
extern crate alloc;
#[cfg(not(feature = "std"))]
use alloc::vec::Vec;

use hex::FromHexError;
use sp_core::H256;

pub trait FromHexStr<S> {
    fn from_hex(hex: S) -> Result<Self, hex::FromHexError>
    where
        Self: Sized;
}

impl<S: AsRef<str>> FromHexStr<S> for Vec<u8> {
    fn from_hex(hex: S) -> Result<Self, hex::FromHexError> {
        let hexstr = hex.as_ref().trim_matches('\"').trim_start_matches("0x");

        hex::decode(&hexstr)
    }
}

impl<S: AsRef<str>> FromHexStr<S> for H256 {
    fn from_hex(hex: S) -> Result<Self, FromHexError> {
        let vec = Vec::from_hex(hex)?;

        match vec.len() {
            32 => Ok(H256::from_slice(&vec)),
            _ => Err(hex::FromHexError::InvalidStringLength),
        }
    }
}

impl<S: AsRef<str>, const N: usize> FromHexStr<S> for [u8; N] {
    fn from_hex(hex: S) -> Result<Self, hex::FromHexError> {
        let vec = Vec::from_hex(hex)?;
        vec.try_into()
            .map_err(|_e| hex::FromHexError::InvalidStringLength)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hextstr_to_vec() {
        assert_eq!(Vec::from_hex("0x01020a"), Ok(vec!(1, 2, 10)));
        assert_eq!(
            Vec::from_hex("null"),
            Err(hex::FromHexError::InvalidHexCharacter { c: 'n', index: 0 })
        );
        assert_eq!(
            Vec::from_hex("0x0q"),
            Err(hex::FromHexError::InvalidHexCharacter { c: 'q', index: 1 })
        );
    }

    #[test]
    fn test_hextstr_to_hash() {
        assert_eq!(
            H256::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000"),
            Ok(H256::from([0u8; 32]))
        );
        assert_eq!(
            H256::from_hex("0x010000000000000000"),
            Err(hex::FromHexError::InvalidStringLength)
        );
        assert_eq!(
            H256::from_hex("0x0q"),
            Err(hex::FromHexError::InvalidHexCharacter { c: 'q', index: 1 })
        );
    }
}

/// Wraps an already encoded byte vector, prevents being encoded as a raw byte vector as part of
/// the transaction payload
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Encoded(pub Vec<u8>);

impl codec::Encode for Encoded {
    fn encode(&self) -> Vec<u8> {
        self.0.to_owned()
    }
}
