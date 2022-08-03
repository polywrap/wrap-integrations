---
id: enums
title: Enum Types
sidebar_position: 3
---


### AcquisitionState

_ State of domain acquisition _

```graphql
enum AcquisitionState {
  Unobtainable
  Taken
  CanBeBought
  CanBeAuctioned
  AuctionInProgress
  CanBeSettled
}
```

### Network

_ Suppported Network _

```graphql
enum Network {
  mainnet
  ghostnet
}
```

