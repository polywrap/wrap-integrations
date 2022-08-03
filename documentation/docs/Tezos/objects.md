---
id: objects
title: Object Types
sidebar_position: 2
---


### AccountDetails 

_ Describes a tezos account _

```graphql
type AccountDetails {
  pkh: String! #  Public key hash of account 
  balance: String! #  Balance of account 
}
```

### Block 

_ Describes a block _

```graphql
type Block {
  chainId: String! #  Chain hash
  hash: String! #  Block hash 
  protocol: String! #  Protocol hash 
}
```

### CallContractMethodConfirmationResponse 

_ Response to call contract and await confirmation _

```graphql
type CallContractMethodConfirmationResponse {
  confirmation: UInt32! #  Confirmation 
  operation: TxOperation! #  Transaction operation response 
}
```

### Connection 

_ Describes connection _

```graphql
type Connection {
  provider: String #  RPC Node url 
  networkNameOrChainId: String #  Network name 
}
```

### Estimate 

_ Describes estimate _

```graphql
type Estimate {
  burnFeeMutez: UInt32! #  Burn fee paid in mutez
  gasLimit: UInt32! #  Caller-defined gas limit 
  minimalFeeMutez: UInt32! #  Minimal fee paid in mutez 
  opSize: String! #  Operation size 
  storageLimit: UInt32! #  Caller-defined storage limit 
  suggestedFeeMutez: UInt32! #  Suggested fee paid in mutez 
  totalCost: UInt32! #  Total cost transaction 
  usingBaseFeeMutez: UInt32! #  Using base fee paid in mutez 
  consumedMilligas: UInt32! #  Gas consumed 
}
```

### EstimateResult 

_ Estimate transaction result _

```graphql
type EstimateResult {
  error: Boolean! #  Flag indicating error occurred 
  reason: String #  Reason for error 
  estimate: Estimate #  Estimate transaction 
}
```

### OperationError 

_ Describes operation error _

```graphql
type OperationError {
  kind: String! #  Operation type 
  id: String! #  Id of operation 
}
```

### OperationStatus 

_ Describes the status of a transaction _

```graphql
type OperationStatus {
  hash: String! #  hash of operation
  type: String! #  type of transaction 
  block: String! #  Block hash at which the operation was included on-chain 
  time: String! #  Block time at which the operation was included on-chain 
  height: String! #  Block height at which the operation was included on-chain 
  cycle: UInt32! #  Cycle in which the operation was included on-chain 
  counter: UInt32! #  Unique sender account ‘nonce’ value 
  status: String! #  Operation status applied, failed, backtracked, skipped. 
  is_success: Boolean! #  Flag indicating operation was successfully applied 
  is_contract: Boolean! #  Flag indicating smart-contract calls 
  gas_limit: UInt32! #  Caller-defined gas limit 
  gas_used: UInt32! #  Gas used by the operation 
  gas_price: UInt32! #  Effective price per gas unit in mutez 
  storage_limit: UInt32! #  Caller-defined storage limit 
  storage_size: UInt32! #  Actual storage size allocated 
  storage_paid: UInt32! #  Part of the storage the operation paid for 
  volume: UInt32! #  Amount of tokens transferred in tz 
  fee: UInt32! #  Fees paid in tez 
  days_destroyed: UInt32! #  Token days destroyed by this operation (tokens transferred * token idle time) 
  sender: String! #  Operation sender 
  receiver: String! #  Transaction receiver, may be empty 
  confirmations: UInt32! #  Number of blocks following the inclusion of this operation 
}
```

### OriginateParams 

_ Describes originate parameters _

```graphql
type OriginateParams {
  code: String! #  Contract code 
  storage: String! #  Initial storage 
  balance: String #  Initial balance  
  delegate: String 
  fee: UInt32 #  Called-defined fee limit to be paid
  gasLimit: UInt32 #  Caller-defined gas limit 
  storageLimit: UInt32 #  Flag indicating Amount is express in micro tez
  mutez: Boolean #  Flag indicating Amount is express in micro tez
  init: String #  Initial storage 
}
```

