/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Tab Navigation
 * Test Case ID : TC-003
 * Test Name    : Verify all the tabs are accessible
 *
 * Description  : As a Test Engineer, I want to verify that all the tabs are
 *                visible and accessible.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : TC-001 pre-conditions must hold (Workspace auto-fill is verified first).
 */

import { test, expect } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { AuthorTabPage }  from '../../pages/AuthorTab/AuthorTabPage';
import { DefectTabPage }  from '../../pages/DefectTab/DefectTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Tab Navigation', () => {

  test('TC-003 | Verify all the tabs are accessible', async ({ page }) => {
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);
    const authorTabPage  = new AuthorTabPage(page);
    const defectTabPage  = new DefectTabPage(page);

    // ─── Step 1 (follows TC-001): Login and verify Workspace is auto-filled ──
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
    await captureScreenshot(page, "Step 1 (follows TC-001): Login and verify Workspace is auto-filled");

    // ─── Verify all three tabs are visible in the navigation bar ─────────────

    await expect(homePage.authorTestCasesTab).toBeVisible();
    await expect(homePage.executeTestCasesTab).toBeVisible();
    await expect(homePage.defectTab).toBeVisible();
    await captureScreenshot(page, "Verify all three tabs are visible in the navigation bar");

    // ─── Step 2 & 3: Navigate to Author Test Cases tab and validate ───────────
    // Expected: Author Test Cases page should open with requirements table

    await homePage.navigateToAuthorTab();
    await authorTabPage.waitForPageLoad();
    await authorTabPage.verifyAuthorPageFullyLoaded();
    await captureScreenshot(page, "Step 2 & 3: Navigate to Author Test Cases tab and validate");

    // ─── Step 3 (continued): Navigate to Execute Test Cases tab and validate ──
    // Expected: Execute Test Cases page should open with Workspace dropdown

    await homePage.navigateToExecuteTab();
    await executeTabPage.waitForSidebarLoad();
    await executeTabPage.verifyExecuteTabIsActive();
    await executeTabPage.verifyWorkspaceLabelVisible();
    await executeTabPage.verifyWorkspaceDropdownVisible();
    await executeTabPage.verifyWorkspaceNotEmpty();
    await captureScreenshot(page, "Step 3 (continued): Navigate to Execute Test Cases tab and validate");

    // ─── Step 5 & 6: Navigate to Defect tab and validate ─────────────────────
    // Expected: Defect page should open with defect table and filters

    await homePage.navigateToDefectTab();
    await defectTabPage.waitForPageLoad();
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyLeftPanelControls();
    await captureScreenshot(page, "Step 5 & 6: Navigate to Defect tab and validate");
  });

});
