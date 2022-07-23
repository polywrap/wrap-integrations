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
    pub fn signer_account<P>(signer: &P) -> AccountId32
    where
        P: Pair,
        MultiSigner: From<P::Public>,
    {
        let multi_signer = MultiSigner::from(signer.public());
        multi_signer.into_account()
    }

    pub fn get_nonce_for_account(&self, account: &AccountId32) -> Result<u32, Error> {
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

    pub fn get_account_info(&self, account_id: &AccountId32) -> Result<Option<AccountInfo>, Error> {
        self.fetch_storage_map("System", "Account", account_id)
    }

    pub fn pallet_call_index(&self, pallet_name: &str, call_name: &str) -> Result<[u8; 2], Error> {
        Ok(self.metadata().pallet_call_index(pallet_name, call_name)?)
    }

    pub fn unsigned_extrinsic<Call>(&self, call: Call) -> UncheckedExtrinsicV4<Call>
    where
        Call: Encode,
    {
        UncheckedExtrinsicV4::new_unsigned(call)
    }

    pub fn sign_extrinsic<P, Call>(
        &self,
        signer: P,
        call: Call,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Call: Encode + Clone + fmt::Debug,
    {
        let xt = self.sign_extrinsic_with_extra(signer, call, None)?;
        Ok(xt)
    }

    pub fn sign_extrinsic_with_extra<P, Call>(
        &self,
        signer: P,
        call: Call,
        extra: Option<GenericExtra>,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Call: Encode + Clone + fmt::Debug,
    {
        let nonce = self.get_nonce(&signer)?;
        let extra: GenericExtra =
            extra.unwrap_or(GenericExtra::immortal_with_nonce_and_tip(nonce, 0));
        Ok(self.sign_extrinsic_with_extra_and_hash(signer, call, extra, None)?)
    }

    pub fn compose_payload_with_extra<Call>(
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

    pub fn sign_payload<P, Call>(
        signer: P,
        raw_payload: SignedPayload<Call>,
    ) -> Result<MultiSignature, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Call: Encode + Clone + fmt::Debug,
    {
        let signature: P::Signature =
            raw_payload.using_encoded(|payload| Self::sign_message(&signer, payload));
        let multi_signature = MultiSignature::from(signature);
        Ok(multi_signature)
    }

    pub fn derive_signer_address<P>(signer: &P) -> GenericAddress
    where
        P: Pair,
        MultiSigner: From<P::Public>,
    {
        let signer_account = Self::signer_account(signer);
        GenericAddress::from(signer_account)
    }

    pub fn sign_extrinsic_with_extra_and_hash<P, Call>(
        &self,
        signer: P,
        call: Call,
        extra: GenericExtra,
        head_hash: Option<H256>,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Call: Encode + Clone + fmt::Debug,
    {
        let raw_payload: SignedPayload<Call> =
            self.compose_payload_with_extra(call.clone(), extra.clone(), head_hash)?;

        let signer_address = Self::derive_signer_address(&signer);
        let multi_signature = Self::sign_payload(signer, raw_payload)?;

        Ok(UncheckedExtrinsicV4::new_signed(
            call,
            signer_address,
            multi_signature,
            extra,
        ))
    }

    pub fn sign_extrinsic_with_params_and_hash<P, Params, Tip, Call>(
        &self,
        signer: P,
        call: Call,
        extrinsic_params: Option<Params::OtherParams>,
        head_hash: Option<H256>,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Params: ExtrinsicParams<OtherParams = BaseExtrinsicParamsBuilder<Tip>>,
        u128: From<Tip>,
        Tip: Encode + Default,
        Call: Encode + Clone + fmt::Debug,
    {
        let nonce = self.get_nonce(&signer)?;
        println!("nonce: {}", nonce);
        let extra = Self::convert_to_generic_extra::<Params, Tip>(nonce, extrinsic_params);
        let xt = self.sign_extrinsic_with_extra_and_hash(signer, call, extra, head_hash)?;
        Ok(xt)
    }

    pub fn sign_extrinsic_with_params<P, Params, Tip, Call>(
        &self,
        signer: P,
        call: Call,
        extrinsic_params: Option<Params::OtherParams>,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Params: ExtrinsicParams<OtherParams = BaseExtrinsicParamsBuilder<Tip>>,
        u128: From<Tip>,
        Tip: Encode + Default,
        Call: Encode + Clone + fmt::Debug,
    {
        let nonce = self.get_nonce(&signer)?;
        println!("nonce: {}", nonce);
        let extra = Self::convert_to_generic_extra::<Params, Tip>(nonce, extrinsic_params);
        let xt = self.sign_extrinsic_with_extra(signer, call, Some(extra))?;
        Ok(xt)
    }

    /// create an UncheckedExtrisic<Call>
    /// This is a simplified version of compose_extrinsic_with_params
    /// but has less generics to deal with
    pub fn compose_extrinsics<P, Call>(
        &self,
        signer: Option<P>,
        call: Call,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Call: Encode + Clone + fmt::Debug,
    {
        match signer {
            None => Ok(self.unsigned_extrinsic(call)),
            Some(signer) => Ok(self.sign_extrinsic(signer, call)?),
        }
    }

    fn convert_to_generic_extra<Params, Tip>(
        nonce: u32,
        extrinsic_params: Option<Params::OtherParams>,
    ) -> GenericExtra
    where
        Params: ExtrinsicParams<OtherParams = BaseExtrinsicParamsBuilder<Tip>>,
        u128: From<Tip>,
        Tip: Encode + Default,
    {
        let other_params: BaseExtrinsicParamsBuilder<Tip> = extrinsic_params.unwrap_or_default();
        let params: BaseExtrinsicParams<Tip> = BaseExtrinsicParams::new(nonce, other_params);
        let extra: GenericExtra = GenericExtra::from(params);
        extra
    }

    /// create an UncheckedExtrinsic from call with an optional signer
    pub fn compose_extrinsic_with_params<P, Params, Tip, Call>(
        &self,
        signer: Option<P>,
        call: Call,
        extrinsic_params: Option<Params::OtherParams>,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        P: Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Params: ExtrinsicParams<OtherParams = BaseExtrinsicParamsBuilder<Tip>>,
        u128: From<Tip>,
        Tip: Encode + Default,
        Call: Encode + Clone + fmt::Debug,
    {
        match signer {
            None => Ok(self.unsigned_extrinsic(call)),
            Some(signer) => Ok(self.sign_extrinsic_with_params::<P, Params, Tip, Call>(
                signer,
                call,
                extrinsic_params,
            )?),
        }
    }

    /// sign a bytes with the specified signer
    /// TODO: This should call an external API for the runtime
    /// otherwise, this api acts as if it is a wallet
    pub fn sign_message<P>(signer: &P, payload: &[u8]) -> P::Signature
    where
        P: Pair,
    {
        signer.sign(payload)
    }

    /// A simplified version of sign_and_submit_extrisic_with_params
    /// with less Generic parameters to deal with
    pub fn sign_and_submit_extrinsic<P, Call>(
        &self,
        signer: P,
        call: Call,
    ) -> Result<Option<H256>, Error>
    where
        P: sp_core::crypto::Pair,
        MultiSigner: From<P::Public>,
        MultiSignature: From<P::Signature>,
        Call: Clone + fmt::Debug + Encode,
    {
        let xt = self.sign_extrinsic::<P, Call>(signer, call)?;
        Ok(self.submit_extrinsic(xt)?)
    }

    pub fn sign_and_submit_extrinsic_with_params<P, Params, Tip, Call>(
        &self,
        signer: P,
        call: Call,
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
        let xt = self.sign_extrinsic_with_params::<P, Params, Tip, Call>(
            signer,
            call,
            extrinsic_params,
        )?;
        Ok(self.submit_extrinsic(xt)?)
    }

    /// submit the extrinsic into the node
    pub fn submit_extrinsic<Call>(
        &self,
        xt: UncheckedExtrinsicV4<Call>,
    ) -> Result<Option<H256>, Error>
    where
        Call: Clone + fmt::Debug + Encode,
    {
        let encoded = xt.hex_encode();
        Ok(self.author_submit_extrinsic(&encoded)?)
    }

    /// a simpler version of signing a call, with no tip, no perio, no head_hash
    pub fn sign_call_with_message_signer<Call, SignFn, R>(
        &self,
        signer_account: AccountId32,
        signing_function: SignFn,
        call: Call,
    ) -> Result<UncheckedExtrinsicV4<Call>, Error>
    where
        Call: Encode + Clone + fmt::Debug,
        SignFn: Fn(&[u8]) -> R,
        MultiSignature: From<R>,
    {
        let nonce = self.get_nonce_for_account(&signer_account)?;
        let signer_address = GenericAddress::from(signer_account);
        let extra = GenericExtra::immortal_with_nonce_and_tip(nonce, 0);
        let raw_payload: SignedPayload<Call> =
            self.compose_payload_with_extra(call.clone(), extra.clone(), None)?;

        let signature = raw_payload.using_encoded(signing_function);
        let multi_signature = MultiSignature::from(signature);

        Ok(UncheckedExtrinsicV4::new_signed(
            call,
            signer_address,
            multi_signature,
            extra,
        ))
    }
}
