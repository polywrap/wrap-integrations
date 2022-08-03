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
  publicKey: PublicKey! 
  accessKey: AccessKey! 
}
```

### AccessKeyPermission 

```graphql
type AccessKeyPermission {
  _: String 
  receiverId: String 
  methodNames: String[] 
  allowance: BigInt 
}
```

### Action 

```graphql
type Action {
  code: Bytes 
  methodName: String 
  args: Bytes 
  gas: BigInt 
  deposit: BigInt 
  stake: BigInt 
  publicKey: PublicKey 
  accessKey: AccessKey 
  beneficiaryId: String 
}
```

### ActionContainer 

```graphql
type ActionContainer {
  actions: Action[]! 
}
```

### AddKey 

```graphql
type AddKey {
  publicKey: PublicKey! 
  accessKey: AccessKey! 
}
```

### CreateAccount 

```graphql
type CreateAccount {
}
```

### DeleteAccount 

```graphql
type DeleteAccount {
  code: Bytes 
  methodName: String 
  args: Bytes 
  gas: BigInt 
  deposit: BigInt 
  stake: BigInt 
  publicKey: PublicKey 
  accessKey: AccessKey 
  beneficiaryId: String 
}
```

### DeleteKey 

```graphql
type DeleteKey {
  code: Bytes 
  methodName: String 
  args: Bytes 
  gas: BigInt 
  deposit: BigInt 
  stake: BigInt 
  publicKey: PublicKey 
  accessKey: AccessKey 
  beneficiaryId: String 
}
```

### DeployContract 

```graphql
type DeployContract {
  code: Bytes! 
}
```

### ExecutionOutcome 

```graphql
type ExecutionOutcome {
  executor_id: String 
  gas_burnt: BigInt! 
  logs: String[] 
  metadata: OutcomeMetaData 
  receipt_ids: String[]! 
  status: ExecutionStatus! 
  tokens_burnt: String 
}
```

### ExecutionOutcomeWithId 

```graphql
type ExecutionOutcomeWithId {
  block_hash: String 
  id: String! 
  outcome: ExecutionOutcome! 
  proof: ExecutionProof[] 
}
```

### ExecutionProof 

```graphql
type ExecutionProof {
  direction: String! 
  hash: String! 
}
```

### ExecutionStatus 

```graphql
type ExecutionStatus {
  SuccessValue: String 
  SuccessReceiptId: String 
  failure: JSON 
}
```

### FinalExecutionOutcome 

```graphql
type FinalExecutionOutcome {
  status: ExecutionStatus! 
  transaction: Transaction! 
  transaction_outcome: ExecutionOutcomeWithId! 
  receipts_outcome: ExecutionOutcomeWithId[]! 
}
```

### FinalExecutionOutcomeWithReceipts 

```graphql
type FinalExecutionOutcomeWithReceipts {
  status: ExecutionStatus! 
  transaction: Transaction! 
  transaction_outcome: ExecutionOutcomeWithId! 
  receipts_outcome: ExecutionOutcomeWithId[]! 
  receipts: ReceiptWithId[]! 
}
```

### FullAccessPermission 

```graphql
type FullAccessPermission {
  _: String! 
}
```

### FunctionCall 

```graphql
type FunctionCall {
  code: Bytes 
  methodName: String 
  args: Bytes 
  gas: BigInt 
  deposit: BigInt 
  stake: BigInt 
  publicKey: PublicKey 
  accessKey: AccessKey 
  beneficiaryId: String 
}
```

### FunctionCallPermission 

```graphql
type FunctionCallPermission {
  receiverId: String! 
  methodNames: String[]! 
  allowance: BigInt 
}
```

### GasProfile 

```graphql
type GasProfile {
  cost: String! 
  cost_category: String! 
  gas_used: String! 
}
```

### OutcomeMetaData 

```graphql
type OutcomeMetaData {
  gas_profile: GasProfile[]! 
  version: UInt! 
}
```

### PublicKey 

```graphql
type PublicKey {
  keyType: KeyType! 
  data: Bytes! 
}
```

### Receipt 

```graphql
type Receipt {
  Action: ActionContainer! 
}
```

### ReceiptWithId 

```graphql
type ReceiptWithId {
  predecessor_id: String! 
  receipt: Receipt! 
  receipt_id: String! 
  receiver_id: String! 
}
```

### Signature 

```graphql
type Signature {
  keyType: KeyType! 
  data: Bytes! 
}
```

### SignedTransaction 

```graphql
type SignedTransaction {
  transaction: Transaction! 
  signature: Signature! 
}
```

### SignTransactionResult 

```graphql
type SignTransactionResult {
  hash: Bytes! 
  signedTx: SignedTransaction! 
}
```

### Stake 

```graphql
type Stake {
  code: Bytes 
  methodName: String 
  args: Bytes 
  gas: BigInt 
  deposit: BigInt 
  stake: BigInt 
  publicKey: PublicKey 
  accessKey: AccessKey 
  beneficiaryId: String 
}
```

### Transaction 

```graphql
type Transaction {
  signerId: String! 
  publicKey: PublicKey! 
  nonce: BigInt! 
  receiverId: String! 
  actions: Action[]! 
  blockHash: Bytes 
  hash: String 
}
```

### Transfer 

```graphql
type Transfer {
  deposit: BigInt! 
}
```

