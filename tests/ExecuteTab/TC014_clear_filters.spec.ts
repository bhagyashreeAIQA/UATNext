/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Reset / Clear Filters
 * Test Case ID : TC-014
 * Test Case Name: Verify Reset/Clear Filter Functionality for a Selected Release
 *
 * Description  : As a Test Engineer, I want to verify that the Reset/Clear filter
 *                functionality clears all applied filters and restores the default view,
 *                so that I can quickly return to the initial state of the Execute Test
 *                Cases page.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 (View All so the grid is populated and a real search term
 *                can be applied before clearing).
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Select the View All radio button.
 *   3. Enter a keyword in the Search box and click Search.
 *   4. Click the Reset/Clear Filters option.
 *   5. Validate the filter section and grid.
 *   6. Validate the test run grid.
 *
 * Note: The Execute panel exposes a single "CLEAR" control that doubles as Reset — it
 *       empties the search box, resets the Assignee radio to "Assigned to me", resets the
 *       Status dropdown to "All", and refreshes the grid to the default view.
 */

import { test, expect } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Reset / Clear Filters', () => {

  test('TC-014 | Verify Reset/Clear Filter Functionality for a Selected Release', async ({ page }) => {
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
    await executeTabPage.verifyViewAllIsDefaultSelected(); // View All is checked
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 3: Enter a keyword in Search and click Search ──────────────────────
    // Expected: Grid refreshes and displays only test runs matching the search criteria

    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);

    // ─── Step 4: Click the Reset/Clear Filters option ────────────────────────────
    // Expected: All filters and search values should be cleared

    await executeTabPage.clearFilters();

    // ─── Step 5: Validate the filter section and grid (default restored) ──────────
    // Expected: Assigned To Me selected, filters cleared, grid refreshed

    await executeTabPage.verifyDefaultStateRestored();

    // ─── Step 6: Validate the test run grid (default view) ───────────────────────
    // Expected: Grid should display test runs based on the default view

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    // The default "Assigned to me" view returns no runs for this user → empty-state message.
    if (await executeTabPage.getTotalEntries() === 0) {
      await executeTabPage.verifyNoResultsMessageVisible();
    } else {
      await executeTabPage.verifyEachRowHasReadableData();
    }
    expect(await executeTabPage.getSearchValue()).toBe('');
  });

});
