---
id: objects
title: Object Types
sidebar_position: 2
---


### AccessKey 

```graphql
type AccessKey {
  nonce: BigInt! 
  permission: AccessKeyPermission! 
}
```

### AccessKeyInfo 

```graphql
type AccessKeyInfo {
  publicKey: String! 
  accessKey: AccessKey! 
}
```

### AccessKeyPermission 

```graphql
type AccessKeyPermission {
  isFullAccess: Boolean! 
  receiverId: String 
  methodNames: String[] 
  allowance: BigInt 
}
```

### AccessKeyWithPublicKey 

```graphql
type AccessKeyWithPublicKey {
  account_id: String! 
  public_key: String! 
}
```

### AccountAuthorizedApp 

```graphql
type AccountAuthorizedApp {
  contractId: String! 
  amount: String! 
  publicKey: String! 
}
```

### AccountBalance 

```graphql
type AccountBalance {
  total: String! 
  stateStaked: String! 
  staked: String! 
  available: String! 
}
```

### AccountView 

```graphql
type AccountView {
  amount: String! 
  locked: String! 
  codeHash: String! 
  storageUsage: BigInt! 
  storagePaidAt: BigInt! 
  blockHeight: BigInt! 
  blockHash: String! 
}
```

### BlockChange 

```graphql
type BlockChange {
  changeType: String! 
  account_id: String! 
}
```

### BlockChangeResult 

```graphql
type BlockChangeResult {
  block_hash: String! 
  changes: BlockChange[]! 
}
```

### BlockHeader 

```graphql
type BlockHeader {
  height: BigInt! 
  epoch_id: String! 
  next_epoch_id: String! 
  hash: String! 
  prev_hash: String! 
  prev_state_root: String! 
  chunk_receipts_root: String! 
  chunk_headers_root: String! 
  chunk_tx_root: String! 
  outcome_root: String! 
  chunks_included: BigInt! 
  challenges_root: String! 
  timestamp: BigInt! 
  timestamp_nanosec: String! 
  random_value: String! 
  validator_proposals: JSON[]! 
  chunk_mask: Boolean[]! 
  gas_price: String! 
  rent_paid: String! 
  validator_reward: String! 
  total_supply: String! 
  challenges_result: JSON[]! 
  last_final_block: String! 
  last_ds_final_block: String! 
  next_bp_hash: String! 
  block_merkle_root: String! 
  approvals: String[]! 
  signature: String! 
  latest_protocol_version: BigInt! 
}
```

### BlockHeaderInnerLiteView 

```graphql
type BlockHeaderInnerLiteView {
  height: BigInt! 
  epoch_id: String! 
  next_epoch_id: String! 
  prev_state_root: String! 
  outcome_root: String! 
  timestamp: BigInt! 
  next_bp_hash: String! 
  block_merkle_root: String! 
}
```

### BlockReference 

```graphql
type BlockReference {
  block_id: String 
  finality: String 
  syncCheckpoint: String 
}
```

### BlockResult 

```graphql
type BlockResult {
  author: String! 
  header: BlockHeader! 
  chunks: Chunk[]! 
}
```

### ChangeResult 

```graphql
type ChangeResult {
  block_hash: String! 
  changes: JSON[]! 
}
```

### Chunk 

```graphql
type Chunk {
  chunk_hash: String! 
  prev_block_hash: String! 
  outcome_root: String! 
  prev_state_root: String! 
  encoded_merkle_root: String! 
  encoded_length: BigInt! 
  height_created: BigInt! 
  height_included: BigInt! 
  shard_id: BigInt! 
  gas_used: BigInt! 
  gas_limit: BigInt! 
  rent_paid: String! 
  validator_reward: String! 
  balance_burnt: String! 
  outgoing_receipts_root: String! 
  tx_root: String! 
  validator_proposals: JSON[]! 
  signature: String! 
}
```

### ChunkHeader 

