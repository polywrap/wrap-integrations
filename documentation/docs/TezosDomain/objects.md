---
id: objects
title: Object Types
sidebar_position: 2
---


### AcquisitionInfo 

_ Domain acquisition information _

```graphql
type AcquisitionInfo {
  cost: UInt32 #  Cost to acquire domain 
  duration: UInt32 #  Duration of domain acquisition 
  state: AcquisitionState! #  AcquisitionState 
}
```

