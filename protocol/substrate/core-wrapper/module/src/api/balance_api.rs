//! Balance transfer, set_balance api
use crate::{
    error::Error,
    types::{
        extrinsic_params::{PlainTip, PlainTipExtrinsicParams},
        extrinsics::GenericAddress,
    },
    Api, Metadata,
};
use codec::Compact;
use sp_core::{crypto::AccountId32, sr25519::Pair};
use sp_keyring::AccountKeyring;

impl Api {
    pub fn balance_transfer(
        &self,
        from: Pair,
        to: AccountId32,
        amount: u128,
    ) -> Result<Option<serde_json::Value>, Error> {
        let balance_pallet = self.metadata.pallet("Balances")?;
        let balance_transfer_call_index = balance_pallet
            .calls
            .get("transfer")
            .expect("unable to find transfer function");

        let balance_call = (
            [balance_pallet.index, *balance_transfer_call_index],
            GenericAddress::Id(to),
            Compact(amount),
        );
        let xt = self.compose_extrinsics::<Pair, PlainTipExtrinsicParams, PlainTip,
            ([u8; 2], GenericAddress, Compact<u128>),
            >(Some(from), balance_call, None, None)?;
        let encoded = xt.hex_encode();
        self.author_submit_extrinsic(&encoded)
    }
}