```graphql
type ChunkHeader {
  balance_burnt: String! 
  chunk_hash: String! 
  encoded_length: BigInt! 
  encoded_merkle_root: String! 
  gas_limit: BigInt! 
  gas_used: String! 
  height_created: BigInt! 
  height_included: BigInt! 
  outgoing_receipts_root: String! 
  prev_block_hash: String! 
  prev_state_root: String! 
  rent_paid: String! 
  shard_id: BigInt! 
  signature: String! 
  tx_root: String! 
  validator_proposals: JSON[]! 
  validator_reward: String! 
}
```

### ChunkResult 

```graphql
type ChunkResult {
  header: ChunkHeader! 
  receipts: JSON[]! 
  transactions: Near_Transaction[]! 
}
```

### ContractStateResult 

```graphql
type ContractStateResult {
  values: KeyValuePair[]! 
}
```

### CurrentEpochValidatorInfo 

```graphql
type CurrentEpochValidatorInfo {
  account_id: String! 
  public_key: String! 
  is_slashed: Boolean! 
  stake: String! 
  shards: BigInt[]! 
  num_produced_blocks: UInt! 
  num_expected_blocks: UInt! 
}
```

### EpochValidatorInfo 

```graphql
type EpochValidatorInfo {
  next_validators: NextEpochValidatorInfo[]! 
  current_validators: CurrentEpochValidatorInfo[]! 
  next_fisherman: ValidatorStakeView[]! 
  current_fisherman: ValidatorStakeView[]! 
  current_proposals: ValidatorStakeView[]! 
  prev_epoch_kickout: ValidatorStakeView[]! 
  epoch_start_height: BigInt! 
  epoch_height: BigInt! 
}
```

### KeyValueCode 

```graphql
type KeyValueCode {
  code_base64: String! 
  hash: String! 
  block_height: BigInt! 
  block_hash: String! 
}
```

### KeyValuePair 

```graphql
type KeyValuePair {
  key: String! 
  value: String! 
}
```

### LightClientBlockLiteView 

```graphql
type LightClientBlockLiteView {
  prev_block_hash: String! 
  inner_rest_hash: String! 
  inner_lite: BlockHeaderInnerLiteView! 
}
```

### LightClientProof 

```graphql
type LightClientProof {
  outcome_proof: Near_ExecutionOutcomeWithId! 
  outcome_root_proof: Near_ExecutionProof[]! 
  block_header_lite: LightClientBlockLiteView! 
  block_proof: Near_ExecutionProof[]! 
}
```

### LightClientProofRequest 

```graphql
type LightClientProofRequest {
  type: IdType! 
  light_client_head: String! 
  transaction_hash: String 
  sender_id: String 
  receipt_id: String 
  receiver_id: String 
}
```

### NearProtocolConfig 

```graphql
type NearProtocolConfig {
  runtime_config: NearProtocolRuntimeConfig! 
}
```

### NearProtocolRuntimeConfig 

```graphql
type NearProtocolRuntimeConfig {
  storage_amount_per_byte: String! 
}
```

### NextEpochValidatorInfo 

```graphql
type NextEpochValidatorInfo {
  account_id: String! 
  public_key: String! 
  stake: String! 
  shards: BigInt[]! 
}
```

### NodeStatusResult 

```graphql
type NodeStatusResult {
  chain_id: String! 
  rpc_addr: String! 
  sync_info: SyncInfo! 
  validators: String[]! 
  version: Version! 
}
```

### QueryResponseKind 

```graphql
type QueryResponseKind {
  blockHeight: BigInt! 
  blockHash: String! 
}
```

### SyncInfo 

```graphql
type SyncInfo {
  latest_block_hash: String! 
  latest_block_height: BigInt! 
  latest_block_time: String! 
  latest_state_root: String! 
  syncing: Boolean! 
}
```

### ValidatorStakeView 

```graphql
type ValidatorStakeView {
  account_id: String! 
  public_key: String! 
  stake: String! 
}
```

### Version 

```graphql
type Version {
  version: String! 
  build: String! 
}
```

### ViewContractCode 

```graphql
type ViewContractCode {
  code_base64: String! 
  hash: String! 
  block_height: BigInt! 
  block_hash: String! 
}
```

