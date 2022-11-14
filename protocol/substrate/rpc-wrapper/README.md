# Substrate core wrapper

A wrapper to be used in developing application specific Substrate wrappers.

## Prerequisite
- Install a recent version of node
    `nvm install & nvm use`
- Docker installed (see OS specific installation guides)

## Using the Wrapper

The Substrate core wrapper can either be used directly in an application or used to make dApp specific wrapper.

### Using directly (js example)

The wrapper requires a Substrate signer-provider in order to sign transactions. Current the only implementation for this is for a browser javascript host and integrates with the polkadot-js browser extension for signing. In the future other signing providers might be added.

In your web code create a new Polywrap client with the required plugin:

```javascript
import { PolywrapClient, Uri } from "@polywrap/client-js";
import { substrateSignerProviderPlugin } from "substrate-signer-provider-plugin-js";

client = new PolywrapClient({
  plugins: [
    {
      uri: "ens/substrate-signer-provider.eth",
      plugin: substrateSignerProviderPlugin({})
    }
  ]
});
```

This client can be used to make calls using the `Substrate_Module`:

```javascript
import { Substrate_Module } from "@polywrap/substrate-rpc-wrapper"; // Package name may differ

const url = "<URL/OF/Chain/RPC>";
const uri = "ens/substrate-rpc-wrapper.eth";

const result = await Substrate_Module.chainGetMetadata({
    url
  },
  client,
  uri
);
// Returns the metadata for the connected chain
```

### Using in Custom Wrappers (js/ts)

Create a new empty wrapper following the [Polywrap developer docs](https://docs.polywrap.io/quick-start/create-plugin-wrappers/create-js-plugin)

Import the Substrate base functionality into the `schema.graphql` file

```graphql
#import * into Substrate from "ens/substrate-rpc-wrapper.eth"
```

Generate the code from this using:

```shell
npm run codegen
```

You will now have access to all of the core substrate-rpc functionality inside the new wrapper code.

```javascript
import { Substrate_Module } from "../wrap";

const result = await Substrate_Module.blockHash({
    url,
    number: 0
});
```


## Building and Development
1. Download the needed dependencies
```shell
yarn
```

2. Build
```shell
yarn codegen && yarn build
```

Codegen must be run before attempting any development on the wrapper.

## Testing

Integration tests are included to test integration with:

- The signer-provider plugin
- A mock browser with a polkadot-js extension
- A substrate chain

Integration tests are included in [tests/e2e.spec.ts](./tests/e2e.spec.ts) and can be run with:

```shell
yarn test
```

This will take care of starting a Substrate test chain using Docker and running the tests.

## Deploying the wrapper
```
yarn deploy
```

Take note of the hash, this will be use to set the URI when using the module
```shell
Successfully executed stage 'ipfs_deploy'. Result: 'wrap://ipfs/QmUShkhii5JUM9t3RnZtS2kTUqReSjNVHQ9NaMzEMazqJ9'
Done in 3.80s.
```

## Future Work

This is missing some features and requires the following before it is ready for use by API developers

- [ ] Fix extrinsic encoding issue so tx are accepted in tests (see ./tests/e2e.spec.ts)
    - I think this is something to do with the signature encoding. Not sure on the details.
- [ ] Change API for `sign` and `signAndSend` so that it retrieves certain fields (account nonce, era, genesis_block, etc) automatically from the RPC similar to polkadot-js. This makes the public API much simpler and easy to use for consumers
- [ ] Ensure error handling is correct and passes useful error messages to consumers
- [ ] Complete test suite to include failure cases
