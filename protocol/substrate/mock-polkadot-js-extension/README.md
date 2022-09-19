# Mock Polkadot-js Extension

A package used for the tests of signer-provider and rpc-wrapper.

It allows jest tests to act as though they are running in the browser with an injectedWeb3 object on the window just like a Polkadot-js browser extension is installed.

## Important!

Polkadot-js is very finicky when it comes to running in Jest environments. A test environment that I have had working is as follows


jest versions
```
    "jest": "^27.0.0-next.9",
    "jest-environment-jsdom": "^27.0.0-next.9",
    "ts-jest": "^27.0.0-next.9",
```

jest.config.js
```js
module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(spec|test).+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "\\.[j]sx?$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  "transformIgnorePatterns": [
    "node_modules/(?!@polkadot|@babel/runtime/helpers/esm/|mock-polkadot-js-extension)"
  ],
  testEnvironment: 'jsdom'
}
```

babel.config.js
```js
module.exports = require('@polkadot/dev/config/babel-config-cjs.cjs');
```