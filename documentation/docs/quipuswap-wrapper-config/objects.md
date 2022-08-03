---
id: objects
title: Object Types
sidebar_position: 2
---


### CustomConnection 

_ CustomConnection _

```graphql
type CustomConnection {
  connection: Tezos_Connection! #  Tezos connection 
  contractAddress: String! #  Contract address 
}
```

### DivestParams 

_ Describes parameters to divest _

```graphql
type DivestParams {
  pairId: UInt32! #  Id of pair 
  minTokenAOut: BigInt! #  Minimum amount of token A out 
  minTokenBOut: BigInt! #  Minimum amount of token B out 
  shares: BigInt! #  Shares to divest 
  deadline: String! #  Deadline for divest transaction 
}
```

### GetTokenSupplyResponse 

_ Describe token supply in pool _

```graphql
type GetTokenSupplyResponse {
  token_a_pool: String! #  Tokens A available 
  token_b_pool: String! #  Tokens B available 
  total_supply: String! #  Total supply 
}
```

### InvestParams 

_ Describes parameters to invest _

```graphql
type InvestParams {
  pairId: UInt32! #  Id of pair 
  shares: BigInt! #  Shares to invest 
  tokenAIn: BigInt! #  Amount of token A in 
  tokenBIn: BigInt! #  Amount of token B in 
  deadline: String! #  Deadline for invest transaction 
}
```

### OperatorParams 

_ Describes operator parameters _

```graphql
type OperatorParams {
  tokenId: UInt32! #  Id of token 
  operator: String! #  Address of operator 
}
```

### SwapDirectParams 

_ Describes parameters when swapping between two tokens _

```graphql
type SwapDirectParams {
  pairId: UInt32! #  Id of pair 
  direction: SwapDirection! #  SwapDirection 
  swapParams: SwapParams! #  SwapParams 
}
```

### SwapMultiHopParams 

_ Describes parameters when swapping multiple tokens _

```graphql
type SwapMultiHopParams {
  hops: SwapPair[]! #  Multiple tokens to swap in sequential order 
  swapParams: SwapParams! #  SwapParams 
}
```

### SwapPair 

_ Describes swap pair _

```graphql
type SwapPair {
  pairId: UInt32! #  Id of pair 
  direction: SwapDirection! #  SwapDirection 
}
```

### SwapParams 

_ Describes swap parameters _

```graphql
type SwapParams {
  amountIn: BigInt! #  Amount in 
  minAmountOut: BigInt! #  Minimum amount out 
  receiver: String! #  Address of receiver 
  deadline: String! #  Deadline for swap transaction 
}
```

### TransferParams 

_ Describes parameters to transfer _

```graphql
type TransferParams {
  to: String! #  Address to make transfer 
  tokenId: UInt32! #  Id of token 
  amount: BigInt! #  Amount to send 
}
```

