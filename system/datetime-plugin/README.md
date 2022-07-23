# Datetime
It is a simple library that allows fetching current unix timestamp from the host.

## Usage

- **If you are a Wrap Developer** - then you just need to import the datetime plugin with its registered uri and call the methods it provide like you'd normally with any imported wrappers.

  - Schema
    ```graphql
    #import * into Datetime from "wrap://ens/datetime.polywrap.eth"

    type Module{
      timestamp(): Int!
    }
    ```
  
  - Wasm-as
    ```ts
    import { 
      Datetime_Module,
      Args_timestamp
    } from "./wrap";

    export function timestamp(args: Args_timestamp): i32 {
      return Datetime_Module.currentTimestamp();
    }
    ```
  


- **If you are an App Developer** - then you need to register the datetime plugin using client config.

```ts
const config = {
  ...,
  plugins: [
    ...
    {
      uri: "wrap://ens/datetime.polywrap.eth"
      plugin: DatetimePlugin()
    }
  ]
}
```