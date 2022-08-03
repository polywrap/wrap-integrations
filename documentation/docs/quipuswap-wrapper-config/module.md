---
id: module
title: Module
sidebar_position: 1
---

### addOperator 

_ Add an operator _

```graphql
addOperator(
  network: Network! #  Network to query 
  params: OperatorParams! #  OperatorParams 
  contractAddress: String #  Contract Address 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection # " CustomConnection 
): Tezos_TransferParams!
```

### divest 

_ divest in liquidity pool _

```graphql
divest(
  network: Network! #  Network to query 
  params: DivestParams! #  DivestParams 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): Tezos_TransferParams!
```

### getLPTokenBalance 

_ Get token balance _

```graphql
getLPTokenBalance(
  network: Network! #  Network 
  custom: CustomConnection #  CustomConnection 
  owner: String! #  Owner 
  pairId: String! #  Id of token pair 
): String!
```

### getTokenPair 

_ Get token pair _

```graphql
getTokenPair(
  network: Network! #  Network 
  pairId: String! #  Id of token pair 
  custom: CustomConnection #  CustomConnection 
): JSON!
```

### getTokenSupply 

_ Get token supply _

```graphql
getTokenSupply(
  network: Network! #  Network 
  custom: CustomConnection #  CustomConnection 
  pairId: String! #  Id of token pair 
): GetTokenSupplyResponse!
```

### invest 

_ invest in liquidity pool _

```graphql
invest(
  network: Network! #  Network to query 
  params: InvestParams! #  InvestParams 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): Tezos_TransferParams[]!
```

### listTokenPairs 

_ Token pair list _

```graphql
listTokenPairs(
  network: Network! #  Network 
  custom: CustomConnection #  CustomConnection 
): JSON!
```

### removeOperator 

_ Remove an operator _

```graphql
removeOperator(
  network: Network! #  Network to query 
  params: OperatorParams! #  OperatorParams 
  contractAddress: String #  Contract Address 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): Tezos_TransferParams!
```

### swapDirect 

_ swap two tokens directly _

```graphql
swapDirect(
  network: Network! #  Network to query 
  params: SwapDirectParams! #  SwapDirectParams 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection 
): Tezos_TransferParams[]!
```

### swapMultiHop 

_ swap multiple tokens _

```graphql
swapMultiHop(
  network: Network! #  Network to query 
  params: SwapMultiHopParams! #  SwapMultiHopParams 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): Tezos_TransferParams[]!
```

### transfer 

_ transfer own tokens _

```graphql
transfer(
  network: Network! #  Network to query 
  params: TransferParams! #  TransferParams 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): Tezos_TransferParams!
```

### transferFrom 

_ transfer caller-defined sender _

```graphql
transferFrom(
  network: Network! #  Network to query 
  from: String! #  from 
  params: TransferParams! #  TransferParams 
  sendParams: Tezos_SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): Tezos_TransferParams!
```

