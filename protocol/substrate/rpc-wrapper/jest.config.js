module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ["**/tests/*.spec.ts"],
  globals: {
    'ts-jest': {
      tsconfig: "tsconfig.json",
      diagnostics: false
    }
  }
};
