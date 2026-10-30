const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // scripts/**/*.test.mjs are node:test suites (run with `node --test`). Jest 30 collects .mjs files by
  // default, so keep them out as Jest 29 did.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/out/', '<rootDir>/scripts/'],
};

module.exports = createJestConfig(customJestConfig);
