module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/e2e/**/?(*.)+(spec|test).[jt]s?(x)"],
  modulePathIgnorePatterns: ['./src/__tests__/entities', './src/__tests__/utils', './src/wrap'],
  globals: {
    'ts-jest': {
      tsconfig: "tsconfig.ts.json",
      diagnostics: false
    }
  }
};
