---
id: module
title: Module
sidebar_position: 1
---

### getAssetData 

_ Get asset data _

```graphql
getAssetData(
  network: Network! #  Network 
  assetCode: String! #  Asset code for token 
  providerAddress: String! #  Deployed provider address 
  custom: CustomConnection #  CustomConnection 
): AssetCandle!
```

### getCandle 

_ Get market data of asset _

```graphql
getCandle(
  network: Network! #  Network 
  custom: CustomConnection #  CustomConnection 
  assetCode: String! #  Asset's code 
  providerAddress: String! #  Deployed provider address 
): AssetCandle!
```

### getNormalizedPrice 

_ Get normalized price of asset _

```graphql
getNormalizedPrice(
  network: Network! 
  custom: CustomConnection 
  assetCode: String! 
  providerAddress: String! 
): String!
```

### listAssets 

_ List Assets available with provider _

```graphql
listAssets(
  network: Network! #  Network 
  custom: CustomConnection #  CustomConnection 
  providerAddress: String! #  Deployed provider address 
): String!
```

### listProviders 

_ List providers _

```graphql
listProviders(
): Providers[]!
```

