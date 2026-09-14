import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://localhost:3100', headless: true, screenshot: 'only-on-failure' },
  webServer: { command: 'node server/start.js', url: 'http://localhost:3100/health', reuseExistingServer: false,
    env: { PORT: '3100', API_PORT: '3101', APP_ORIGIN: 'http://localhost:3100', NODE_ENV: 'development', MAIL_MODE: 'preview' } },
  reporter: [['list'], ['html', { open: 'never' }]],
});
