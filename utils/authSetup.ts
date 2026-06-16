import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CREDENTIALS, URLS } from './testData';
import path from 'path';

export const AUTH_STATE_PATH = path.resolve(__dirname, '../.auth/user.json');

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto(URLS.base);
  await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);

  await context.storageState({ path: AUTH_STATE_PATH });
  await browser.close();
}

export default globalSetup;
