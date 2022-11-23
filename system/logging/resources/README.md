# Logging Wrapper
The logging wrapper is a simple dispatcher of messages, with pre-defined level of importance (debug, info, warn, error). Messages are forwarded to all implementations of the [`ens/wrappers.polywrap.eth:logger@1.0.0`](https://wrappers.io/v/ens/wrappers.polywrap.eth:logger@1.0.0) interface. If no implementations are found, messages will simply not be forwarded.

| Version | URI | WRAP Standard |
|-|-|-|
| 1.0.0 | [`wrap://ens/wrappers.polywrap.eth:logging@1.0.0`](https://wrappers.io/v/ens/wrappers.polywrap.eth:logging@1.0.0) | 0.1 |

## Interface
```graphql
type Module {
  debug(
    message: String!
  ): Boolean!

  info(
    message: String!
  ): Boolean!

  warn(
    message: String!
  ): Boolean!

  error(
    message: String!
  ): Boolean!

  # Get all logger implementation URIs
  loggers: [String!]!
}
```

## Usage
Import the logging module into your wrapper's schema:
```graphql
#import * into Logging from "ens/wrappers.polywrap.eth:logging@1.0.0

type Module {
  yourMethodHere(
    arg: String!
  ): UInt32!
}
```

And call it within your wrapper's source code, for example this is how you'd do so in a `wasm/assemblyscript` project:
```typescript
import { Logging_Module } from "./wrap";

Logging_Module.warn({
  message: "warning message"
});
```
