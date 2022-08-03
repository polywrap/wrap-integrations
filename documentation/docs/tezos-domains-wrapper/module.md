---
id: module
title: Module
sidebar_position: 1
---

### buy 

_ Buy domain name _

```graphql
buy(
  network: Network! #  Supported network 
  params: BuyParams! #  BuyParams 
  sendParams: SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): String!
```

### commit 

_ Commit domain name _

```graphql
commit(
  network: Network! #  Supported network 
  params: CommitParams! #  CommitParams 
  sendParams: SendParams #  SendParams 
  custom: CustomConnection #  CustomConnection 
): String!
```

### resolveAddress 

_ Resolve address domain name _

```graphql
resolveAddress(
  network: Network! #  Supported Network 
  address: String! #  Tezos address 
  custom: CustomConnection #  CustomConnection 
): DomainInfo
```

### resolveDomain 

_ Resolve domain name to address _

```graphql
resolveDomain(
  network: Network! #  Supported Network 
  domain: String! #  Domain name 
  custom: CustomConnection #  Custom Connection 
): DomainInfo
```

