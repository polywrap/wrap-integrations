use crate::{
    api::Api,
    error::Error,
    types::{
        account_info::AccountInfo,
        extrinsic_params::{GenericExtra, SignedPayload},
    },
};
use codec::{Compact, Encode};
use sp_core::{crypto::Pair, H256};
use sp_runtime::{
    generic::Era, traits::IdentifyAccount, AccountId32, MultiSigner,
};
use std::fmt;

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

    pub fn pallet_call_index(
        &self,
        pallet_name: &str,
        call_name: &str,
    ) -> Result<[u8; 2], Error> {
        Ok(self.metadata.pallet_call_index(pallet_name, call_name)?)
    }

    pub fn compose_payload<Call>(
        &self,
        call: Call,
        extra: GenericExtra,
        head_hash: Option<H256>,
    ) -> Result<SignedPayload<Call>, Error>
    where
        Call: Encode + Clone + fmt::Debug,
    {
        let raw_payload: SignedPayload<Call> = SignedPayload::from_raw(
            call,
            extra,
            (
                self.runtime_version.spec_version,
                self.runtime_version.transaction_version,
                self.genesis_hash,
                head_hash.unwrap_or(self.genesis_hash),
                (),
                (),
                (),
            ),
        );
        Ok(raw_payload)
    }

    /// if Era uses some period and block number, the head_hash must be the head_has of the
    /// block_number used in the era
    pub fn compose_payload_and_extra<Call>(
        &self,
        nonce: u32,
        call: Call,
        era: Option<Era>,
        head_hash: Option<H256>,
        tip: Option<u128>,
    ) -> Result<(SignedPayload<Call>, GenericExtra), Error>
    where
        Call: Clone + fmt::Debug + Encode,
    {
        let tip = tip.unwrap_or(0);
        let era = era.unwrap_or(Era::immortal());
        let extra = GenericExtra(era, Compact(nonce), Compact(tip));

        let raw_payload: SignedPayload<Call> =
            self.compose_payload(call.clone(), extra.clone(), head_hash)?;

        Ok((raw_payload, extra))
    }

    /// create a payload ready for signing and the extra in opaque bytes
    pub fn compose_opaque_payload_and_extra<Call>(
        &self,
        nonce: u32,
        call: Call,
        era: Option<Era>,
        head_hash: Option<H256>,
        tip: Option<u128>,
    ) -> Result<(Vec<u8>, Vec<u8>), Error>
    where
        Call: Clone + fmt::Debug + Encode,
    {
        let (payload, extra) =
            self.compose_payload_and_extra(nonce, call, era, head_hash, tip)?;
        let payload_encoded = payload.encode();
        let payload_for_signing = if payload_encoded.len() > 256 {
            sp_core::blake2_256(&payload_encoded).to_vec()
        } else {
            payload_encoded
        };
        Ok((payload_for_signing, extra.encode()))
    }
}
