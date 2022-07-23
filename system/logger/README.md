# Logger
It is a helper library that allows logging to different streams using different loggers simultaneously. This removes the burden of choosing appropriate logging service from wrap developer to the app developer that wants to integrates the wrapper.

## Usage

- **If you are a Wrap Developer** - then you just need to import the cache interface and can get all the implementations that client has registered in the wrapper using `Interface.getImplementations` function and use one or all of them to store and retrive the data from the cache. Alternatively you can also specify the uri of the particular implementation that you want to support.

  - Schema
    ```graphql
    #import * into Logger from "wrap://ens/logger.polywrap.eth"

    type Module{
      foo(message: String!): Boolean!
    }
    ```
  
  - Wasm-as
    ```ts
    import { 
      Logger_Module,
      Args_foo
    } from "./wrap";

    export function foo(args: Args_foo) {
      Logger.info(args.message);
    }
    ```
  


- **If you are an App Developer** - then you need to register the implementations of the logger interface using client config.

```ts
const config = {
  ...,
  plugins: [
    ...
    {
      uri: "wrap://ens/core.logger.polywrap.eth"
      plugin: LoggerPlugin()
    }
  ]
  interfaces: [
    {
      interface: "wrap://ens/core.logger.polywrap.eth",
      implementations: [
        "wrap://ens/js-logger.polywrap.eth",
        ...
      ]
    }
  ]
}
```