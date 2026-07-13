import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const RELEASE_TAG = process.env.RELEASE_TAG || 'local';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Every run's HTML/JSON reports are namespaced by release tag so regression
  // results can be archived and compared release over release (see README
  // "Release cadence" section).
  reporter: [
    ['list'],
    ['html', { outputFolder: `reports/${RELEASE_TAG}/html`, open: 'never' }],
    ['json', { outputFile: `reports/${RELEASE_TAG}/results.json` }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // API tests don't need a browser context; they're tagged @api and can be
    // run standalone with `npm run test:api`, but they still run fine under
    // this project since Playwright's request fixture doesn't require one.
  ],
});
