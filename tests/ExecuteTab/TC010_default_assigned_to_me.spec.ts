/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Default Assignee Filter
 * Test Case ID : TC-010
 * Test Case Name: Verify default filter is set to Assigned To Me for a selected Release
 *
 * Description  : As a Test Engineer, I want to validate that the Assigned To Me radio
 *                button displays only the test runs assigned to the logged-in user, so
 *                that I can filter test runs correctly for execution.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 navigation. Unlike TC-006, "View All" is NOT pre-selected,
 *                so the default Assignee state is asserted directly.
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Validate the default filter selection.
 *   3. Check that the "Assigned to me" radio button is selected.
 *   4. Verify that no test runs not assigned to the user are displayed.
 *   5. Refresh the page while "Assigned to me" is selected.
 *   6. Validate grid columns.
 *
 * Note: In this dataset the logged-in user has no test runs assigned within the release,
 *       so "Assigned to me" yields an empty grid ("No matching results found") while
 *       "View All" yields many. Exclusion of unassigned runs is therefore proven by
 *       comparing the two totals. A hard reload keeps the project/workspace selection but
 *       clears the expanded release/cycle, so the cycle is re-selected after refreshing.
 */

import { test, expect } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Default Assignee Filter', () => {

  test('TC-010 | Verify default filter is set to Assigned To Me for a selected Release', async ({ page }) => {
    test.setTimeout(240000); // includes a reload + a second cycle selection
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

    // ─── Steps 2 & 3: Default filter is "Assigned to me" ─────────────────────────
    // Expected: Assigned To Me should be selected by default

    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeCount = await executeTabPage.getTotalEntries();
    await captureScreenshot(page, "Steps 2 & 3: Default filter is \"Assigned to me\"");

    // ─── Step 4: No test runs that are NOT assigned to the user are displayed ─────
    // Expected: Grid shows only the user's runs and excludes everyone else's. Here the
    //           user has none, so the grid is empty; switching to View All reveals the
    //           larger population, proving the unassigned runs were excluded.

    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    const viewAllCount = await executeTabPage.getTotalEntries();
    expect(viewAllCount).toBeGreaterThan(assignedToMeCount);

    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getTotalEntries()).toBe(assignedToMeCount);
    if (assignedToMeCount === 0) {
      await executeTabPage.verifyNoResultsMessageVisible();
    }
    await captureScreenshot(page, "Step 4: No test runs that are NOT assigned to the user are displayed");

    // ─── Step 5: Refresh the page while "Assigned to me" is selected ─────────────
    // Expected: Grid continues displaying only test runs assigned to the logged-in user
    //
    // The reload clears the expanded release/cycle (project selection persists), so the
    // cycle is re-selected; the Assignee default must remain "Assigned to me".

    await executeTabPage.reloadPage();
    await executeTabPage.waitForReleasesLoad();
    await executeTabPage.expandFirstReleaseWithTestCycles();
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForGridContainerReady();

    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    expect(await executeTabPage.getTotalEntries()).toBe(assignedToMeCount);
    await captureScreenshot(page, "Step 5: Refresh the page while \"Assigned to me\" is selected");

    // ─── Step 6: Validate grid columns ───────────────────────────────────────────
    // Expected: All columns should display correctly for the filtered test runs

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await captureScreenshot(page, "Step 6: Validate grid columns");
  });

});
