/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Grid UI
 * Test Case ID : TC-008
 * Test Case Name: Verify test run grid UI and column rendering for a selected Release
 *
 * Description  : As a Test Engineer, I want to validate that the test run grid is
 *                displayed correctly with all required columns and data, so that test
 *                runs can be clearly viewed and managed.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 (filter test runs by Release) to reach a populated grid.
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Validate the presence of the filter section (Project, Assigned To Me, Status).
 *   3. Validate the presence of the test run grid.
 *   4. Validate the grid headers.
 *   5. Validate data under each column.
 *
 * Note: "View All" is selected (per TC-006) so the grid is populated with the release's
 *       test runs, making the column-data validation in Step 5 meaningful.
 */

import { test } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Grid UI', () => {

  test('TC-008 | Verify test run grid UI and column rendering for a selected Release', async ({ page }) => {
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

    await executeTabPage.selectViewAll();
    await executeTabPage.clickFirstTestCycle();
    await executeTabPage.waitForTestRunsToRefresh();
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 2: Validate the presence of the filter section ─────────────────────
    // Expected: All filters should be visible and properly aligned
    //           (Project selector, Assigned To Me / View All radios, Status dropdown)

    await executeTabPage.verifyFilterSectionVisible();

    // ─── Step 3: Validate the presence of the test run grid ──────────────────────
    // Expected: Test run grid should be displayed below the filters

    await executeTabPage.verifyGridPresent();

    // ─── Step 4: Validate the grid headers ───────────────────────────────────────
    // Expected: Grid should display the expected columns (Test Run ID, Test Case ID,
    //           Name, Assigned To, Status, Execution Date, Planned Start Date,
    //           Planned End Date, Action)

    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);

    // ─── Step 5: Validate data under each column ─────────────────────────────────
    // Expected: Each row should display correct, readable data without UI overlap

    await executeTabPage.verifyEachRowHasReadableData();
  });

});
