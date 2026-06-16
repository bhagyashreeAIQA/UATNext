/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Workspace
 * Test Case ID : TC-001
 * Test Name    : Verify Workspace is auto-filled from qTest
 *
 * Description  : As a Test Engineer, I want to verify that the Workspace field is
 *                automatically populated with the value synced from qTest, so that
 *                I don't have to manually select a project before executing test cases.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Workspace', () => {

  test('TC-001 | Verify Workspace is auto-filled from qTest', async ({ page }) => {
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1: Login to UATNext application ────────────────────────────────
    // Expected: UATNext homepage should open
    await loginPage.goto(URLS.base);
    if (loginPage.isOnLoginPage()) {
      // No cached auth state — perform full login
      await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    }
    await homePage.waitForPageLoad();
    await homePage.verifyHomePageLoaded();

    // ─── Step 2: Navigate to Execute Test Cases tab ───────────────────────────
    // Expected: Workspace dropdown is displayed
    await homePage.navigateToExecuteTab();
    await executeTabPage.waitForSidebarLoad();

    await executeTabPage.verifyWorkspaceLabelVisible();
    await executeTabPage.verifyWorkspaceDropdownVisible();

    // ─── Step 3: Validate Workspace field value ───────────────────────────────
    // Expected: Workspace field should be auto-filled with qTest synced value
    await executeTabPage.verifyWorkspaceAutoFilled(EXPECTED.workspaceValue);
    await executeTabPage.verifyWorkspaceNotEmpty();
  });

});
