---
id: objects
title: Object Types
sidebar_position: 2
---


### CustomConnection 

_ Describes custom connection _

```graphql
type CustomConnection {
  connection: Tezos_Connection! #  Connection 
  contractAddress: String! #  Contract address 
}
```

### SwapData 

_ SwapData _

```graphql
type SwapData {
  creator: String! #  Address of creator 
  issuer: String! #  Address of issuer 
  objktAmount: String! #  Amount of objkt 
  objktId: String! #  Id of objkt 
  royalties: String! #  Royalties to be paid to issuer 
}
```

### TokenBalance 

_ Describes balance of owner _

```graphql
type TokenBalance {
  owner: String! #  Address of owner 
  tokenId: String! #  Token id 
  balance: String! #  Balance 
}
```

### TokenMetadata 

_ Describes token metadata _

```graphql
type TokenMetadata {
  tokenId: String! #  Id of token 
  ipfsHash: String! #  Ipfs hash for uploaded metadata file 
}
```

