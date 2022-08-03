---
id: module
title: Module
sidebar_position: 1
---

### bytesToHex 

_ Convert bytes to hex _

```graphql
bytesToHex(
  bytes: String! 
): String!
```

### char2Bytes 

_ Convert characters to hex _

```graphql
char2Bytes(
  text: String! 
): String!
```

### getAcquisitionInfo 

_ Get Acquisition information _

```graphql
getAcquisitionInfo(
  network: Network #  Network 
  domain: String! #  Domain name to enquire 
  duration: UInt32 #  Duration to enquire 
): AcquisitionInfo
```

