/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Combined Filter
 * Test Case ID : TC-007
 * Test Case Name: Verify combined filtering using Project, Release, Cycle and Suite
 *
 * Description  : As a Test Engineer, I want to validate that test runs can be filtered
 *                using Project (auto-filled from qTest), Release, Cycle and Suite together,
 *                so that only the relevant test runs synced from qTest are displayed for
 *                execution.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : TC-005 pre-conditions must hold (Project dropdown verified and
 *                releases are visible for the selected project).
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Combined Filter', () => {

  test('TC-007 | Verify combined filtering using Project, Release, Cycle and Suite', async ({ page }) => {
    test.setTimeout(360000); // full hierarchy traversal + two suite-search rounds can take ~5 min headless
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

    // ─── Step 2: Click on a release from the list ────────────────────────────
    // Expected: Release should be selected and the test run list should refresh

    await executeTabPage.expandFirstReleaseWithTestCycles();
    await executeTabPage.verifyReleaseExpanded();

    // ─── Step 3: Validate Cycle list is enabled and select a cycle ──────────
    // Expected: Cycle should be selected and the grid should refresh

    await executeTabPage.verifyCycleListIsEnabled();
    await executeTabPage.expandFirstCycleWithSuites();

    // ─── Step 4: Validate Nested cycle list is enabled and select a suite ────
    // Expected: Suite should be selected and the grid should refresh

    await executeTabPage.verifySuiteListIsEnabled();
    // Sales Ops has 0 test runs; iterate to find first suite that has runs under View All.
    await executeTabPage.clickFirstSuiteWithTestRuns();
    await executeTabPage.waitForTestRunsToRefresh();
    await executeTabPage.verifyTestRunTableVisible();

    // ─── Step 5: Validate the test run grid ──────────────────────────────────
    // Expected: Only test runs matching the selected Project + Release + Cycle + Suite
    //           should be displayed

    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 6: Change the selected Release, Cycle and Suite ────────────────
    // Expected: Test run list should update according to the new selection

    const currentReleaseName = await executeTabPage.getActiveReleaseName();
    await executeTabPage.selectDifferentReleaseWithCycles(currentReleaseName);
    await executeTabPage.verifyReleaseExpanded();

    await executeTabPage.verifyCycleListIsEnabled();
    await executeTabPage.expandFirstCycleWithSuites();

    await executeTabPage.verifySuiteListIsEnabled();
    await executeTabPage.clickFirstSuiteWithTestRuns();
    await executeTabPage.waitForTestRunsToRefresh();
    await executeTabPage.verifyTestRunTableVisible();
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
  });

});
