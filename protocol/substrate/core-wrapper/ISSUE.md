

# Using sp-core works without problem, but then adding the additional substrate crate: sp-runtime, sp-version, sp-std, sp-keyring will make a compilation issue.


```log
 yarn rebuild
yarn run v1.22.10
warning package.json: No license field
$ yarn clean && yarn codegen && yarn build
warning package.json: No license field
$ rm -rf module/src/w3 && rm -rf test/w3
warning package.json: No license field
$ npx w3 codegen
✔ Manifest loaded from ./web3api.yaml
✔ Codegen Web3API schema bindings
🔥 Types were generated successfully 🔥
warning package.json: No license field
$ npx w3 build
Error: Invalid Wasm module found. `mutation` at <home>/integrations-chainsafe/protocol/substrate/core-wrapper/build/mutation.wasm is invalid. Error: ,Error: Unsupported wasm import namespace requested: "__wbindgen_placeholder__"; Supported wasm import namespaces: "env", "w3"
    at Compiler.<anonymous> (<home>/integrations-chainsafe/protocol/substrate/core-wrapper/node_modules/@web3api/cli/build/lib/Compiler.js:680:31)
    at step (<home>/integrations-chainsafe/protocol/substrate/core-wrapper/node_modules/@web3api/cli/build/lib/Compiler.js:54:23)
    at Object.throw (<home>/integrations-chainsafe/protocol/substrate/core-wrapper/node_modules/@web3api/cli/build/lib/Compiler.js:35:53)
    at rejected (<home>/integrations-chainsafe/protocol/substrate/core-wrapper/node_modules/@web3api/cli/build/lib/Compiler.js:27:65)
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```
