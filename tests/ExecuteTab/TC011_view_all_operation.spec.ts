/**
 * Feature      : Execute Test Case
 * Sub-Feature  : View All Filter
 * Test Case ID : TC-011
 * Test Case Name: Validate "View All" radio button operation for a selected Release
 *
 * Description  : As a Test Engineer, I want to validate that the View All radio button
 *                displays all test runs, regardless of assignment, so that I can see and
 *                execute every test run in the selected project, release, cycle and suite.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 navigation; "View All" is NOT pre-selected so the
 *                "Assigned to me" default can be asserted first.
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Check that the "Assigned to me" radio button is selected.
 *   3. Select the "View All" radio button.
 *   4. Verify that test runs not assigned to the logged-in user are displayed.
 *   5. Validate grid columns.
 *
 * Note: The logged-in user has no test runs assigned in this release, so "Assigned to me"
 *       shows 0 entries. Switching to "View All" surfaces a larger set — every visible
 *       row is therefore a run "not assigned to me", which proves View All includes
 *       other users' runs.
 */

import { test, expect } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: View All Filter', () => {

  test('TC-011 | Validate "View All" radio button operation for a selected Release', async ({ page }) => {
    test.setTimeout(180000);
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-006): reach the cycle grid (default Assignee intact) ──

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

    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForGridContainerReady();
    await captureScreenshot(page, "Step 1 (follows TC-006): reach the cycle grid (default Assignee intact)");

    // ─── Step 2: "Assigned to me" is selected by default ─────────────────────────
    // Expected: Test run list refreshes showing only the user's runs

    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeCount = await executeTabPage.getTotalEntries();
    await captureScreenshot(page, "Step 2: \"Assigned to me\" is selected by default");

    // ─── Step 3: Select the "View All" radio button ──────────────────────────────
    // Expected: Grid refreshes and displays all test runs, including other users'

    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await captureScreenshot(page, "Step 3: Select the \"View All\" radio button");

    // ─── Step 4: Test runs not assigned to the logged-in user are displayed ───────
    // Expected: Grid includes every test run from the selected filters

    const viewAllCount = await executeTabPage.getTotalEntries();
    expect(viewAllCount).toBeGreaterThan(assignedToMeCount);
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 4: Test runs not assigned to the logged-in user are displayed");

    // ─── Step 5: Validate grid columns ───────────────────────────────────────────
    // Expected: All columns should display correct data for the filtered test runs

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
    await captureScreenshot(page, "Step 5: Validate grid columns");
  });

});
