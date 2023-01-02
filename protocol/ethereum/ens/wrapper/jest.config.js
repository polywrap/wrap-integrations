module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [".polywrap"],
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  modulePathIgnorePatterns: [".polywrap"],
  globals: {
    'ts-jest': {
      tsconfig: "tsconfig.ts.json",
      diagnostics: false
    }
  }
};
