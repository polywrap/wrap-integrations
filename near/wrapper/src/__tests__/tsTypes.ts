export type UInt = number;
export type UInt8 = number;
export type UInt16 = number;
export type UInt32 = number;
export type Int = number;
export type Int8 = number;
export type Int16 = number;
export type Int32 = number;
export type Bytes = Uint8Array;
export type BigInt = string;
export type Json = string;
export type String = string;
export type Boolean = boolean;

export interface PublicKey {
  keyType: KeyType;
  data: Bytes;
}

export interface AccessKeyPermission {
  isFullAccess?: Boolean | null;
  receiverId?: String | null;
  methodNames?: Array<String> | null;
  allowance?: BigInt | null;
}

export interface AccessKey {
  nonce: BigInt;
  permission: AccessKeyPermission;
}

export interface AccessKeyInfo {
  publicKey: PublicKey;
  accessKey: AccessKey;
}

export interface Action {
  code?: Bytes | null;
  methodName?: String | null;
  args?: Bytes | null;
  gas?: BigInt | null;
  deposit?: BigInt | null;
  stake?: BigInt | null;
  publicKey?: PublicKey | null;
  accessKey?: AccessKey | null;
  beneficiaryId?: String | null;
}

export interface BlockChange {
  chagneType: String;
  account_id: String;
}

export interface BlockChangeResult {
  block_hash: String;
  changes: BlockChange[];
}

export interface ChangeResult {
  block_hash: String;
  changes: [JSON];
}

export interface Transaction {
  signerId: String;
  publicKey: PublicKey;
  nonce: BigInt;
  receiverId: String;
  actions: Array<Action>;
  blockHash?: Bytes;
  hash?: string;
}

export interface Signature {
  keyType: KeyType;
  data: Bytes;
}

export interface SignedTransaction {
  transaction: Transaction;
  signature: Signature;
}

export interface SignTransactionResult {
  hash: Bytes;
  signedTx: SignedTransaction;
}

export interface FinalExecutionStatus {
  successValue?: String | null;
  failure?: Json | null;
}

export interface CurrentEpochValidatorInfo {
  account_id: String;
  public_key: String;
  is_slashed: Boolean;
  stake: String;
  shards: [BigInt];
  num_produced_blocks: UInt;
  num_expected_blocks: UInt;
}

export interface NextEpochValidatorInfo {
  account_id: String;
  public_key: String;
  stake: String;
  shards: [BigInt];
}

export interface ValidatorStakeView {
  account_id: String;
  public_key: String;
  stake: String;
}

export interface EpochValidatorInfo {
  next_validators: [NextEpochValidatorInfo];
  current_validators: [CurrentEpochValidatorInfo];
  next_fisherman: [ValidatorStakeView];
  current_fisherman: [ValidatorStakeView];
  current_proposals: [ValidatorStakeView];
  prev_epoch_kickout: [ValidatorStakeView];
  epoch_start_height: BigInt;
  epoch_height: BigInt;
}

export interface ExecutionStatus {
  successValue?: String | null;
  successReceiptId?: String | null;
  failure?: Json | null;
}

export interface ExecutionOutcomeWithId {
  id: String;
  outcome: ExecutionOutcome;
}

export interface ExecutionOutcome {
  logs: Array<String>;
  receiptIds: Array<String>;
  gasBurnt: BigInt;
  status: ExecutionStatus;
}

export interface FinalExecutionOutcome {
  status: FinalExecutionStatus;
  transaction: Transaction;
  transaction_outcome: ExecutionOutcomeWithId;
  receipts_outcome: Array<ExecutionOutcomeWithId>;
}

export interface FinalExecutionOutcomeWithReceipts extends FinalExecutionOutcome {
  receipts: [ReceiptWithId];
}

export interface ReceiptWithId {
  predecessor_id: String;
  receipt: Receipt;
  receipt_id: String;
  receiver_id: String;
}

