---
id: objects
title: Object Types
sidebar_position: 2
---


### AssetCandle 

_ Describes asset candle _

```graphql
type AssetCandle {
  low: String! 
  open: String! 
  high: String! 
  asset: String! 
  close: String! 
  volume: String! 
  endPeriod: String! 
  startPeriod: String! 
}
```

### CustomConnection 

_ Custom Connection _

```graphql
type CustomConnection {
  connection: Tezos_Connection! #  Connection 
}
```

### ProviderNetworks 

_ Describes provider network where contract is deployed _

```graphql
type ProviderNetworks {
  Network: String! #  Network contract is originated 
  Kind: String! #  Kind of contract (Storage or Normalizer )
  ContractAddress: String! #  Address of contract 
}
```

### Providers 

_ Supported providers  _

```graphql
type Providers {
  Provider: String! #  Provider of token data eg. Coinbase, Binance 
  ProviderNetworks: ProviderNetworks[]! #  ProviderNetworks 
}
```

