/**
 * Shared navigation helper for the Author Test Cases specs (AT_TC_001 onward).
 *
 * Wraps the repeated lead-in — log in (when the cached auth state does not apply), verify the home
 * page, switch the header Business Unit to the one that exposes Author requirements, open the AUTHOR
 * TEST CASES tab and wait for its screen to render — so each test stays focused on what it validates.
 */

import { Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage }  from '../../pages/HomePage';
import { AuthorTestCasesPage } from '../../pages/AuthorTab/AuthorTestCasesPage';
import { CREDENTIALS, URLS } from '../../utils/testData';

export interface AuthorContext {
  loginPage: LoginPage;
  homePage: HomePage;
  authorPage: AuthorTestCasesPage;
}

/**
 * @param workspace Header Business Unit to select before opening the tab (Author requirements are
 *   exposed under "UATNext Dev").
 */
export async function loginAndOpenAuthorTab(page: Page, workspace = 'UATNext Dev'): Promise<AuthorContext> {
  const loginPage  = new LoginPage(page);
  const homePage   = new HomePage(page);
  const authorPage = new AuthorTestCasesPage(page);

  await loginPage.goto(URLS.base);
  if (loginPage.isOnLoginPage()) {
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
  }
  await homePage.waitForPageLoad();
  await homePage.verifyHomePageLoaded();

  await homePage.switchWorkspace(workspace);
  await homePage.navigateToAuthorTab();
  await authorPage.waitForLoaded();

  return { loginPage, homePage, authorPage };
}
