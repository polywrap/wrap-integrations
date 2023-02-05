//!
//! Extrinsic API
//!
//! Extension to the API for building, signing and submitting extrinsics
//!

use crate::{
    api::Api,
    error::Error,
    types::{
        account_info::AccountInfo, extrinsic::ExtrinsicBuilder,
        extrinsic_params::ExtrinsicParams,
    },
    utils::Encoded,
};
use codec::Encode;
use sp_core::crypto::{Pair, Ss58Codec};
use sp_runtime::{traits::IdentifyAccount, AccountId32, MultiSigner};

impl Api {
    pub fn signer_account<P>(signer: &P) -> AccountId32
    where
        P: Pair,
        MultiSigner: From<P::Public>,
    {
        let multi_signer = MultiSigner::from(signer.public());
        multi_signer.into_account()
    }

    pub fn get_nonce_for_account(
        &self,
        account: &AccountId32,
    ) -> Result<u32, Error> {
        let account_info = self.get_account_info(account)?;
        match account_info {
            None => Ok(0),
            Some(account_info) => Ok(account_info.nonce),
        }
    }

    pub fn get_nonce<P>(&self, signer: &P) -> Result<u32, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
    {
        let signer_account = Self::signer_account(signer);
        self.get_nonce_for_account(&signer_account)
    }

    pub fn get_account_info(
        &self,
        account_id: &AccountId32,
    ) -> Result<Option<AccountInfo>, Error> {
        self.fetch_storage_map("System", "Account", account_id)
    }

    // SCALE encode call data to bytes (pallet u8, call u8, call params).
    fn encode_call_data(
        &self,
        pallet_name: &str,
        call_name: &str,
        call_params: &str,
    ) -> Result<Encoded, Error> {
        let mut out = vec![];
        let [pallet_index, call_name] =
            self.metadata.pallet_call_index(pallet_name, call_name)?;
        let call_params = hex::decode(call_params.trim_start_matches("0x"))
            .expect("Failed to decode call data");

        pallet_index.encode_to(&mut out);
        call_name.encode_to(&mut out);
        Encoded(call_params).encode_to(&mut out);

        Ok(Encoded(out))
    }

    // Construct custom additional/extra params.
    fn construct_params(
        &self,
        account_id: &AccountId32,
    ) -> Result<ExtrinsicParams, Error> {
        Ok(ExtrinsicParams::new(
            self.get_nonce_for_account(&account_id)?,
            self.runtime_version.spec_version,
            self.runtime_version.transaction_version,
            self.genesis_hash,
            None,
            None,
            None,
        ))
    }

    /// Create signed extrinsic.
    pub fn create_signed(
        &self,
        signer: &str,
        pallet_name: &str,
        call_name: &str,
        call_params: &str,
    ) -> Result<Vec<u8>, Error> {
        let account_id = AccountId32::from_ss58check(&signer)
            .expect("must be a valid ss58check format");

        // 1. SCALE encode call data to bytes (pallet u8, call u8, call params).
        let call_data =
            self.encode_call_data(&pallet_name, &call_name, &call_params)?;

        // 2. Construct our custom additional/extra params.
        let additional_and_extra_params = self.construct_params(&account_id)?;

        // 3. Build extrinsic, now that we have the parts we need. This is compatible
        //    with the Encode impl for UncheckedExtrinsic (protocol version 4).
        Ok(
            ExtrinsicBuilder::new(call_data, additional_and_extra_params)
                .build(account_id),
        )
    }
}
