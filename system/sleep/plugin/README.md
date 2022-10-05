# Sleep plugin wrapper

The sleep plugin wrapper implements the `Sleep` interface. It can be used to execute a sleep (i.e. pause thread for specified milliseconds). The sleep plugin can be configured to execute a callback on waking.

The sleep plugin can be invoked at a chosen URI by registering the plugin in the Polywrap client configuration.

By configuring the client with implementations for URI `wrap://ens/goerli/interface.sleep.wrappers.eth`, we are able to fetch those and trigger them. The sleep plugin can be registered as an interface implementation for the `Sleep` interface.

In this example, the client is being instantiated:

```typescript
const client = new PolywrapClient({
  ...,
  plugins: {
    ...,
    {
      uri: "wrap://ens/sleep-js.polywrap.eth",
      plugin: sleepPlugin({ onWake = () => true })  
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

### Sleep Plugin Methods

- sleep

### How To Run

## Install Dependencies
`nvm install && nvm use`  
`yarn`  

## Build
`yarn build`  

## Test
`yarn test`  
