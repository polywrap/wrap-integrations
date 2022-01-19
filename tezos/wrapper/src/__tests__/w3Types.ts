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

export interface Block {
  chainId: String;
  hash: String;
  protocol: String;
}

export interface TransferConfirmation {
  completed: Boolean;
  currentConfirmation: UInt32;
  expectedConfirmation: UInt32;
  block: Block;
}

export interface OperationError {
  kind: String;
  id: String;
}

export interface EstimateResult {
  error: Boolean;
  reason?: String | null;
  estimate?: Estimate | null;
}

export interface RevealParams {
  fee?: UInt32 | null;
  gasLimit?: UInt32 | null;
  storageLimit?: UInt32 | null;
}

export interface TransferParams {
  to: String;
  amount: UInt32;
  source?: String | null;
  fee?: UInt32 | null;
  gasLimit?: UInt32 | null;
  storageLimit?: UInt32 | null;
  mutez?: Boolean | null;
}

export interface OriginateParams {
  code: String;
  storage: String;
  balance?: String | null;
  delegate?: String | null;
  fee?: UInt32 | null;
  gasLimit?: UInt32 | null;
  storageLimit?: UInt32 | null;
  mutez?: Boolean | null;
  init?: String | null;
}

export interface Estimate {
  burnFeeMutez: UInt32;
  gasLimit: UInt32;
  minimalFeeMutez: UInt32;
  opSize: String;
  storageLimit: UInt32;
  suggestedFeeMutez: UInt32;
  totalCost: UInt32;
  usingBaseFeeMutez: UInt32;
  consumedMilligas: UInt32;
}

export interface OriginationOperation {
  contractAddress?: String | null;
  hash: String;
  consumedGas?: String | null;
  errors?: Array<OperationError> | null;
  fee: UInt32;
  gasLimit: UInt32;
  includedInBlock: UInt32;
  revealStatus?: String | null;
  status?: String | null;
  storageDiff?: String | null;
  storageLimit: UInt32;
  storageSize?: String | null;
}

export interface OriginationResponse {
  error: Boolean;
  reason?: String | null;
  origination?: OriginationOperation | null;
}

export interface TxOperation {
  hash: String;
  source?: String | null;
  amount?: BigInt | null;
  consumedGas?: BigInt | null;
  destination: String;
  errors?: Array<OperationError> | null;
  fee: UInt32;
  gasLimit: UInt32;
  includedInBlock: UInt32;
  status: String;
  storageDiff?: String | null;
  storageLimit: UInt32;
  storageSize?: BigInt | null;
}

export interface TxOperationEntry {
  branch: String;
  chainId: String;
  hash: String;
  protocol: String;
  signature?: String | null;
  contents: Array<OperationContentEntry>;
}

export interface OperationContent {
  kind: String;
  branch: String;
  chainId: String;
  hash: String;
  protocol: String;
  signature?: String | null;
}

export interface OperationContentEntry {
  kind: String;
}

export interface Connection {
  node?: String | null;
  networkNameOrChainId?: String | null;
}

export interface SignResult {
  bytes: String;
  sig: String;
  prefixSig: String;
  sbytes: String;
}

export interface OriginationConfirmationResponse {
  confirmation: UInt32;
  origination: OriginationOperation;
}

export interface CallContractMethodConfirmationResponse {
  confirmation: UInt32;
  operation: TxOperation;
}

/// Imported Objects START ///

/// Imported Objects END ///

/// Imported Queries START ///

/// Imported Queries END ///
