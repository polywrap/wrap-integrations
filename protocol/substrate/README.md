# Polywrap Substrate

This folder contains a number of components for building wrappers to target Substrate based blockchains.

### rpc-wrapper

The lowest level way to interact with a Substrate chain that follows the usual conventions including:

- Retrieving chain info and metadata
- Retrieving account info
- Listing managed accounts (given a provider plugin)
- Signing transactions (given a provider plugin)
- Submitting transaction

Any actions that involve using locally managed accounts or their private keys requires a Substrate signer plugin be provided by the host environment.

### signer-provider

This is a Substrate signer plugin for web based javascript environments. It hooks into the polkadot-js browser plugin to access accounts and signing services

### test-env

A javascript package for starting up a docker image running a Substrate test chain. This also contains the code for the chain itself which can be modified if needed.

### mock-polkadot-js-extension

To allow for testing the signer-provider and rpc-wrapper in non-browser environments this package can be used to inject a mock extension into a the environment.

## Developer Setup

This project uses yarn workspaces. Before making changes run 
```
yarn
```
from the workspace root (`/protocol/substrate`)

