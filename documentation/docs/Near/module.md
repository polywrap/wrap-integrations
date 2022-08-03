---
id: module
title: Module
sidebar_position: 1
---

### createKey 

```graphql
createKey(
  accountId: String! 
  networkId: String! 
): PublicKey!
```

### createTransactionWithWallet 

_Creates a transaction.
If signerId is provided, the transaction will be signed using data from the KeyStore in the plugin config.
Otherwise, wallet authorization is expected._

```graphql
createTransactionWithWallet(
  receiverId: String! 
  actions: Action[]! 
): Transaction!
```

### getAccountId 

```graphql
getAccountId(
): String
```

### getPublicKey 

```graphql
getPublicKey(
  accountId: String! 
): PublicKey
```

### isSignedIn 

```graphql
isSignedIn(
): Boolean!
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

```graphql
requestSignTransactions(
  transactions: Transaction[]! 
  callbackUrl: String 
  meta: String 
): Boolean!
```

### sendJsonRpc 

```graphql
sendJsonRpc(
  method: String! 
  params: JSON! 
): JSON!
```

### sendTransaction 

```graphql
sendTransaction(
  signedTx: SignedTransaction! 
): FinalExecutionOutcome!
```

### sendTransactionAsync 

```graphql
sendTransactionAsync(
  signedTx: SignedTransaction! 
): String!
```

### signMessage 

```graphql
signMessage(
  message: Bytes! 
  signerId: String! 
): Signature!
```

### signOut 

```graphql
signOut(
): Boolean!
```

### signTransaction 

```graphql
signTransaction(
  transaction: Transaction! 
): SignTransactionResult!
```

