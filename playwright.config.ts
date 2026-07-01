import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export const AUTH_STATE_PATH = path.resolve(__dirname, '.auth/user.json');

export default defineConfig({
  testDir: './tests',
  globalSetup: './utils/authSetup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One local retry absorbs transient races against the shared dev backend (occasional slow
  // SignalR streaming / project-tree reload). Genuinely broken tests still fail on the retry;
  // recovered ones are reported as "flaky" rather than silently passing.
  retries: process.env.CI ? 2 : 1,
  // Cap local workers: the suite drives a shared dev backend (Blazor/SignalR streaming) in
  // headed mode, and too many concurrent browsers starve it (sidebar stalls on "Loading
  // projects..."). Four keeps the run parallel but stable.
  workers: process.env.CI ? 1 : 6,
  //reporter: [['html', { open: 'never' }], ['list']],
  reporter: [
    ['html', { outputFolder: `playwright-report/run-${Date.now()}` }],
    ['json', { outputFile: `test-logs/report-${Date.now()}.json` }]
  ],

  use: {
    baseURL: 'https://webapp-v1-blazor-uatnext-dev.azurewebsites.net',
    storageState: AUTH_STATE_PATH,
    trace: 'on-first-retry',
    screenshot: 'on',    
    video: 'retain-on-failure',
    headless: false,
    // Bound individual actions/navigations so a non-actionable element fails fast with a
    // clear error instead of silently waiting out the whole (5-minute) test timeout.
    actionTimeout: 20000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
