# Sleep Wasm wrapper

The sleep Wasm wrapper uses the `Sleep` interface and an implementation to execute a sleep (i.e. pause thread for specified milliseconds). 

By configuring the client with implementations for URI `wrap://ens/goerli/interface.sleep.wrappers.eth`, we are able to fetch those and trigger them. The sleep wrapper executes the first implementation registered in the client configuration.

In this example, the client is being instantiated:

```typescript
const client = new PolywrapClient({
  ...,
  plugins: {
    ...,
    {
      uri: "wrap://ens/sleep-js.polywrap.eth",
      plugin: sleepPlugin({})  
    }
  }, 
  interfaces: {
    ...,
    interface: "wrap://ens/goerli/interface.sleep.wrappers.eth",
    implementations: [
      new Uri("wrap://ens/sleep-js.polywrap.eth"),
    ]
  },
  ...
})
```
The implementation is being injected because we are defining the plugin with a URI and then adding it into
the implementations array on interface `wrap://ens/goerli/interface.sleep.wrappers.eth`.

Then, in the `schema.graphql` we declare the interface and use the `getImplementations` method.
```graphql
#import { Module } into Interface from "wrap://ens/sleep.polywrap.eth"
#use { getImplementations } for Interface

type Module implements Interface_Module {}
```
The `wrap://ens/sleep.polywrap.eth` URI points to ENS (in Mainnet) and contents
as a content the IPFS Hash where the deployed interface lives (check https://app.ens.domains/name/sleep.polywrap.eth/details)

This will allow us to fetch the existing implementations in run time and execute them. In this
example, we are executing the first by doing:
```typescript
import { Interface, Interface_Module, Args_sleep } from "./wrap";
import { Option } from "@polywrap/wasm-as";

export function sleep(args: Args_sleep): Option<bool> {
  const uris = Interface.getImplementations();
  return new Interface_Module(uris[0]).sleep({
    ms: args.ms
  }).unwrap();
}
```

### Sleep Methods

- sleep

### How To Run

### 1. Set correct node version, install dependencies & build the wrapper

```
nvm use && yarn && yarn build
```

This method will create the `build` folder which will be then accessed just by doing `wrap://fs/./build`

### 2. Test The wrapper Using Jest

```
yarn test
```
