# Substrate core wrapper (WIP)

A wrapper to be used in developing application specific Substrate wrappers.

## TODO

This is still a work in progress and requires the following before it is ready for use by API developers

- [ ] Fix extrinsic encoding issue so tx are accepted in tests (see ./tests/e2e.spec.ts)
    - I think this is something to do with the signature encoding. Not sure on the details.
- [ ] Change API for `sign` and `signAndSend` so that it retrieves certain fields (account nonce, era, genesis_block, etc) automatically from the RPC similar to polkadot-js. This makes the public API much simpler and easy to use for consumers
- [ ] Ensure error handling is correct and passes useful error messages to consumers
- [ ] Complete test suite to include failure cases

## Prerequisite
- Install a recent version of node
    `nvm install & nvm use`

## Building and testing
1. Download the needed dependencies
```shell
yarn
```

2. Build
```shell
yarn codegen && yarn build
```

3. Run the test
```shell
yarn test
```

## Deploying the wrapper
```
yarn deploy
```


Take note of the hash, this will be use to set the URI when using the module
```shell
Successfully executed stage 'ipfs_deploy'. Result: 'wrap://ipfs/QmUShkhii5JUM9t3RnZtS2kTUqReSjNVHQ9NaMzEMazqJ9'
Done in 3.80s.
```
