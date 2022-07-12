use crate::{api::Api, utils::FromHexStr, Error};
use codec::{Decode, Encode};
use sp_core::storage::StorageKey;

impl Api {
    // curl -H "Content-Type: application/json" -d '{"id":"1","jsonrpc":"2.0","method":"state_getStorage","params":["0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9de1e86a9a8c739864cf3cc5ec2bea59fd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",null]}' http://localhost:9933/
    pub fn fetch_storage_value<V>(
        &self,
        module: &str,
        storage_name: &str,
    ) -> Result<Option<V>, Error>
    where
        V: Decode,
    {
        let storage_key = self.metadata.storage_value_key(module, storage_name)?;
        self.fetch_storage_by_key_hash(storage_key)
    }

    pub fn fetch_storage_map<K, V>(
        &self,
        module: &str,
        storage_name: &str,
        key: K,
    ) -> Result<Option<V>, Error>
    where
        K: Encode,
        V: Decode,
    {
        let storage_key = self.metadata.storage_map_key(module, storage_name, key)?;
        self.fetch_storage_by_key_hash(storage_key)
    }

    pub fn fetch_storage_double_map<K, Q, V>(
        &self,
        module: &str,
        storage_name: &str,
        first: K,
        second: Q,
    ) -> Result<Option<V>, Error>
    where
        K: Encode,
        Q: Encode,
        V: Decode,
    {
        let storage_key =
            self.metadata
                .storage_double_map_key(module, storage_name, first, second)?;
        self.fetch_storage_by_key_hash(storage_key)
    }

    pub fn fetch_storage_by_key_hash<V>(&self, storage_key: StorageKey) -> Result<Option<V>, Error>
    where
        V: Decode,
    {
        match self.fetch_opaque_storage_by_key_hash(storage_key)? {
            Some(storage) => Ok(Some(Decode::decode(&mut storage.as_slice())?)),
            None => Ok(None),
        }
    }

    pub fn fetch_opaque_storage_value(
        &self,
        module: &str,
        storage_name: &str,
    ) -> Result<Option<Vec<u8>>, Error> {
        let storage_key = self.metadata.storage_value_key(module, storage_name)?;
        self.fetch_opaque_storage_by_key_hash(storage_key)
    }

    pub fn fetch_opaque_storage_map<K>(
        &self,
        module: &str,
        storage_name: &str,
        key: K,
    ) -> Result<Option<Vec<u8>>, Error>
    where
        K: Encode,
    {
        let storage_key = self.metadata.storage_map_key(module, storage_name, key)?;
        self.fetch_opaque_storage_by_key_hash(storage_key)
    }

    pub fn fetch_opaque_storage_double_map<K, Q>(
        &self,
        module: &str,
        storage_name: &str,
        first: K,
        second: Q,
    ) -> Result<Option<Vec<u8>>, Error>
    where
        K: Encode,
        Q: Encode,
    {
        let storage_key =
            self.metadata
                .storage_double_map_key(module, storage_name, first, second)?;
        self.fetch_opaque_storage_by_key_hash(storage_key)
    }

    fn fetch_opaque_storage_by_key_hash(
        &self,
        storage_key: StorageKey,
    ) -> Result<Option<Vec<u8>>, Error> {
        let value = self
            .base_api
            .json_request_value("state_getStorage", [storage_key])?;

        match value {
            Some(value) => {
                let value_str = value.as_str().expect("must be a str");
                let data = Vec::from_hex(value_str)?;
                println!("data: {:?}", data);
                Ok(Some(data))
            }
            None => Ok(None),
        }
    }
}
