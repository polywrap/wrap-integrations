#![deny(warnings)]

#[allow(warnings)]
pub mod wrap;
pub use api::Api;
use api::BaseApi;

pub use error::Error;
use num_traits::cast::FromPrimitive;
use polywrap_wasm_rs::BigNumber;
use scale_info::{TypeDef, TypeDefPrimitive};
use sp_core::crypto::{AccountId32, Ss58Codec};

use crate::types::extrinsics::UncheckedExtrinsicV4;
pub use types::metadata::Metadata;
pub use wrap::imported::SignerProviderSignerPayloadJSON as ExtrinsicPayload;
use wrap::imported::*;
pub use wrap::*;

mod api;
mod error;
mod types;
mod utils;

#[macro_export]
macro_rules! debug {
    ($($arg: expr),*) => {
        polywrap_wasm_rs::wrap_debug_log(&format!($($arg,)*));
    }
}

pub fn get_signer_provider_accounts(
    _args: ArgsGetSignerProviderAccounts,
) -> Vec<SignerProviderAccount> {
    SignerProviderModule::get_accounts(
        &signer_provider_module::ArgsGetAccounts {},
    )
    .unwrap()
}

/// return the chain metadata
pub fn chain_get_metadata(
    ArgsChainGetMetadata { url }: ArgsChainGetMetadata,
) -> Option<ChainMetadata> {
    let metadata = BaseApi::new(&url).fetch_metadata();
    let meta = metadata.ok().flatten().expect("must have a metadata");

    let meta_json =
        serde_json::to_value(meta.metadata).expect("unable to convert to json");
    let pallet_json =
        serde_json::to_value(meta.pallets).expect("unable to convert to json");

    let events = meta.events.into_values().collect::<Vec<_>>();
    let events_json =
        serde_json::to_value(events).expect("unable to convert to json");
    let errors = meta.errors.into_values().collect::<Vec<_>>();
    let errors_json =
        serde_json::to_value(errors).expect("unable to convert to json");

    Some(ChainMetadata {
        metadata: meta_json,
        pallets: pallet_json,
        events: events_json,
        errors: errors_json,
    })
}

/// return the chain
pub fn get_runtime_version(
    ArgsGetRuntimeVersion { url }: ArgsGetRuntimeVersion,
) -> Option<RuntimeVersion> {
    BaseApi::new(&url)
        .fetch_runtime_version()
        .ok()
        .flatten()
        .map(|v| RuntimeVersion {
            spec_name: v.spec_name.to_string(),
            impl_name: v.impl_name.to_string(),
            authoring_version: v.authoring_version,
            spec_version: v.spec_version,
            impl_version: v.impl_version,
            transaction_version: v.transaction_version,
            state_version: v.state_version,
        })
}

/// return the rpc methods exposed in this chain
pub fn rpc_methods(
    ArgsRpcMethods { url }: ArgsRpcMethods,
) -> Option<Vec<String>> {
    BaseApi::new(&url).fetch_rpc_methods().ok().flatten()
}

/// return the block hash of a block with the specified block number `number`.
pub fn block_hash(
    ArgsBlockHash { url, number }: ArgsBlockHash,
) -> Option<String> {
    let api = BaseApi::new(&url);
    let block_hash = api.fetch_block_hash(number);
    block_hash.ok().flatten().map(|h| format!("{:#x}", h))
}

/// return the genesis_hash
pub fn genesis_hash(
    ArgsGenesisHash { url }: ArgsGenesisHash,
) -> Option<String> {
    let api = BaseApi::new(&url);
    let block_hash = api.fetch_genesis_hash();
    block_hash.ok().flatten().map(|h| format!("{:#x}", h))
}

/// return the Block at number
pub fn chain_get_block(
    ArgsChainGetBlock { url, number }: ArgsChainGetBlock,
) -> Option<BlockOutput> {
    let api = BaseApi::new(&url);
    let block = api.fetch_opaque_block(number);
    block.ok().flatten().map(|block| BlockOutput { block })
}

