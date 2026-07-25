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
};
