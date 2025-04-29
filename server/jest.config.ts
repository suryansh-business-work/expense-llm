import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],  // Points Jest to the test folder
  transform: {
    '^.+\\.tsx?$': 'ts-jest',  // Transforms .ts and .tsx files using ts-jest
  },
  maxWorkers: 2,  // Reduce parallelization to help with circular structure issues
  transformIgnorePatterns: [
    "node_modules/(?!some-module-to-transform).+\\.js$"  // Exclude unnecessary modules from transformation
  ],
  testTimeout: 10000,  // Set test timeout to 10 seconds (you can adjust this)
  verbose: true,  // Enable detailed test output
  collectCoverage: true,  // Collect coverage data
  collectCoverageFrom: [
    'src/**/*.ts',  // Collect coverage from your source files (adjust as needed)
  ],
};

export default config;
