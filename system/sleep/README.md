# Sleep
Sleep is a helper library that allows users to execute a sleep (i.e. pause thread for specified milliseconds).

## Usage

- **If you are a Wrapper Developer** - You just need to import the Sleep interface, and you can get all the implementations that the client has registered in the wrapper using the `Interface.getImplementations` function. You can use one or all of them to execute a sleep. Alternatively, you can specify the URI of the particular implementation that you want to support.

  - Schema
    ```graphql
    #import { Module } into Interface from "wrap://ens/goerli/interface.sleep.wrappers.eth"
    #use { getImplementations } for Interface
    
    type Module implements Interface_Module {}
    ```
  
  - Wasm-as
    ```ts
    import { Interface, Interface_Module, Args_sleep } from "./wrap";
    import { Option } from "@polywrap/wasm-as";
    
    export function sleep(args: Args_sleep): Option<bool> {
      const uris = Interface.getImplementations();
      return new Interface_Module(uris[0]).sleep({
        ms: args.ms
      }).unwrap();
    }
    ```
  


- **If you are an App Developer** - You need to register the implementations of the Sleep interface using the client config.

```ts
const config = {
  ...,
  plugins: [
    ...
    {
      uri: "wrap://ens/sleep-js.polywrap.eth",
      plugin: SleepPlugin({})
    }
  ]
  interfaces: [
    {
      interface: "wrap://ens/goerli/interface.sleep.wrappers.eth",
      implementations: [
        "wrap://ens/sleep-js.polywrap.eth",
        ...
      ]
    }
  ]
}
```