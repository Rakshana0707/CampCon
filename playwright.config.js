const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false, // Run tests sequentially for state dependency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker since E2E flows alter the DB
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:5173', // Vite default port
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Assuming frontend is running on 5173 and backend on 5000. 
  // In a real CI environment, we would use webServer config to boot both.
});
