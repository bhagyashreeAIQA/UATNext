/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Project
 * Test Case ID : TC-004
 * Test Name    : Verify Project is auto-filled from qTest based on the workspace Selection
 *
 * Description  : As a Test Engineer, I want to verify that the Project field is
 *                automatically populated with the value synced from selected workspace.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : TC-001 pre-conditions must hold (Workspace auto-fill is verified first).
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Project', () => {

  test('TC-004 | Verify Project is auto-filled from qTest based on the workspace Selection', async ({ page }) => {
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-001): Login and verify Workspace is auto-filled ────
    // Expected: Workspace field should be auto-filled with qTest synced value

    await loginPage.goto(URLS.base);
    if (loginPage.isOnLoginPage()) {
      await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    }
    await homePage.waitForPageLoad();
    await homePage.verifyHomePageLoaded();

    await homePage.navigateToExecuteTab();
    await executeTabPage.waitForSidebarLoad();
    await executeTabPage.verifyWorkspaceAutoFilled(EXPECTED.workspaceValue);

    // ─── Step 2: Navigate to Execute Test Cases tab ───────────────────────────
    // Expected: Execute Test Cases page should open

    await executeTabPage.verifyExecuteTabIsActive();

    // ─── Step 3: Validate visibility of Project Text ──────────────────────────
    // Expected: Project Text is displayed

    await executeTabPage.verifyProjectTextVisible();

    // ─── Step 4: Validate Project field ──────────────────────────────────────
    // Expected: Project field should be auto-filled with workspace synced value

    await executeTabPage.verifyProjectAutoFilled(EXPECTED.activeProject);
    await executeTabPage.verifyProjectNotEmpty();
  });

});
