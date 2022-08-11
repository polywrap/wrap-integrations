pub mod wrap;
pub use wrap::*;
use sha3;
use sha3::{Digest, digest::{Update, ExtendableOutput, XofReader}};
use hex;
use sha3::digest::DynDigest;

pub fn sha3_512(args: ArgsSha3512) -> String {
    let data = sha3::Sha3_512::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn sha3_384(args: ArgsSha3384) -> String {
    let data = sha3::Sha3_384::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn sha3_256(args: ArgsSha3256) -> String {
    let data = sha3::Sha3_256::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn sha3_224(args: ArgsSha3224) -> String {
    let data = sha3::Sha3_224::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn keccak_512(args: ArgsKeccak512) -> String {
    let data = sha3::Keccak512::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn keccak_384(args: ArgsKeccak384) -> String {
    let data = sha3::Keccak384::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn keccak_256(args: ArgsKeccak256) -> String {
    let data = sha3::Keccak256::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn keccak_224(args: ArgsKeccak224) -> String {
    let data = sha3::Keccak224::new().chain_update(args.message).finalize();
    return hex::encode(data);
}

pub fn hex_keccak_256(args: ArgsHexKeccak256) -> String {
    // remove the leading 0x
    let hex_string: &str = args.message.strip_prefix("0x").unwrap_or(&args.message);

    // ensure even number of characters
    if hex_string.len() % 2 != 0 {
        panic!("expected an even number of characters in the hex string: {}", hex_string.len());
    }

    let bytes: Vec<u8> = match hex::decode(hex_string) {
        Ok(bytes) => bytes,
        Err(e) => panic!("{}", e),
    };

    let data = sha3::Keccak256::new().chain_update(&bytes).finalize();
    return hex::encode(data);
}

pub fn buffer_keccak_256(args: ArgsBufferKeccak256) -> String {
    let data = sha3::Keccak256::new().chain_update(&args.message).finalize();
    return hex::encode(data);
}

pub fn shake_256(args: ArgsShake256) -> String {
    let mut hasher = sha3::Shake256::default();
    hasher.update(args.message.as_bytes());
    let mut reader = hasher.finalize_xof();
    let output_bytes: usize = (args.output_bits / 8) as usize;
    let mut data = vec![0u8; output_bytes];
    reader.read(&mut data);
    return hex::encode(data);
}

pub fn shake_128(args: ArgsShake128) -> String {
    let mut hasher = sha3::Shake128::default();
    hasher.update(args.message.as_bytes());
    let mut reader = hasher.finalize_xof();
    let output_bytes: usize = (args.output_bits / 8) as usize;
    let mut data = vec![0u8; output_bytes];
    reader.read(&mut data);
    return hex::encode(data);
}
