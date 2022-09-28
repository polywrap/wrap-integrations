module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "testMatch": [
    "**/tests/**/*.+(spec|test).+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "\\.[j]sx?$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!@polkadot|@babel/runtime/helpers/esm/|uuid/dist/esm-browser/)"
  ],
};
