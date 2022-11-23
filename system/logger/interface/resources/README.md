# Logger Wrapper Interface
A simple logger interface, to be implemented by a wrapper.

| Version | URI | WRAP Standard |
|-|-|-|
| 1.0.0 | [`wrap://ens/wrappers.polywrap.eth:logger@1.0.0`](https://wrappers.io/v/ens/wrappers.polywrap.eth:logger@1.0.0) | 0.1 |

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

## Known Aggregators
* `logging-wrapper` @ [`ens/wrappers.polywrap.eth:logging@1.0.0`](https://wrappers.io/v/ens/wrappers.polywrap.eth:logging@1.0.0) - Wasm Wrapper
