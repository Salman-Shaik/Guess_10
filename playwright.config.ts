import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'node scripts/serve-e2e.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGINT', timeout: 1_000 },
    env: { PORT: '4173', BROWSER: 'none' },
    timeout: 120_000,
  },
});
