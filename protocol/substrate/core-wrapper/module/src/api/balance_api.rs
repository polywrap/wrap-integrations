//! Contains the api specific to balances pallet
//! Balance transfer, set_balance api
use crate::{
    error::Error,
    types::{
        account_info::BlockNumber,
        extrinsic_params::{
            PlainTip,
            PlainTipExtrinsicParams,
            PlainTipExtrinsicParamsBuilder,
        },
        extrinsics::GenericAddress,
    },
    Api,
};
use codec::Compact;
use sp_core::{
    crypto::AccountId32,
    Pair,
    H256,
};
use sp_runtime::{
    generic::{
        Era,
        Header,
    },
    traits::BlakeTwo256,
    MultiSignature,
    MultiSigner,
};

const BALANCES: &str = "Balances";

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
        MultiSignature: From<P::Signature>,
    {
        let balance_call_index: [u8; 2] =
            self.pallet_call_index(BALANCES, "transfer")?;

        let balance_call: ([u8; 2], GenericAddress, Compact<u128>) =
            (balance_call_index, GenericAddress::Id(to), Compact(amount));

        if let Some(tip) = tip {
            let genesis_hash = self.genesis_hash();

            let tx_params = PlainTipExtrinsicParamsBuilder::new()
                .tip(tip)
                .era(Era::Immortal, genesis_hash);

            let result = self.sign_and_submit_extrinsic_with_params::<P, PlainTipExtrinsicParams, PlainTip,
            ([u8; 2], GenericAddress, Compact<u128>)>(from, balance_call, Some(tx_params))?;
            Ok(result)
        } else {
            //Note: would be exequivalent to calling sign_and_submit_extrisic_with_params and
            //passing None to the last argument of the function.
            //This is using the simplified version of test it's usage as well
            let result = self
                .sign_and_submit_extrinsic::<P, ([u8; 2], GenericAddress, Compact<u128>)>(
                    from,
                    balance_call,
                )?;
            Ok(result)
        }
    }
}
