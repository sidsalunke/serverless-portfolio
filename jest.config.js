'use strict';

module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/a11y/**/*.test.js',
    '<rootDir>/tests/snapshot/**/*.test.js',
  ],
  // No Babel — our test files and app.js are plain CommonJS
  transform: {},
  setupFilesAfterEnv: ['jest-axe/extend-expect'],

  // Coverage — only instrument app.js (the one file with testable logic).
  // Run via `npm run test:coverage`; not collected on every test run.
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json-summary', 'lcov', 'html'],
  collectCoverageFrom: ['js/app.js'],
  coverageThresholds: {
    global: {
      lines:      80,
      statements: 80,
      functions:  80,
      branches:   70,
    },
  },
};
