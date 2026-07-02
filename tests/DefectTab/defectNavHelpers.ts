/**
 * Shared navigation helper for the Defect tab specs (Def_TC_001 onward).
 *
 * Wraps the repeated lead-in — log in (when the cached auth state does not apply),
 * verify the home page, open the DEFECT tab and wait for the defect grid to finish
 * loading — so each test stays focused on what it actually validates.
 */

import { Page } from '@playwright/test';
import { LoginPage }     from '../../pages/LoginPage';
import { HomePage }      from '../../pages/HomePage';
import { DefectTabPage } from '../../pages/DefectTab/DefectTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

export interface DefectContext {
  loginPage: LoginPage;
  homePage: HomePage;
  defectTabPage: DefectTabPage;
}

/**
 * Logs in (if needed), switches to the workspace that owns the seeded defect data,
 * opens the DEFECT tab and waits for the defect page — grid header, CREATE DEFECT
 * button and pagination — to be fully rendered, so the grid loads populated.
 *
 * The seeded defects live in the UATNext Dev workspace (EXPECTED.defect.workspace),
 * so callers switch there by default; pass an explicit `workspace` to override.
 */
export async function loginAndOpenDefectTab(
  page: Page,
  workspace: string = EXPECTED.defect.workspace,
): Promise<DefectContext> {
  const loginPage     = new LoginPage(page);
  const homePage      = new HomePage(page);
  const defectTabPage = new DefectTabPage(page);

  await loginPage.goto(URLS.base);
  if (loginPage.isOnLoginPage()) {
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
  }
  await homePage.waitForPageLoad();
  await homePage.verifyHomePageLoaded();
  if (workspace) await homePage.switchWorkspace(workspace);
  await defectTabPage.open();
  await defectTabPage.ensureDefectsLoaded();

  return { loginPage, homePage, defectTabPage };
}
