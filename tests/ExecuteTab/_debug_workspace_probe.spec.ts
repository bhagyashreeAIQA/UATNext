import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS } from '../../utils/testData';

test('debug: inspect workspace/project values under UATNext Dev BU', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  const executeTabPage = new ExecuteTabPage(page);

  await loginPage.goto(URLS.base);
  if (loginPage.isOnLoginPage()) {
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
  }
  await homePage.waitForPageLoad();

  const activeBuBefore = await homePage.getActiveProject();
  console.log('ACTIVE_BU_BEFORE:', activeBuBefore);

  await homePage.switchWorkspace('UATNext Dev');
  const activeBuAfter = await homePage.getActiveProject();
  console.log('ACTIVE_BU_AFTER:', activeBuAfter);

  await homePage.navigateToExecuteTab();
  await executeTabPage.waitForSidebarLoad();

  const sidebarWorkspaceValue = await executeTabPage.getWorkspaceValue();
  console.log('SIDEBAR_WORKSPACE_VALUE:', sidebarWorkspaceValue);

  const headerProjectValue = await executeTabPage.getProjectValue();
  console.log('HEADER_PROJECT_VALUE:', headerProjectValue);
});
