module.exports = {
  testEnvironment: 'allure-jest/node',
  testEnvironmentOptions: {
    resultsDir: 'allure-results',
  },
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 15000,
};
