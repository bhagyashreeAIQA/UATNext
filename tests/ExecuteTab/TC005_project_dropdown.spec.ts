/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Project Dropdown
 * Test Case ID : TC-005
 * Test Name    : Verify Project dropdown loads correctly
 *
 * Description  : As a Test Engineer, I want to verify that the Project dropdown
 *                loads and displays values correctly, so that I can select from
 *                the multiple projects.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : TC-004 pre-conditions must hold (Project auto-fill is verified first).
 */

import { test, expect } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Project Dropdown', () => {

  test('TC-005 | Verify Project dropdown loads correctly', async ({ page }) => {
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-004): Login, navigate, verify workspace + project ──
    // Expected: Project field should be auto-filled with workspace synced value

    await loginPage.goto(URLS.base);
    if (loginPage.isOnLoginPage()) {
      await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    }
    await homePage.waitForPageLoad();
    await homePage.verifyHomePageLoaded();

    await homePage.navigateToExecuteTab();
    await executeTabPage.waitForSidebarLoad();
    await executeTabPage.verifyWorkspaceAutoFilled(EXPECTED.workspaceValue);
    await executeTabPage.verifyProjectTextVisible();
    await executeTabPage.verifyProjectAutoFilled(EXPECTED.activeProject);
    await captureScreenshot(page, "Step 1 (follows TC-004): Login, navigate, verify workspace + project");

    // ─── Step 2: Click on the Project dropdown ────────────────────────────────
    // Expected: Project list should open

    await executeTabPage.openProjectDropdown();
    await executeTabPage.verifyProjectDropdownOpen();
    await captureScreenshot(page, "Step 2: Click on the Project dropdown");

    // ─── Step 3: Validate the values ─────────────────────────────────────────
    // Expected: All mapped projects with the workspace should be displayed

    await executeTabPage.verifyProjectDropdownHasAtLeastOneOption();
    await executeTabPage.verifyProjectDropdownContains([EXPECTED.activeProject]);
    await captureScreenshot(page, "Step 3: Validate the values");

    // ─── Step 4: Select a project ─────────────────────────────────────────────
    // Expected: Selected project should appear in the field

    const currentProject  = await executeTabPage.getProjectValue();
    const selectedProject = await executeTabPage.selectDifferentProject(currentProject);

    await executeTabPage.verifyProjectDropdownClosed();
    await executeTabPage.verifyProjectUpdatedTo(selectedProject);
    await captureScreenshot(page, "Step 4: Select a project");

    // ─── Step 4 (continued): Validate the releases list ──────────────────────
    // Expected: Releases should be visible based on the selected project

    await executeTabPage.waitForReleasesLoad();
    await executeTabPage.verifyReleasesVisible();
    await executeTabPage.verifyAtLeastOneRelease();
    await captureScreenshot(page, "Step 4 (continued): Validate the releases list");
  });

});
