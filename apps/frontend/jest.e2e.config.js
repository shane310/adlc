/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/e2e/**/*.spec.js'],
  testTimeout: 120000,
  setupFilesAfterEnv: ['<rootDir>/jest.e2e.setup.js'],
};
