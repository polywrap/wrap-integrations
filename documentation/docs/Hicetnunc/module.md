---
id: module
title: Module
sidebar_position: 1
---

### getBalanceOf 

_ Read the number of NFTs of a specific token id owned by an address _

```graphql
getBalanceOf(
  network: Network! #  Network to query 
  owner: String! #  Address of owner 
  tokenId: String! #  Token id  
  custom: CustomConnection #  CustomConnection 
): TokenBalance!
```

### getSwapData 

_ Read active sell offers _

```graphql
getSwapData(
  network: Network! #  Network to query 
  swapId: String! #  Swap id 
  custom: CustomConnection #  CustomConnection 
): SwapData!
```

### getTokenCountData 

_ Read number of NFTs minted _

```graphql
getTokenCountData(
  network: Network! #  Network to query 
  custom: CustomConnection #  CustomConnection 
): String!
```

### getTokenMetadata 

_ Read the IPFS metadata hash for one or multiple NFT _

```graphql
getTokenMetadata(
  network: Network! #  Network to query 
  tokenId: String! #  Token id 
  custom: CustomConnection #  CustomConnection 
): TokenMetadata!
```

