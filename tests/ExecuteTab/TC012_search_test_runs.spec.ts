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
import { captureScreenshot } from '../../utils/screenshot';

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
    await executeTabPage.switchEnvironment('UATNext Dev'); // pin baseline Environment (see TC-001)
    await executeTabPage.verifyWorkspaceAutoFilled(EXPECTED.workspaceValue);
    await executeTabPage.verifyProjectTextVisible();
    await executeTabPage.verifyProjectAutoFilled(EXPECTED.activeProject);

    // Reach real data: the Environment is already pinned to "UATNext Dev" (above), but its
    // own default sidebar workspace ("CorePlus") has no releases, so select "Testdata_Module"
    // explicitly (same as executeNavHelpers.switchProjectAndLoadReleases — TC-005 already
    // covers exercising the "Project"/Environment dropdown mechanic itself).
    await executeTabPage.selectSidebarProject('Testdata_Module');
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
    await captureScreenshot(page, "Step 1 (follows TC-006): reach a populated grid (View All)");

    // ─── Step 2: Search for an existing Test Case ID and click Search ────────────
    // Expected: Test run list refreshes and shows only rows matching the search criteria

    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);
    await captureScreenshot(page, "Step 2: Search for an existing Test Case ID and click Search");

    // ─── Step 3: Validate grid columns ───────────────────────────────────────────
    // Expected: All columns should display correct data for the searched test runs
    //
    // The grid streams rows over SignalR (row skeleton first, cell text after), so wait for
    // it to settle before reading every row's text — otherwise a still-streaming row can be
    // read with a blank cell.

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.waitForGridSettled();
    await executeTabPage.verifyEachRowHasReadableData();
    await captureScreenshot(page, "Step 3: Validate grid columns");
  });

});
