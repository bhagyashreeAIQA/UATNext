/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Release Filter
 * Test Case ID : TC-006
 * Test Name    : Verify filtering test runs by Release
 *
 * Description  : As a Test Engineer, I want to filter test runs using the Release,
 *                so that only relevant test runs are displayed.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : TC-005 pre-conditions must hold (Project dropdown verified and
 *                releases are visible for the selected project).
 *
 * Note: The default "Assigned to me" filter hides test runs not assigned to the
 *       current user. "View All" is selected in Step 3 so the release-based
 *       filtering assertion is meaningful regardless of assignee assignment.
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Release Filter', () => {

  test('TC-006 | Verify filtering test runs by Release', async ({ page }) => {
    test.setTimeout(180000); // releases take 6-20s in headless; full loop ~2 min
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Step 1 (follows TC-005): Login, navigate, verify workspace + project ──
    // Expected: Releases should be visible based on the selected project

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

    // Follow TC-005: open dropdown → verify options → select a different project
    // Capture the current workspace before switching so we can detect when Blazor
    // has finished loading the new project's sidebar data.
    const workspaceBeforeSwitch = await executeTabPage.getWorkspaceValue();

    await executeTabPage.openProjectDropdown();
    await executeTabPage.verifyProjectDropdownOpen();
    await executeTabPage.verifyProjectDropdownHasAtLeastOneOption();
    await executeTabPage.verifyProjectDropdownContains([EXPECTED.activeProject]);

    const currentProject  = await executeTabPage.getProjectValue();
    const selectedProject = await executeTabPage.selectDifferentProject(currentProject);
    await executeTabPage.verifyProjectDropdownClosed();
    await executeTabPage.verifyProjectUpdatedTo(selectedProject);

    // Wait for the sidebar workspace to reflect the new project before loading releases.
    // Without this, waitForReleasesLoad picks up the old project's stale releases.
    await executeTabPage.waitForProjectSwitchComplete(workspaceBeforeSwitch);
    await executeTabPage.waitForReleasesLoad();
    await executeTabPage.verifyReleasesVisible();
    await executeTabPage.verifyAtLeastOneRelease();
    await captureScreenshot(page, "Step 1 (follows TC-005): Login, navigate, verify workspace + project");

    // ─── Step 2: Click on the Release expand ─────────────────────────────────
    // Expected: Release list should open (test cycles become visible)
    //
    // Iterates from the last release to the first to find one that contains
    // test cycles (P01 for "UATNext Dev" has Testdata_Cycle_1 with test data).

    await executeTabPage.expandFirstReleaseWithTestCycles();
    await executeTabPage.verifyReleaseExpanded();
    await executeTabPage.verifyTestCyclesVisible();
    await captureScreenshot(page, "Step 2: Click on the Release expand");

    // ─── Step 3: Select a release from list ───────────────────────────────────
    // Expected: Test run list should refresh
    //
    // Switch to "View All" so test runs are visible regardless of assignee, then
    // select the first test cycle from the expanded release.

    await executeTabPage.selectViewAll();
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForTestRunsToRefresh();
    await executeTabPage.verifyTestRunTableVisible();
    await captureScreenshot(page, "Step 3: Select a release from list");

    // ─── Step 4: Validate displayed test runs ─────────────────────────────────
    // Expected: Only test runs of selected release should appear

    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 4: Validate displayed test runs");
  });

});
