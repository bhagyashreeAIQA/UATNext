/**
 * Shared navigation helper for the Coordinator → Generate Test Log specs (GTL_TC_001 onward).
 *
 * Wraps the repeated lead-in — log in (when the cached auth state does not apply), verify the home
 * page, open the COORDINATOR tab and wait for the Generate Test Log screen — so each test stays
 * focused on what it validates.
 *
 * The COORDINATOR tab is permission-gated; the test account must hold the coordinator role (see the
 * GenerateTestLogPage note). Tests run on the default qConnect - Sample Project BU, which exposes the
 * tab and has approved test cases with runs — the documented "UATNext Dev" BU has no executable test
 * data (the same data deviation the Defect-tab specs document).
 */

import { Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage }  from '../../pages/HomePage';
import { GenerateTestLogPage } from '../../pages/Coordinator/GenerateTestLogPage';
import { BulkExecutionPage } from '../../pages/Coordinator/BulkExecutionPage';
import { CREDENTIALS, URLS } from '../../utils/testData';

export interface CoordinatorContext {
  loginPage: LoginPage;
  homePage: HomePage;
  generateTestLogPage: GenerateTestLogPage;
}

export async function loginAndOpenGenerateTestLog(page: Page): Promise<CoordinatorContext> {
  const loginPage = new LoginPage(page);
  const homePage  = new HomePage(page);
  const generateTestLogPage = new GenerateTestLogPage(page);

  await loginPage.goto(URLS.base);
  if (loginPage.isOnLoginPage()) {
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
  }
  await homePage.waitForPageLoad();
  await homePage.verifyHomePageLoaded();

  await homePage.navigateToCoordinatorTab();
  await generateTestLogPage.waitForScreenLoad();

  return { loginPage, homePage, generateTestLogPage };
}

export interface BulkExecutionContext {
  loginPage: LoginPage;
  homePage: HomePage;
  bulkExecutionPage: BulkExecutionPage;
}

/**
 * Logs in, switches the header workspace to `workspace` (Bulk Execution is exercised on UATNext Dev,
 * whose releases carry test runs), opens the COORDINATOR tab and activates the Bulk Execution sub-tab.
 */
export async function loginAndOpenBulkExecution(
  page: Page,
  workspace: string,
): Promise<BulkExecutionContext> {
  const loginPage = new LoginPage(page);
  const homePage  = new HomePage(page);
  const bulkExecutionPage = new BulkExecutionPage(page);

  await loginPage.goto(URLS.base);
  if (loginPage.isOnLoginPage()) {
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
  }
  await homePage.waitForPageLoad();
  await homePage.verifyHomePageLoaded();

  await homePage.switchWorkspace(workspace);
  await homePage.navigateToCoordinatorTab();

  return { loginPage, homePage, bulkExecutionPage };
}

/**
 * Drives the full left-panel flow — search a Test Case, wait for the version, select a run and click
 * GENERATE TEST LOG — leaving the right-panel Last Log / New Log grids rendered. Used by the specs
 * that validate the generated log (GTL_TC_006 onward).
 */
export async function searchSelectAndGenerate(
  gtl: GenerateTestLogPage,
  pid: string,
  run: string,
): Promise<void> {
  await gtl.searchValidTestCase(pid);
  await gtl.selectTestRun(run);
  await gtl.clickGenerate();
}