export interface Receipt {
  Action: ActionContainer;
}

export interface ActionContainer {
  actions: [Action];
}

export interface QueryResponseKind {
  blockHeight: BigInt;
  blockHash: String;
}

export interface AccountView {
  amount: String;
  locked: String;
  codeHash: String;
  storageUsage: BigInt;
  storagePaidAt: BigInt;
  blockHeight: BigInt;
  blockHash: String;
}

export enum KeyTypeEnum {
  ed25519,
}

export type KeyTypeString = "ed25519";

export type KeyType = KeyTypeEnum | KeyTypeString;

export interface BlockReference {
  blockId?: string;
  finality?: string;
  syncCheckpoint?: string;
}

export interface BlockHeader {
  height: string;
  epoch_id: string;
  next_epoch_id: string;
  hash: string;
  prev_hash: string;
  prev_state_root: string;
  chunk_receipts_root: string;
  chunk_headers_root: string;
  chunk_tx_root: string;
  outcome_root: string;
  chunks_included: string;
  challenges_root: string;
  timestamp: string;
  timestamp_nanosec: string;
  random_value: string;
  validator_proposals: string[];
  chunk_mask: boolean[];
  gas_price: string;
  rent_paid: string;
  validator_reward: string;
  total_supply: string;
  challenges_result: string[];
  last_final_block: string;
  last_ds_final_block: string;
  next_bp_hash: string;
  block_merkle_root: string;
  approvals: string[];
  signature: string;
  latest_protocol_version: string;
}

export interface Chunk {
  chunk_hash: string;
  prev_block_hash: string;
  outcome_root: string;
  prev_state_root: string;
  encoded_merkle_root: string;
  encoded_length: string;
  height_created: string;
  height_included: string;
  shard_id: string;
  gas_used: string;
  gas_limit: string;
  rent_paid: string;
  validator_reward: string;
  balance_burnt: string;
  outgoing_receipts_root: string;
  tx_root: string;
  validator_proposals: string[];
  signature: string;
}

export interface ChunkResult {
  header: Chunk;
  receipts: [JSON];
  transactions: [Transaction];
}

export interface BlockResult {
  author: string;
  header: BlockHeader;
  chunks: Chunk[];
}

export interface NodeStatusResult {
  chain_id: string;
  rpc_addr: string;
  sync_info: SyncInfo;
  validators: string[];
  version: Version;
}

export interface SyncInfo {
  latest_block_hash: string;
  latest_block_height: BigInt;
  latest_block_time: string;
  latest_state_root: string;
  syncing: string;
}
export interface Version {
  version: string;
  build: string;
}

export interface NearProtocolConfig {
  runtime_config: NearProtocolRuntimeConfig;
}

export interface NearProtocolRuntimeConfig {
  storage_amount_per_byte: String;
}

export enum IdType {
  Transaction = "transaction",
  Receipt = "receipt",
}

export interface LightClientProofRequest {
  type: IdType;
  light_client_head: String;
  transaction_hash?: String;
  sender_id?: String;
  receipt_id?: String;
  receiver_id?: String;
}

export interface BlockHeaderInnerLiteView {
  height: BigInt;
  epoch_id: String;
  next_epoch_id: String;
  prev_state_root: String;
  outcome_root: String;
  timestamp: BigInt;
  next_bp_hash: String;
  block_merkle_root: String;
}

export interface LightClientBlockLiteView {
  prev_block_hash: String;
  inner_rest_hash: String;
  inner_lite: BlockHeaderInnerLiteView;
}

export interface LightClientProof {
  outcome_proof: ExecutionOutcomeWithId;
  outcome_root_proof: [ExecutionProof];
  block_header_lite: LightClientBlockLiteView;
  block_proof: [ExecutionProof];
}

export interface ExecutionProof {
  direction: String;
  hash: String;
}
/// Imported Objects START ///

/// Imported Objects END ///

/// Imported Queries START ///

/// Imported Queries END ///
