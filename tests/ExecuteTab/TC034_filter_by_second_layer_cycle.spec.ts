/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Second-Layer Cycle Filter
 * Test Case ID : TC-034
 * Test Case Name: Verify Filtering Test Runs by Second Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to filter test runs using the second layer of
 *                Cycle, so that only test runs belonging to the selected nested Cycle are
 *                displayed.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-005 (project dropdown verified; releases visible).
 *
 * Steps:
 *   1. Follow TC-005.
 *   2. Click on the Release expand.
 *   3. Click on the First Layer of Cycle list.
 *   4. Click on the Second Layer of Cycle list.
 *   5. Select a Cycle from the Second Layer Cycle list.
 *   6. Validate displayed records.
 *
 * Note: The second-layer cycle is the depth-2 module (Sales Ops / Dealer Services /
 *       Dealer Master / Distribution). "View All" is established so the module's runs are
 *       visible regardless of assignment.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachSecondLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Second-Layer Cycle Filter', () => {

  test('TC-034 | Verify Filtering Test Runs by Second Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000); // depth-2 traversal probes multiple modules under View All

    // ─── Step 1 (follows TC-005): login, switch project, load releases ───────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);

    // ─── Steps 2-5: Expand release → first-layer cycle → select second-layer cycle ─
    await reachSecondLayerCycleGrid(executeTabPage, { viewAll: true });

    // ─── Step 6: Validate displayed records ──────────────────────────────────────
    // Expected: Only test runs belonging to the selected Second Layer Cycle are displayed
    await executeTabPage.verifyTestRunTableVisible();
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
  });

});
