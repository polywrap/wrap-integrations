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
    "node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)"
  ],
  testEnvironment: 'jsdom'
}