/// return value of storage from a module and storage name
pub fn get_storage_value(
    ArgsGetStorageValue {
        url,
        pallet,
        storage,
    }: ArgsGetStorageValue,
) -> Option<Vec<u8>> {
    if let Ok(api) = Api::new(&url) {
        api.fetch_opaque_storage_value(&pallet, &storage)
            .ok()
            .flatten()
    } else {
        None
    }
}

/// Get the value in bytes from a storage map from a pallet with the specified `key`.
pub fn get_storage_map(
    ArgsGetStorageMap {
        url,
        pallet,
        storage,
        key,
    }: ArgsGetStorageMap,
) -> Option<Vec<u8>> {
    Api::new(&url)
        .ok()
        .map(|api| {
            let (key_type, _value_type) = api
                .storage_map_type(&pallet, &storage)
                .ok()
                .flatten()
                .expect("must have a type");

            if let TypeDef::Primitive(primitive) = key_type.type_def() {
                //TODO: make this exhaustive to support i8,i16,i32,i64,i128 and u8,u16,u32,u64,u128
                match primitive {
                    TypeDefPrimitive::U32 => {
                        assert!(key.is_number());
                        let key =
                            key.as_u64().expect("must cast to u64") as u32;
                        api.fetch_opaque_storage_map(&pallet, &storage, key)
                            .ok()
                            .flatten()
                    }
                    TypeDefPrimitive::U64 => {
                        assert!(key.is_number());
                        let key =
                            key.as_u64().expect("must cast to u64") as u64;
                        api.fetch_opaque_storage_map(&pallet, &storage, key)
                            .ok()
                            .flatten()
                    }
                    TypeDefPrimitive::U128 => {
                        assert!(key.is_number());
                        let key =
                            key.as_u64().expect("must cast to u64") as u128;
                        api.fetch_opaque_storage_map(&pallet, &storage, key)
                            .ok()
                            .flatten()
                    }
                    _ => unimplemented!(),
                }
            } else {
                //TODO: this should be error for UnSupported key type
                None
            }
        })
        .flatten()
}

/// Get a the storage value in bytes from a storage map of the specified pallet.
///
/// `pallet` the pallet or module the storage belongs to.
/// `count` the number of items to be returned
/// `next_to` an optional `key` for storage map as a marker for the offset of the returned data.
pub fn get_storage_map_paged(
    ArgsGetStorageMapPaged {
        url,
        pallet,
        storage,
        count,
        next_to,
    }: ArgsGetStorageMapPaged,
) -> Option<Vec<Vec<u8>>> {
    Api::new(&url)
        .ok()
        .map(|api| {
            let (key_type, _value_type) = api
                .storage_map_type(&pallet, &storage)
                .ok()
                .flatten()
                .expect("must have a type");

            if let TypeDef::Primitive(primitive) = key_type.type_def() {
                //TODO: make this exhaustive to support i8,i16,i32,i64,i128 and u8,u16,u32,u64,u128
                match primitive {
                    TypeDefPrimitive::U32 => {
                        let next_to = next_to
                            .map(|k| k.as_u64().map(|k| k as u32))
                            .flatten();
                        api.fetch_opaque_storage_map_paged(
                            &pallet, &storage, count, next_to,
                        )
                        .ok()
                        .flatten()
                    }
                    TypeDefPrimitive::U64 => {
                        let next_to = next_to
                            .map(|k| k.as_u64().map(|k| k as u64))
                            .flatten();
                        api.fetch_opaque_storage_map_paged(
                            &pallet, &storage, count, next_to,
                        )
                        .ok()
                        .flatten()
                    }
                    TypeDefPrimitive::U128 => {
                        let next_to = next_to
                            .map(|k| k.as_u64().map(|k| k as u128))
                            .flatten();
                        api.fetch_opaque_storage_map_paged(
                            &pallet, &storage, count, next_to,
                        )
                        .ok()
                        .flatten()
                    }
                    _ => unimplemented!(),
                }
            } else {
                None
            }
        })
        .flatten()
}

/// return the constant value from a pallet
pub fn constant(
    ArgsConstant { url, pallet, name }: ArgsConstant,
) -> Option<Vec<u8>> {
    Api::new(&url)
        .ok()
        .map(|api| api.fetch_constant_opaque_value(&pallet, &name).ok())
        .flatten()
}

