# Substrate Test Env

Substrate Test Environment for testing Polywrappers.

This folder contains both a simple Substrate chain forked from the [substrate-node-template](https://github.com/substrate-developer-hub/substrate-node-template) repo, and a javascript module that exposes helpers for starting and stopping a docker instance of this node.

## Requirements

- Docker
- Node 12
- Yarn

## Usage

### Manual

To start up a docker instance running the test chain

```shell
yarn && yarn test:env:up
```

This might take a minute or two and will exit leaving a docker instance running in the background. Check the chain is running by visiting the [polkadot-js app](https://polkadot.js.org/apps/#/explorer) and connecting to a local node running on 127.0.0.1:9944

To stop the docker instance run

```shell
yarn test:env:down
```
### Programmatic

The module can be used to start and stop the instance from inside javascript/typescript. Ideal for setting up test. It will also return the URL of the HTTP RPC endpoint for the node

```typescript
import { up, down } from "substrate-polywrap-test-env";

console.log("Starting up test chain. This can take around 1 minute..");
const response = await up();
const url = response.node.url;
console.log("Test chain running at ", url);
```

## Substrate chain info

The chain forks the substrate-node-template and adds a custom pallet called `forum`. This implements the basic functionality of a web forum allowing any account to submit content and to comment on existing content.

The forum pallet exposes two signed extrinsics:

- `post_content(content: String)`
- `comment_on(parent_content: u32, content: String)`

These are used in the test code to verify custom pallet calls work correctly.

## Updating the chain

The js module uses a cached docker image hosted on the Github Container Registry to speed up CI. Any changes made to the Substrate chain code will only be reflected in tests once the published image is updated. A [Github action](../../../.github/workflows/substrate-publish-test-docker-image.yaml) is responsible for updating the hosted image when changes are merged to `main`.

Be careful not to change both the substrate code and any code that runs the tests in the same PR as the substrate changes will not be reflected in the PR CI runs before it is merged.
