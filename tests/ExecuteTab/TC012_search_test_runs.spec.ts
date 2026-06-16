/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Search Test Runs
 * Test Case ID : TC-012
 * Test Case Name: Verify Search and Filter Test Runs Functionality for a Selected Release
 *
 * Description  : As a Test Engineer, I want to verify that the search box and filters
 *                correctly display test runs matching the criteria, so that I can quickly
 *                locate and execute relevant test runs.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 (View All so the grid is populated and an existing
 *                Test Case ID can be read from it to search for).
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Enter a Test Run ID / Test Case ID in the Search box and click Search.
 *   3. Validate grid columns.
 *
 * Note: The grid's search only acts on recognised TR-/TC- identifiers, so the search term
 *       is taken from an existing row rather than hard-coded, keeping the test
 *       data-independent.
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Search Test Runs', () => {

  test('TC-012 | Verify Search and Filter Test Runs Functionality for a Selected Release', async ({ page }) => {
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

    // Reach the cycle grid, then establish "View All" robustly (a late Blazor re-render
    // from the cycle click can reset the Assignee radio, so this retries until it sticks).
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForGridContainerReady();
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 2: Search for an existing Test Case ID and click Search ────────────
    // Expected: Test run list refreshes and shows only rows matching the search criteria

    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);

    // ─── Step 3: Validate grid columns ───────────────────────────────────────────
    // Expected: All columns should display correct data for the searched test runs

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
