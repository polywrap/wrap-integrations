//! Contains the api specific to balances pallet
//! Balance transfer, set_balance api
use crate::types::account_info::BlockNumber;
use crate::types::extrinsic_params::PlainTipExtrinsicParamsBuilder;
use crate::{
    error::Error,
    types::{
        extrinsic_params::{PlainTip, PlainTipExtrinsicParams},
        extrinsics::GenericAddress,
    },
    Api,
};
use codec::Compact;
use sp_core::crypto::AccountId32;
use sp_core::Pair;
use sp_core::H256;
use sp_runtime::generic::Era;
use sp_runtime::generic::Header;
use sp_runtime::traits::BlakeTwo256;
use sp_runtime::MultiSignature;
use sp_runtime::MultiSigner;

impl Api {
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
        let balance_pallet = self.metadata.pallet("Balances")?;
        let balance_transfer_call_index = balance_pallet
            .calls
            .get("transfer")
            .expect("unable to find transfer function");

        let balance_call: ([u8; 2], GenericAddress, Compact<u128>) = (
            [balance_pallet.index, *balance_transfer_call_index],
            GenericAddress::Id(to),
            Compact(amount),
        );

        let (head_hash, tx_params) = if let Some(tip) = tip {
            let genesis_hash = self.genesis_hash();
            let head_hash = self
                .chain_get_finalized_head()?
                .expect("must have a finalized head");
            let header: Header<BlockNumber, BlakeTwo256> = self
                .chain_get_header(head_hash)?
                .expect("must have a header");

            let period = 5;
            let tx_params = PlainTipExtrinsicParamsBuilder::new()
                .era(Era::mortal(period, header.number.into()), genesis_hash)
                .tip(tip);
            (Some(head_hash), Some(tx_params))
        } else {
            (None, None)
        };

        self.execute_extrinsic::<P, PlainTipExtrinsicParams, PlainTip,
            ([u8; 2], GenericAddress, Compact<u128>)>(Some(from), balance_call, head_hash, tx_params)
    }
}
