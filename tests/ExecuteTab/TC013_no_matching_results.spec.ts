/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Empty State
 * Test Case ID : TC-013
 * Test Case Name: Validate "No Matching Results Found" Message When No Data Exists for a
 *                 Selected Release
 *
 * Description  : As a Test Engineer, I want to validate that the system displays the
 *                message "No matching results found" when no test runs match the selected
 *                filters or search criteria, so that I clearly understand when no data is
 *                available for execution.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-001 (workspace auto-fill) then reaches a release whose grid
 *                holds no test runs for the user.
 *
 * Steps:
 *   1. Follow TC-001.
 *   2. Navigate to the Execute Test Cases tab.
 *   3. Select a Release with no test runs (the default "Assigned to me" view returns no
 *      runs for this user).
 *   4. Validate the test run grid.
 *   5. Enter a search keyword that does not match any test run.
 *
 * Note: Two independent paths render the empty state and both are exercised: (a) the
 *       default "Assigned to me" filter returns 0 runs for this user, and (b) a
 *       validly-formatted but non-existent Test Run ID search returns 0 matches. The grid
 *       shows "No matching results found" in both cases.
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Empty State', () => {

  test('TC-013 | Validate "No Matching Results Found" Message When No Data Exists for a Selected Release', async ({ page }) => {
    test.setTimeout(180000);
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-001): Login and verify Workspace auto-fill ───────────
    // Expected: Workspace field should be auto-filled with the qTest synced value

    await loginPage.goto(URLS.base);
    if (loginPage.isOnLoginPage()) {
      await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    }
    await homePage.waitForPageLoad();
    await homePage.verifyHomePageLoaded();
    await captureScreenshot(page, "Step 1 (follows TC-001): Login and verify Workspace auto-fill");

    // ─── Step 2: Navigate to the Execute Test Cases tab ──────────────────────────
    // Expected: Execute Test Cases page should open

    await homePage.navigateToExecuteTab();
    await executeTabPage.waitForSidebarLoad();
    await executeTabPage.verifyWorkspaceLabelVisible();
    await executeTabPage.verifyWorkspaceDropdownVisible();
    await executeTabPage.verifyWorkspaceAutoFilled(EXPECTED.workspaceValue);
    await executeTabPage.verifyWorkspaceNotEmpty();

    // Switch to the project that exposes releases, then load them.
    const workspaceBeforeSwitch = await executeTabPage.getWorkspaceValue();
    await executeTabPage.openProjectDropdown();
    const currentProject  = await executeTabPage.getProjectValue();
    const selectedProject = await executeTabPage.selectDifferentProject(currentProject);
    await executeTabPage.verifyProjectUpdatedTo(selectedProject);
    await executeTabPage.waitForProjectSwitchComplete(workspaceBeforeSwitch);
    await executeTabPage.waitForReleasesLoad();
    await captureScreenshot(page, "Step 2: Navigate to the Execute Test Cases tab");

    // ─── Step 3: Select a Release with no test runs ──────────────────────────────
    // Expected: Grid should refresh automatically
    //
    // The cycle is opened under the default "Assigned to me" filter, which returns no
    // runs for the logged-in user.

    await executeTabPage.expandFirstReleaseWithTestCycles();
    await executeTabPage.verifyReleaseExpanded();
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForGridContainerReady();
    await captureScreenshot(page, "Step 3: Select a Release with no test runs");

    // ─── Step 4: Validate the test run grid ──────────────────────────────────────
    // Expected: Grid should display the message "No matching results found"

    await executeTabPage.verifyNoResultsMessageVisible();
    await captureScreenshot(page, "Step 4: Validate the test run grid");

    // ─── Step 5: Enter a search keyword that does not match any test run ──────────
    // Expected: Grid should continue to display "No matching results found"

    await executeTabPage.searchTestRun(EXPECTED.nonMatchingSearchId);
    await executeTabPage.verifyNoResultsMessageVisible();
    await captureScreenshot(page, "Step 5: Enter a search keyword that does not match any test run");
  });

});
