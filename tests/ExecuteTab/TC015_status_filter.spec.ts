/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Status Dropdown Filter
 * Test Case ID : TC-015
 * Test Case Name: Validate Status Dropdown Filter Functionality for a Selected Release
 *
 * Description  : As a Test Engineer, I want to validate that the Status dropdown filters
 *                test runs correctly based on execution status, so that I can quickly
 *                identify test runs by their current state.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 (View All so the grid is populated across multiple
 *                statuses).
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Validate the list of available statuses.
 *   5. Select a specific status (Passed).
 *   6. Change the selected status to another value (Failed).
 *
 * Note: The live dropdown renders "InProgress" without a space; EXPECTED.statusOptions
 *       holds the actual option strings. A status with at least one run in this release is
 *       chosen at each step so the per-row status assertion is meaningful.
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Status Dropdown Filter', () => {

  test('TC-015 | Validate Status Dropdown Filter Functionality for a Selected Release', async ({ page }) => {
    test.setTimeout(180000);
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-006): reach a populated grid (View All) ──────────────

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

    const workspaceBeforeSwitch = await executeTabPage.getWorkspaceValue();

    await executeTabPage.openProjectDropdown();
    await executeTabPage.verifyProjectDropdownOpen();
    await executeTabPage.verifyProjectDropdownHasAtLeastOneOption();
    await executeTabPage.verifyProjectDropdownContains([EXPECTED.activeProject]);

    const currentProject  = await executeTabPage.getProjectValue();
    const selectedProject = await executeTabPage.selectDifferentProject(currentProject);
    await executeTabPage.verifyProjectDropdownClosed();
    await executeTabPage.verifyProjectUpdatedTo(selectedProject);

    await executeTabPage.waitForProjectSwitchComplete(workspaceBeforeSwitch);
    await executeTabPage.waitForReleasesLoad();
    await executeTabPage.verifyReleasesVisible();
    await executeTabPage.verifyAtLeastOneRelease();

    await executeTabPage.expandFirstReleaseWithTestCycles();
    await executeTabPage.verifyReleaseExpanded();
    await executeTabPage.verifyTestCyclesVisible();

    // ─── Step 2: Select the View All radio button ────────────────────────────────
    // Expected: Grid refreshes and displays all test runs for the selected filters

    // Reach the cycle grid, then establish "View All" robustly (a late Blazor re-render
    // from the cycle click can reset the Assignee radio, so this retries until it sticks).
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForGridContainerReady();
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Steps 3 & 4: Open the Status dropdown and validate the available statuses ─
    // Expected: Dropdown displays all execution statuses
    //           (Passed, Failed, Retest, Blocked, InProgress, Incomplete, Unexecuted)

    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);

    // ─── Step 5: Select a specific status (Passed) ───────────────────────────────
    // Expected: Grid refreshes and displays only test runs with the selected status

    await executeTabPage.selectStatus('Passed');
    await executeTabPage.verifyAllRowsHaveStatus('Passed');

    // ─── Step 6: Change the selected status to another value (Failed) ─────────────
    // Expected: Grid refreshes and displays only test runs matching the new status

    await executeTabPage.selectStatus('Failed');
    await executeTabPage.verifyAllRowsHaveStatus('Failed');
  });

});