### OriginationConfirmationResponse 

_ Describes origination with confirmation _

```graphql
type OriginationConfirmationResponse {
  confirmation: UInt32! #  Total confirmation 
  origination: OriginationOperation! #  Origination operation 
}
```

### OriginationOperation 

_ Describes origination transaction _

```graphql
type OriginationOperation {
  contractAddress: String #  Originated contract address 
  hash: String! #  Contract hash 
  consumedGas: String #  Gas consumed 
  errors: OperationError[] #  Transaction errors 
  fee: UInt32! #  Fee paid in tez 
  gasLimit: UInt32! #  Caller-defined gas limit 
  includedInBlock: UInt32! #  Block number origination transaction was included 
  revealStatus: String #  Revealed Status of contract 
  status: String #  Status of contract 
  storageDiff: String #  Difference in storage after origination 
  storageLimit: UInt32! #  Called-Defined Storage limit 
  storageSize: String #  Storage size used 
}
```

### OriginationResponse 

_ Describes origination response _

```graphql
type OriginationResponse {
  error: Boolean! #  Flag indicating an error occurred 
  reason: String #  Reason for the error 
  origination: OriginationOperation #  Origination operation response 
}
```

### RevealParams 

_ Describes reveal parameters _

```graphql
type RevealParams {
  fee: UInt32 #  Called-defined fee limit to be paid 
  gasLimit: UInt32 #  Caller-defined gas limit 
  storageLimit: UInt32 #  Caller-defined storage limit 
}
```

### SendParams 

_ Describes send parameters _

```graphql
type SendParams {
  to: String! #  Tezos account to send 
  amount: UInt32! #  Amount to send 
  source: String #  Tezos account making transfer 
  fee: UInt32 #  Called-defined fee limit to be paid 
  gasLimit: UInt32 #  Caller-defined gas limit 
  storageLimit: UInt32 #  Caller-defined storage limit 
  mutez: Boolean #  Flag indicating Amount is express in micro tez 
}
```

### SignResult 

_ Describes a signed message _

```graphql
type SignResult {
  bytes: String! #  Input Bytes
  sig: String! #  'sig' prefixed signature 
  prefixSig: String! #  'edsig' prefixed signature 
  sbytes: String! #  raw bytes of the signature 
}
```

### TransferConfirmation 

_ Describes a transfer transaction confirmation _

```graphql
type TransferConfirmation {
  completed: Boolean! #  Flag indicating operation is completed 
  currentConfirmation: UInt32! #  Total number of current confirmations 
  expectedConfirmation: UInt32! #  Total expected confirmation 
  block: Block! #  Block for confirmation
}
```

### TransferParams 

_ Describes transfer params of a transaction operation _

```graphql
type TransferParams {
  to: String! #  Tezos account to send 
  amount: UInt32! #  Amount to send 
  fee: UInt32 #  Called-defined fee limit to be paid
  source: String 
  mutez: Boolean #  Flag indicating Amount is express in micro tez
  parameter: String # Michelson expression expressed in a string
TODO(): switch to JSON when nested object and maps are supported
  gasLimit: UInt32 #  Caller-defined gas limit 
  storageLimit: UInt32 #  Flag indicating Amount is express in micro tez
}
```

### TxOperation 

_ Describes Transaction operation _

```graphql
type TxOperation {
  hash: String! #  Transaction hash 
  source: String #  Source of transaction 
  amount: BigInt #  Balance of transaction 
  consumedGas: BigInt #  Gas consumed 
  destination: String! #  Transaction destination 
  errors: OperationError[] #  Error transaction 
  fee: UInt32! #  Fee paid in tez 
  gasLimit: UInt32! #  Called-Defined gas limit 
  includedInBlock: String! #  Block number transaction is included 
  status: String! #  Status of transaction  
  storageDiff: String #  Difference of storage 
  storageLimit: UInt32! #  Called-Defined storage limit  
  storageSize: BigInt #  Storage size 
}
```

