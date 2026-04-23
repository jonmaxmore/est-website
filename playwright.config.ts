import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// Load test-specific env vars
dotenv.config({ path: '.env.test' })

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000'
const configuredWorkers = Number.parseInt(process.env.E2E_WORKERS || '', 10)
const workers = Number.isFinite(configuredWorkers) && configuredWorkers > 0
  ? configuredWorkers
  : process.platform === 'win32' ? 1 : process.env.CI ? 2 : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Chromium context teardown is flaky on Windows when the full suite fans out.
  workers,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
