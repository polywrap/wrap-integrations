# Subscript Browser Signer Provider

This is a Polywrap plugin for accessing the accounts and signing services provided by a browser with the [polkadot-js browser extension installed](https://github.com/polkadot-js/extension). 

It exposes a minimal interface

- `getAccounts` - List the accounts managed by the plugin 
- `signPayload` - Sign a structured extrinsic payload
- `signRaw` - Sign a string of raw bytes

It is preferable to use `signPayload` when possible as it allows the extension to display much more useful information to the user about what they are signing.

## Developer Setup

After setting up the yarn workspace from the `/substrate` root run:

```shell
yarn
```

## Building

Build uses the polywrap CLI tool:

```shell
yarn build
```

## Testing

Integration tests (plugin with mock browser extension) can be run with:

```shell
yarn test
```
