/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter (Assigned To Me / View All)
 * Test Case ID : TC-009
 * Test Case Name: Validate "Assigned To Me and View All" radio button operation for a
 *                 selected Release
 *
 * Description  : As a Test Engineer, I want to validate the behavior of the Assigned To
 *                Me and View All radio buttons on the Execute Test Cases page, so that I
 *                can filter test runs either assigned to me or all test runs correctly.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 navigation (filter test runs by Release) to reach the
 *                grid. Unlike TC-006, "View All" is NOT pre-selected, so the default
 *                Assignee state can be asserted first.
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Check the "Assigned to me" radio button is selected by default.
 *   3. Click the "View All" radio button.
 *   4. Re-select the "Assigned to me" radio button.
 *   5. Verify that changing the selection updates the grid dynamically.
 *   6. Validate grid columns.
 *
 * Note: In this dataset the logged-in user has no test runs assigned within the selected
 *       release, so "Assigned to me" yields 0 entries while "View All" yields many. The
 *       dynamic-refresh check therefore asserts that the pagination total CHANGES on each
 *       toggle (without a page reload), which is the reliable, data-independent signal.
 */

import { test, expect } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter', () => {

  test('TC-009 | Validate "Assigned To Me and View All" radio button operation for a selected Release', async ({ page }) => {
    test.setTimeout(180000); // releases take 6-20s in headless; full loop ~2 min
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-006): Login, navigate, switch project, select a release ──
    // Expected: Only test runs of the selected release should appear

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

    // Reach the grid WITHOUT selecting "View All" so the default Assignee state is intact.
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForGridContainerReady();
    await captureScreenshot(page, "Step 1 (follows TC-006): Login, navigate, switch project, select a release");

    // ─── Step 2: "Assigned to me" is selected by default ─────────────────────────
    // Expected: Grid should display only test runs assigned to the logged-in user

    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeTotal = await executeTabPage.getTotalEntriesText();
    await captureScreenshot(page, "Step 2: \"Assigned to me\" is selected by default");

    // ─── Step 3: Click the "View All" radio button ───────────────────────────────
    // Expected: Grid should refresh and display all test runs (incl. unassigned ones)

    await executeTabPage.selectViewAllAndWaitForRefresh(assignedToMeTotal);
    const viewAllTotal = await executeTabPage.getTotalEntriesText();
    // View All exposes more runs than "Assigned to me" for this release.
    expect(viewAllTotal).not.toBe(assignedToMeTotal);
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 3: Click the \"View All\" radio button");

    // ─── Step 4: Re-select the "Assigned to me" radio button ─────────────────────
    // Expected: Grid should refresh and display only the user's test runs again

    await executeTabPage.selectAssignedToMeAndWaitForRefresh(viewAllTotal);
    const assignedToMeTotalAgain = await executeTabPage.getTotalEntriesText();
    await captureScreenshot(page, "Step 4: Re-select the \"Assigned to me\" radio button");

    // ─── Step 5: Selection updates the grid dynamically (no page reload) ──────────
    // Expected: Grid refreshes immediately after each radio selection; the
    //           "Assigned to me" view is consistent before and after the toggle.

    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    expect(assignedToMeTotalAgain).toBe(assignedToMeTotal);
    await captureScreenshot(page, "Step 5: Selection updates the grid dynamically (no page reload)");

    // ─── Step 6: Validate grid columns ───────────────────────────────────────────
    // Expected: All columns should display correctly for the filtered test runs

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await captureScreenshot(page, "Step 6: Validate grid columns");
  });

});
