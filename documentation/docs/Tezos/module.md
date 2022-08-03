---
id: module
title: Module
sidebar_position: 1
---

### batchContractCalls 

_ Make a batch contract call _

```graphql
batchContractCalls(
  params: TransferParams[]! #  Transfer Params 
  connection: Connection #  Connection 
): String!
```

### batchWalletContractCalls 

_ Make a batch wallet call _

```graphql
batchWalletContractCalls(
  params: TransferParams[]! #  Transfer Params 
  connection: Connection #  Connection 
): String!
```

### callContractMethod 

_ Call contract method _

```graphql
callContractMethod(
  address: String! #  Address of contract 
  method: String! #  Method to call 
  args: String #  Arguments 
  params: SendParams #  SendParams 
  connection: Connection #  Connection 
): TxOperation!
```

### callContractMethodAndConfirmation 

_ Call contract and wait for confirmation _

```graphql
callContractMethodAndConfirmation(
  address: String! #  Address of a contract 
  method: String! #  Method to contract 
  args: String #  Arguments 
  connection: Connection #  Connection 
  params: SendParams #  SendParams 
  confirmations: UInt32! #  Confirmations to wait for 
  timeout: UInt32 #  Timeout to wait for confirmation 
): CallContractMethodConfirmationResponse!
```

### callContractView 

_ Call contract view _

```graphql
callContractView(
  address: String! #  Contract address 
  view: String! #  Handler 
  args: String #  Arguments 
  connection: Connection #  Connection 
): String!
```

### checkAddress 

_ Check validity of address _

```graphql
checkAddress(
  connection: Connection #  Connection 
  address: String! #  Tezos address 
): Boolean!
```

### connectTempleWallet 

_ Connect temple wallet _

```graphql
connectTempleWallet(
  appName: String! #  App name 
  network: String! #  Network to connection 
  connection: Connection #  Connection 
): AccountDetails!
```

### encodeMichelsonExpressionToBytes 

_ Encode michelson express to bytes _

```graphql
encodeMichelsonExpressionToBytes(
  expression: String! #  Michelson expression 
  value: String! #  Value expression 
): String!
```

### executeTzip16View 

_ Execute Tzip16View _

```graphql
executeTzip16View(
  address: String! #  Address of tezos account 
  viewName: String! #  View handler 
  args: String! #  Arguments 
  connection: Connection #  Connection 
): String!
```

### getBalance 

_ Balance of tezos account _

```graphql
getBalance(
  connection: Connection #  Connection 
  address: String! #  Tezos address 
): String!
```

### getContractCallTransferParams 

_ Get Transfer Params _

```graphql
getContractCallTransferParams(
  address: String! #  Address of contract 
  method: String! #  Method to call 
  args: String #  Arguments 
  params: SendParams #  Send parameters 
  connection: Connection #  Connection 
): TransferParams!
```

### getContractStorage 

_ Read storage of contract _

```graphql
getContractStorage(
  address: String! #  Tezos address 
  key: String! #  Storage key 
  field: String #  Nested key of key value. Can be empty 
  connection: Connection #  Connection 
): String!
```

### getOperationStatus 

_ Get operation status _

```graphql
getOperationStatus(
  hash: String! #  Hash of operation 
  network: GetOperationStatusSupportedNetworks! #  Supported network for getting operation status that wrapper supports 
): OperationStatus!
```

### getOriginateEstimate 

_ Originate transaction estimate _

```graphql
getOriginateEstimate(
  connection: Connection #  Connection 
  params: OriginateParams! 
): EstimateResult!
```

### getPublicKey 

_ Public key _

```graphql
getPublicKey(
  connection: Connection 
): String!
```

### getPublicKeyHash 

_ Public key hash _

```graphql
getPublicKeyHash(
  connection: Connection 
): String!
```

### getRevealEstimate 

_ Reveal transaction estimate _

```graphql
getRevealEstimate(
  connection: Connection 
  params: RevealParams! 
): EstimateResult!
```

### getTransferEstimate 

_ Transfer transaction estimate _

```graphql
getTransferEstimate(
  connection: Connection 
  params: SendParams! 
): EstimateResult!
```

### getWalletPKH 

_ Get wallet account public key hash _

```graphql
getWalletPKH(
  connection: Connection #  Connection 
): String!
```

### originate 

_ Originate a contract _

```graphql
originate(
  connection: Connection #  Connection 
  params: OriginateParams! #  OriginateParams 
): OriginationResponse!
```

### originateAndConfirm 

_" Originate and wait for confirmation _

```graphql
originateAndConfirm(
  connection: Connection #  Connection 
  params: OriginateParams! #  OriginateParams 
  confirmations: UInt32! #  Confirmations to wait for 
  timeout: UInt32 #  Timeout to wait for confirmation 
): OriginationConfirmationResponse!
```

### signMessage 

_ Sign message _

```graphql
signMessage(
  connection: Connection #  Connection 
  message: String! #  Message to sign 
): SignResult!
```

### transfer 

_ Transfer tez _

```graphql
transfer(
  connection: Connection #  Connection 
  params: SendParams! #  Sendparams 
): String!
```

### transferAndConfirm 

_ Transfer tez and wait for confirmation _

```graphql
transferAndConfirm(
  connection: Connection #  Connection 
  params: SendParams! #  SendParams 
  confirmations: UInt32! #  Confirmations to wait for 
): TransferConfirmation!
```

### walletContractCallMethod 

_ Wallet contract call method _

```graphql
walletContractCallMethod(
  address: String! #  Address of contract 
  method: String! #  Method to call 
  args: String #  Arguments 
  params: SendParams #  SendParams 
  connection: Connection #  Connection 
): String!
```

### walletOriginate 

_ Wallet originate _

```graphql
walletOriginate(
  params: OriginateParams! #  Originate params 
  connection: Connection #  Connection 
): String!
```

