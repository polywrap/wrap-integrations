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

## Developer Setup

This project uses yarn workspaces. Before making changes run 
```
yarn
```
from the workspace root (`/protocol/substrate`)
