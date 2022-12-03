# Mock Polkadot-js Extension

This module is designed to be used in jest tests (jsdom environment) to mock running in a browser with polkadot-js browser extension installed.

It comes with a fake account `Alice` which corresponds to the test derived account Alice on Substrate test chains.

## Usage

```js
import { enableFn } from "mock-polkadot-js-extension";

beforeAll(async () => {
    // injects the mock extension into the page
    await injectExtension(enableFn, { name: 'mockExtension', version: '1.0.0' });
})

```

and you are good to go!

It is now possible to use code which would usually require the extension

```js
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';


await web3Enable("my-dApp");
const accounts = await web3Accounts();
console.log(accounts)

// outputs:
// [
//   {
//     address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
//     meta: { genesisHash: undefined, name: 'alice', source: 'mockExtension' },
//     type: 'sr25519'
//   }
// ]

```