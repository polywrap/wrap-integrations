//! Contains the api specific to balances pallet
//! Balance transfer, set_balance api
use crate::{error::Error, types::extrinsics::GenericAddress, Api};
use codec::Compact;
use sp_core::{crypto::AccountId32, Pair, H256};
use sp_runtime::generic::Era;
use sp_runtime::MultiAddress;
use sp_runtime::{MultiSignature, MultiSigner};

const BALANCES: &str = "Balances";
const TRANSFER: &str = "transfer";

impl Api {
    /// transfer an amount using a signer `from` to account `to` with `amount` and `tip`
    pub fn balance_transfer<P>(
        &self,
        from: P,
        to: AccountId32,
        amount: u128,
        tip: Option<u128>,
    ) -> Result<Option<H256>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        AccountId32: From<P::Public>,
        MultiSignature: From<P::Signature>,
    {
        let balance_call_index: [u8; 2] =
            self.pallet_call_index(BALANCES, TRANSFER)?;

        let balance_call: ([u8; 2], GenericAddress, Compact<u128>) =
            (balance_call_index, GenericAddress::Id(to), Compact(amount));

        let extrinsic =
            self.sign_extrinsic(&from, balance_call.clone(), tip)?;
        let encoded = extrinsic.hex_encode();
        let tx_hash = self.author_submit_extrinsic(encoded)?;
        Ok(tx_hash)
    }

    /// compose a payload and extra for a balance transfer
    /// call and return the payload for the purpose of signing
    /// it in the client, together with the extra
    pub fn compose_balance_transfer(
        &self,
        nonce: u32,
        to: MultiAddress<AccountId32, ()>,
        amount: u128,
        era: Option<Era>,
        head_hash: Option<H256>,
        tip: Option<u128>,
    ) -> Result<(Vec<u8>, Vec<u8>), Error> {
        let balance_call_index: [u8; 2] =
            self.pallet_call_index(BALANCES, TRANSFER)?;

        let balance_call: (
            [u8; 2],
            MultiAddress<AccountId32, ()>,
            Compact<u128>,
        ) = (balance_call_index, to, Compact(amount));

        self.compose_opaque_payload_and_extra(
            nonce,
            balance_call,
            era,
            head_hash,
            tip,
        )
    }

    /// submit a balance call together with the signature attached
    /// Note: That the passed parameters here must be the same
    /// as the parameters passed in the compose_balance_transfer,
    /// any slight changes would cause submission of the balance call to fail
    pub fn submit_signed_balance_call(
        &self,
        signer_account: AccountId32,
        to: MultiAddress<AccountId32, ()>,
        amount: u128,
        extra: Vec<u8>,
        multi_signature: MultiSignature,
    ) -> Result<Option<H256>, Error> {
        let balance_call_index: [u8; 2] =
            self.pallet_call_index(BALANCES, TRANSFER)?;

        let balance_call: (
            [u8; 2],
            MultiAddress<AccountId32, ()>,
            Compact<u128>,
        ) = (balance_call_index, to, Compact(amount));

        self.submit_signed_call(
            balance_call,
            &signer_account,
            multi_signature,
            extra,
        )
    }
}
