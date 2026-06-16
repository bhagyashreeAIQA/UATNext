/**
 * Shared navigation helpers for the Execute Test Cases specs (TC-016 onward).
 *
 * These wrap the repeated TC-005 / TC-006 lead-in (login → open Execute tab → switch to
 * the project that exposes releases → reach the first-layer cycle grid) so the individual
 * test cases stay focused on what they are actually validating.
 */

import { Page } from '@playwright/test';
import { LoginPage }      from '../../pages/LoginPage';
import { HomePage }       from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';

export interface ExecuteContext {
  loginPage: LoginPage;
  homePage: HomePage;
  executeTabPage: ExecuteTabPage;
}

/**
 * Logs in (when no cached auth state applies), opens the Execute Test Cases tab and
 * verifies the qTest-synced Workspace + Project auto-fill (the TC-001/TC-004 baseline).
 */
export async function loginAndOpenExecuteTab(page: Page): Promise<ExecuteContext> {
  const loginPage      = new LoginPage(page);
  const homePage       = new HomePage(page);
  const executeTabPage = new ExecuteTabPage(page);

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

  return { loginPage, homePage, executeTabPage };
}

/**
 * Switches from the default project to the one that exposes releases (per TC-005), then
 * waits for the release tree to finish streaming in.
 */
export async function switchProjectAndLoadReleases(executeTabPage: ExecuteTabPage): Promise<void> {
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
}

/**
 * Expands the first release that has test cycles and selects its first-layer cycle.
 *
 * When `viewAll` is true, "View All" is established robustly *after* the cycle's grid
 * loads (a late Blazor re-render from the cycle click can otherwise reset the Assignee
 * radio), so the grid is populated regardless of the logged-in user's assignments. When
 * false, the grid is left on its "Assigned to me" default so the default state can be
 * asserted.
 */
export async function reachFirstLayerCycleGrid(
  executeTabPage: ExecuteTabPage,
  options: { viewAll: boolean },
): Promise<void> {
  await executeTabPage.expandFirstReleaseWithTestCycles();
  await executeTabPage.verifyReleaseExpanded();
  await executeTabPage.verifyTestCyclesVisible();

  await executeTabPage.clickFirstTestCycle();
  await executeTabPage.waitForGridContainerReady();

  if (options.viewAll) {
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
  }
}

/**
 * Expands the first release + first-layer cycle, then selects a second-layer cycle
 * (the depth-2 "module": Sales Ops / Dealer Services / Dealer Master / Distribution) that
 * has test runs.
 *
 * Finding a module with data requires probing View All (the logged-in user has none under
 * "Assigned to me"), so `clickFirstSuiteWithTestRuns` leaves the grid on View All. When
 * `viewAll` is false the grid is then switched back to the module's natural "Assigned to
 * me" default — which correctly shows 0 of the user's runs versus the View All population.
 */
export async function reachSecondLayerCycleGrid(
  executeTabPage: ExecuteTabPage,
  options: { viewAll: boolean },
): Promise<void> {
  await executeTabPage.expandFirstReleaseWithTestCycles();
  await executeTabPage.verifyReleaseExpanded();
  await executeTabPage.expandFirstCycleWithSuites();
  await executeTabPage.verifySuiteListIsEnabled();
  await executeTabPage.clickFirstSuiteWithTestRuns(); // ends on View All with runs > 0

  if (!options.viewAll) {
    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
  }
}

/**
 * Expands the first release + first-layer cycle, expands a second-layer cycle (module), then
 * selects a depth-3 Test Suite (the `.test-suite-row` leaf under a module) that has test runs.
 *
 * As with the second-layer modules, the logged-in user has no runs in these suites, so
 * `clickFirstTestSuiteWithTestRuns` probes them under View All and leaves the grid there.
 * When `viewAll` is false the grid is then switched back to the suite's natural "Assigned to
 * me" default — which correctly shows 0 of the user's runs versus the View All population.
 */
export async function reachTestSuiteGrid(
  executeTabPage: ExecuteTabPage,
  options: { viewAll: boolean },
): Promise<void> {
  await executeTabPage.expandFirstReleaseWithTestCycles();
  await executeTabPage.verifyReleaseExpanded();
  await executeTabPage.expandFirstCycleWithSuites();
  await executeTabPage.verifySuiteListIsEnabled();
  await executeTabPage.clickFirstTestSuiteWithTestRuns(); // ends on View All with runs > 0

  if (!options.viewAll) {
    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
  }
}

/**
 * Reopens a test run's execution panel after it was closed back to the grid.
 *
 * The close→reopen sequence is racy: the first Run click can be dropped during the grid's
 * re-render, and the panel takes a moment to mount. This gives each Run click a full wait
 * window for the breadcrumb to appear before retrying, which is far more reliable than
 * re-clicking on a tight interval. Used by the persistence checks (TC-070/081/082/092…).
 */
export async function reopenTestRun(
  executeTabPage: ExecuteTabPage,
  executionPage: TestRunExecutionPage,
  rowIndex: number,
): Promise<void> {
  await executeTabPage.waitForTestRunsToRefresh();
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await executionPage.isOpen()) return;
    await executeTabPage.clickRunButton(rowIndex);
    const opened = await executionPage.breadcrumb
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    if (opened) return;
  }
  throw new Error('Failed to reopen the test run execution panel after multiple attempts');
}
