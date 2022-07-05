use crate::{
    api::Api,
    error::Error,
    types::{
        account_info::AccountInfo,
        extrinsic_params::{
            BaseExtrinsicParams, BaseExtrinsicParamsBuilder, ExtrinsicParams, GenericExtra,
            SignedPayload,
        },
        extrinsics::{GenericAddress, UncheckedExtrinsicV4},
    },
};
use codec::Encode;
use sp_core::{crypto::Pair, H256};
use sp_runtime::{traits::IdentifyAccount, AccountId32, MultiSignature, MultiSigner};
use std::fmt;

impl Api {
    pub fn signer_account<P>(&self, signer: &P) -> AccountId32
    where
        P: Pair,
        MultiSigner: From<P::Public>,
    {
        let multi_signer = MultiSigner::from(signer.public());
        multi_signer.into_account()
    }

    pub fn get_nonce<P>(&self, signer: &P) -> Result<u32, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
    {
        let signer_account = self.signer_account(signer);
        let account_info = self.get_account_info(signer_account)?;
        match account_info {
            None => Ok(0),
            Some(account_info) => Ok(account_info.nonce),
        }
    }

    pub fn get_account_info(&self, account_id: AccountId32) -> Result<Option<AccountInfo>, Error> {
        self.fetch_storage_map("System", "Account", account_id)
    }

    pub fn unsigned_extrinsic<Call>(&self, call: Call) -> UncheckedExtrinsicV4<Call>
    where
        Call: Encode,
    {
        UncheckedExtrinsicV4::new_unsigned(call)
    }

    pub fn compose_extrinsics<P, Params, Tip, Call>(
        &self,
        signer: Option<P>,
        call: Call,
        head_hash: Option<H256>,
        extrinsic_params: Option<Params::OtherParams>,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        Params: ExtrinsicParams<OtherParams = BaseExtrinsicParamsBuilder<Tip>>,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        u128: From<Tip>,
        Tip: Encode + Default,
        Call: Encode + Clone + fmt::Debug,
    {
        match signer {
            None => Ok(self.unsigned_extrinsic(call)),
            Some(signer) => {
                let nonce = self.get_nonce(&signer)?;

                let other_params = extrinsic_params.unwrap_or_default();
                let params: BaseExtrinsicParams<Tip> =
                    BaseExtrinsicParams::new(nonce, other_params);
                let extra = GenericExtra::from(params);
                let head_or_genesis_hash = match head_hash {
                    Some(hash) => hash,
                    None => self.genesis_hash,
                };
                let raw_payload = SignedPayload::from_raw(
                    call.clone(),
                    extra.clone(),
                    (
                        self.runtime_version.spec_version,
                        self.runtime_version.transaction_version,
                        self.genesis_hash,
                        head_or_genesis_hash,
                        (),
                        (),
                        (),
                    ),
                );
                let signature: P::Signature =
                    raw_payload.using_encoded(|payload| signer.sign(payload));
                let multi_signer = MultiSigner::from(signer.public());
                let multi_signature = MultiSignature::from(signature);
                Ok(UncheckedExtrinsicV4::new_signed(
                    call,
                    GenericAddress::from(multi_signer.into_account()),
                    multi_signature,
                    extra,
                ))
            }
        }
    }

    pub fn execute_extrinsic<P, Params, Tip, Call>(
        &self,
        signer: Option<P>,
        call: Call,
        head_hash: Option<H256>,
        extrinsic_params: Option<Params::OtherParams>,
    ) -> Result<Option<H256>, Error>
    where
        P: sp_core::crypto::Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Params: ExtrinsicParams<OtherParams = BaseExtrinsicParamsBuilder<Tip>>,
        u128: From<Tip>,
        Tip: Encode + Default,
        Call: Clone + fmt::Debug + Encode,
    {
        let xt = self.compose_extrinsics::<P, Params, Tip, Call>(
            signer,
            call,
            head_hash,
            extrinsic_params,
        )?;

        let encoded = xt.hex_encode();
        self.author_submit_extrinsic(&encoded)
    }
}
