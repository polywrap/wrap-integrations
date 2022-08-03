---
id: objects
title: Object Types
sidebar_position: 2
---


### BuyParams 

_ Describes buy parameters _

```graphql
type BuyParams {
  label: String! 
  owner: String! 
  address: String! 
  nonce: UInt32! 
  duration: UInt32! 
  data: String! 
}
```

### CommitParams 

_ Describes commit parameters _

```graphql
type CommitParams {
  label: String! 
  owner: String! 
  nonce: UInt32! 
}
```

### CustomConnection 

_ Describes custom connection _

```graphql
type CustomConnection {
  connection: Tezos_Connection! #  Connection 
  contractAddress: String! #  Contract Address 
}
```

### DomainInfo 

_ Describes domain information _

```graphql
type DomainInfo {
  Name: String! #  Name of domain 
  Address: String! #  Tezos address 
  Data: String! #  Metadata of domain 
  Expiry: String! #  Expiry of domain 
}
```

### SendParams 

_ SendParams _

```graphql
type SendParams {
  amount: UInt32 #  Amount to send 
  source: String #  Tezos account making transfer 
  fee: UInt32 #  Called-defined fee limit to be paid 
  gasLimit: UInt32 #  Caller-defined gas limit 
  storageLimit: UInt32 #  Caller-defined storage limit 
  mutez: Boolean #  Flag indicating Amount is express in micro tez 
}
```

