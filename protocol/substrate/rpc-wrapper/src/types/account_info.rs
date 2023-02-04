use codec::{
    Decode,
    Encode,
};
use sp_core::crypto::AccountId32;

/// Redefinition from `pallet-balances`. Currently, pallets break `no_std` builds, see:
/// https://github.com/paritytech/substrate/issues/8891
#[derive(Clone, Eq, PartialEq, Default, Debug, Encode, Decode)]
pub struct AccountData {
    /// Non-reserved part of the balance. There may still be restrictions on this, but it is the
    /// total pool what may in principle be transferred, reserved and used for tipping.
    ///
    /// This is the only balance that matters in terms of most operations on tokens. It
    /// alone is used to determine the balance when in the contract execution environment.
    pub free: u128,
    /// u128 which is reserved and may not be used at all.
    ///
    /// This can still get slashed, but gets slashed last of all.
    ///
    /// This balance is a 'reserve' balance that other subsystems use in order to set aside tokens
    /// that are still 'owned' by the account holder, but which are suspendable.
    pub reserved: u128,
    /// The amount that `free` may not drop below when withdrawing for *anything except transaction
    /// fee payment*.
    pub misc_frozen: u128,
    /// The amount that `free` may not drop below when withdrawing specifically for transaction
    /// fee payment.
    pub fee_frozen: u128,
}

/// Redefinition from `frame-system`. Again see: https://github.com/paritytech/substrate/issues/8891
#[derive(Clone, Eq, PartialEq, Default, Debug, Encode, Decode)]
pub struct AccountInfo {
    /// The number of transactions this account has sent.
    pub nonce: u32,
    /// The number of other modules that currently depend on this account's existence. The account
    /// cannot be reaped until this is zero.
    pub consumers: u32,
    /// The number of other modules that allow this account to exist. The account may not be reaped
    /// until this and `sufficients` are both zero.
    pub providers: u32,
    /// The number of modules that allow this account to exist for their own purposes only. The
    /// account may not be reaped until this and `providers` are both zero.
    pub sufficients: u32,
    /// The additional data that belongs to this account. Used to store the balance(s) in a lot of
    /// chains.
    pub data: AccountData,
}

/// MultiAddress for encoding, only supports `Id` for now.
#[derive(Encode, Decode)]
pub enum MultiAddress {
    /// It's an account ID (pubkey).
    Id(AccountId32),
    /// It's an account index.
    Index(#[codec(compact)] u32),
    /// It's some arbitrary raw bytes.
    Raw(Vec<u8>),
    /// It's a 32 byte representation.
    Address32([u8; 32]),
    /// Its a 20 byte representation.
    Address20([u8; 20]),
}
