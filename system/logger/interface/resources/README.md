# Logger Wrapper Interface
A simple logger interface, to be implemented by a wrapper.

| Version | URI |
|-|-|
| 1.0.0 | [`wrap://ens/wrappers.polywrap.eth:logger@1.0.0`](https://app.ens.domains/name/wrappers.polywrap.eth/details) |

## Interface
```graphql
enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

type Module {
  log(
    level: LogLevel!
    message: String!
  ): Boolean!
}
```

## Usage
```graphql
#import { Module } into ILogger from "ens/wrappers.polywrap.eth:logger@1.0.0"

type Module implements ILogger_Module { }
```

And implement the `log` method within your programming language of choice.

## Known Implementations
* [`@polywrap/logger-plugin-js`](https://www.npmjs.com/package/@polywrap/logger-plugin-js) - JavaScript Plugin
* console-wrapper @ [`ens/wrappers.polywrap.eth:console@1.0.0`](https://app.ens.domains/name/wrappers.polywrap.eth/details) - Wasm Wrapper