/// Get the account information of `account`
pub fn account_info(
    ArgsAccountInfo { url, account }: ArgsAccountInfo,
) -> Option<AccountInfo> {
    let account_id = AccountId32::from_ss58check(&account)
        .expect("must be a valid ss58check format");
    let account_info: Option<crate::types::account_info::AccountInfo> =
        Api::new(&url)
            .ok()
            .map(|api| api.get_account_info(&account_id).ok().flatten())
            .flatten();

    debug!("account info: {:#?}", account_info);

    if let Some(account_info) = account_info {
        Some(AccountInfo {
            nonce: account_info.nonce,
            consumers: account_info.consumers,
            providers: account_info.providers,
            sufficients: account_info.sufficients,
            data: AccountData {
                free: BigNumber::from_u128(account_info.data.free).unwrap(),
                reserved: BigNumber::from_u128(account_info.data.reserved)
                    .unwrap(),
                misc_frozen: BigNumber::from_u128(
                    account_info.data.misc_frozen,
                )
                .unwrap(),
                fee_frozen: BigNumber::from_u128(account_info.data.fee_frozen)
                    .unwrap(),
            },
        })
    } else {
        None
    }
}

/// Get the `nonce` for this account.
/// `nonce` are used for composing a payload derived from a call.
pub fn get_nonce_for_account(
    ArgsGetNonceForAccount { url, account }: ArgsGetNonceForAccount,
) -> Option<u32> {
    let account_id = AccountId32::from_ss58check(&account)
        .expect("must be a valid ss58check format");
    Api::new(&url)
        .ok()
        .map(|api| api.get_nonce_for_account(&account_id).ok())
        .flatten()
}

/// Get the index of the pallet and the call/function name.
/// It returns [u8;2], but since graphql don't support this type, we convert the type
/// to a Vec<u8> of 2 elements, the element in index `0` is the pallet index.
/// The element in index `1` is the call/function index.
pub fn pallet_call_index(
    ArgsPalletCallIndex { url, pallet, call }: ArgsPalletCallIndex,
) -> Option<Vec<u8>> {
    Api::new(&url)
        .ok()
        .map(|api| {
            api.pallet_call_index(&pallet, &call)
                .ok()
                .map(|v| v.to_vec())
        })
        .flatten()
}

/// Sign an extrinsic payload
/// Really just a wrapper around the signer-provider wrapper
pub fn sign(
    ArgsSign { extrinsic }: ArgsSign,
) -> Option<SignedExtrinsicPayload> {
    SignerProviderModule::sign_payload(
        &signer_provider_module::ArgsSignPayload {
            payload: extrinsic.clone(),
        },
    )
    .map(|result| SignedExtrinsicPayload {
        extrinsic,
        signature: result.signature,
    })
    .ok()
}

/// Send a signed extrinsic payload to the give RPC URL
pub fn send(
    ArgsSend {
        url,
        signed_extrinsic,
    }: ArgsSend,
) -> Option<String> {
    BaseApi::new(&url)
        .author_submit_extrinsic(
            UncheckedExtrinsicV4::try_from(signed_extrinsic)
                .unwrap()
                .hex_encode(),
        )
        .ok()
        .flatten()
        .map(|hash| format!("{:#x}", hash))
}

/// Sign an unsigned extrinsic payload and then immedietly send it
/// to the RPC. This is a common operation and saves a roundtrip
pub fn sign_and_send(
    ArgsSignAndSend { url, extrinsic }: ArgsSignAndSend,
) -> Option<String> {
    let signed_extrinsic = SignerProviderModule::sign_payload(
        &signer_provider_module::ArgsSignPayload {
            payload: extrinsic.clone(),
        },
    )
    .map(|result| SignedExtrinsicPayload {
        extrinsic,
        signature: result.signature,
    })
    .expect("Signed process failed");

    BaseApi::new(&url)
        .author_submit_extrinsic(
            UncheckedExtrinsicV4::try_from(signed_extrinsic)
                .unwrap()
                .hex_encode(),
        )
        .ok()
        .flatten()
        .map(|hash| format!("{:#x}", hash))
}
