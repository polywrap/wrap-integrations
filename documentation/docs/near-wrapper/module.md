---
id: module
title: Module
sidebar_position: 1
---

### accessKeyChanges 

```graphql
accessKeyChanges(
  accountIdArray: String[]! 
  blockQuery: BlockReference! 
): ChangeResult!
```

### accountChanges 

```graphql
accountChanges(
  accountIdArray: String[]! 
  blockQuery: BlockReference! 
): ChangeResult!
```

### addKey 

```graphql
addKey(
  publicKey: Near_PublicKey! 
  contractId: String 
  methodNames: String[] 
  amount: BigInt 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### blockChanges 

```graphql
blockChanges(
  blockQuery: BlockReference! 
): BlockChangeResult!
```

### chunk 

```graphql
chunk(
  chunkId: String! 
): ChunkResult!
```

### contractCodeChanges 

```graphql
contractCodeChanges(
  accountIdArray: String[]! 
  blockQuery: BlockReference! 
): ChangeResult!
```

### contractStateChanges 

```graphql
contractStateChanges(
  accountIdArray: String[]! 
  blockQuery: BlockReference! 
  keyPrefix: String 
): ChangeResult!
```

### createAccount 

```graphql
createAccount(
  newAccountId: String! 
  publicKey: Near_PublicKey! 
  amount: BigInt! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### createAndDeployContract 

```graphql
createAndDeployContract(
  contractId: String! 
  publicKey: Near_PublicKey! 
  data: Bytes! 
  amount: BigInt! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### createTransaction 

_Transaction Query Functions (Implemented, Tested)_

```graphql
createTransaction(
  receiverId: String! 
  actions: Near_Action[]! 
  signerId: String 
): Near_Transaction!
```

### deleteAccount 

```graphql
deleteAccount(
  accountId: String! 
  beneficiaryId: String! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### deleteKey 

```graphql
deleteKey(
  publicKey: Near_PublicKey! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### deployContract 

```graphql
deployContract(
  data: Bytes! 
  contractId: String! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### experimental_protocolConfig 

```graphql
experimental_protocolConfig(
  blockReference: BlockReference! 
): NearProtocolConfig!
```

### findAccessKey 

```graphql
findAccessKey(
  accountId: String! 
): AccessKeyInfo
```

### formatNearAmount 

```graphql
formatNearAmount(
  amount: String! 
): String!
```

### functionCall 

```graphql
functionCall(
  contractId: String! 
  methodName: String! 
  args: JSON! 
  gas: BigInt! 
  deposit: BigInt! 
  walletMeta: String 
  walletCallbackUrl: String 
  signerId: String 
): Near_FinalExecutionOutcome!
```

### gasPrice 

```graphql
gasPrice(
  blockId: String 
): BigInt!
```

### getAccessKeys 

```graphql
getAccessKeys(
  accountId: String! 
): AccessKeyInfo[]!
```

### getAccountBalance 

_RPC Query Functions not part of JsonRpcProvider (Implemented, Tested)_

```graphql
getAccountBalance(
  accountId: String! 
): AccountBalance!
```

### getAccountDetails 

```graphql
getAccountDetails(
  accountId: String! 
): AccountAuthorizedApp[]!
```

### getAccountId 

```graphql
getAccountId(
): String
```

### getAccountState 

_RPC Query Functions not part of JsonRpcProvider (Implemented, Tested)_

```graphql
getAccountState(
  accountId: String! 
): AccountView!
```

### getBlock 

_JsonRpcProvider Query Functions (Implemented, Tested)_

```graphql
getBlock(
  blockQuery: BlockReference! 
): BlockResult!
```

### getPublicKey 

```graphql
getPublicKey(
  accountId: String! 
): Near_PublicKey
```

### isSignedIn 

```graphql
isSignedIn(
): Boolean!
```

### lightClientProof 

```graphql
lightClientProof(
  request: LightClientProofRequest! 
): LightClientProof!
```

### parseNearAmount 

_Utility Functions_

```graphql
parseNearAmount(
  amount: String! 
): String!
```

### requestSignIn 

```graphql
requestSignIn(
  contractId: String 
  methodNames: String[] 
  successUrl: String 
  failureUrl: String 
): Boolean!
```

### requestSignTransactions 

_Generic Mutation Functions_

```graphql
requestSignTransactions(
  transactions: Near_Transaction[]! 
  callbackUrl: String 
  meta: String 
): Boolean!
```

### sendJsonRpc 

_JsonRpcProvider Mutation Functions_

```graphql
sendJsonRpc(
  method: String! 
  params: JSON! 
): JSON!
```

### sendMoney 

```graphql
sendMoney(
  amount: BigInt! 
  receiverId: String! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### sendTransaction 

```graphql
sendTransaction(
  signedTx: Near_SignedTransaction! 
): Near_FinalExecutionOutcome!
```

### sendTransactionAsync 

```graphql
sendTransactionAsync(
  signedTx: Near_SignedTransaction! 
): String!
```

### signAndSendTransaction 

```graphql
signAndSendTransaction(
  receiverId: String! 
  actions: Near_Action[]! 
  signerId: String! 
): Near_FinalExecutionOutcome!
```

### signAndSendTransactionAsync 

```graphql
signAndSendTransactionAsync(
  receiverId: String! 
  actions: Near_Action[]! 
  signerId: String! 
): String!
```

### signOut 

```graphql
signOut(
): Boolean!
```

### signTransaction 

```graphql
signTransaction(
  transaction: Near_Transaction! 
): Near_SignTransactionResult!
```

### singleAccessKeyChanges 

```graphql
singleAccessKeyChanges(
  accessKeyArray: AccessKeyWithPublicKey[]! 
  blockQuery: BlockReference 
): ChangeResult
```

### status 

_JsonRpcProvider Query Functions (Implemented, Tested)_

```graphql
status(
): NodeStatusResult!
```

### txStatus 

```graphql
txStatus(
  txHash: String! 
  accountId: String! 
): Near_FinalExecutionOutcome!
```

### txStatusReceipts 

```graphql
txStatusReceipts(
  txHash: String! 
  accountId: String! 
): Near_FinalExecutionOutcomeWithReceipts!
```

### validators 

```graphql
validators(
  blockId: String 
): EpochValidatorInfo!
```

### viewContractCode 

```graphql
viewContractCode(
  accountId: String! 
): ViewContractCode!
```

### viewContractState 

```graphql
viewContractState(
  prefix: String! 
  blockQuery: BlockReference! 
  accountId: String! 
): ContractStateResult!
```

### viewFunction 

```graphql
viewFunction(
  contractId: String! 
  methodName: String! 
  args: JSON! 
): JSON!
```

