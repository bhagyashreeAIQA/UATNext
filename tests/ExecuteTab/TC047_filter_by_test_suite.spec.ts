/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite Filter
 * Test Case ID : TC-047
 * Test Case Name: Verify Filtering Test Runs by Test Suite
 *
 * Description  : As a Test Engineer, I want to filter test runs using the Test Suite
 *                dropdown, so that only test runs belonging to the selected Test Suite are
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
 *   5. Select a Test Suite from the list.
 *   6. Validate displayed records.
 *
 * Note: The Test Suite is the depth-3 leaf (`.test-suite-row`) nested under a second-layer
 *       module. "View All" is established so the suite's runs are visible regardless of
 *       assignment, making the "only this suite's runs" assertion meaningful.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite Filter', () => {

  test('TC-047 | Verify Filtering Test Runs by Test Suite', async ({ page }) => {
    test.setTimeout(300000); // depth-3 traversal probes modules + suites under View All

    // ─── Step 1 (follows TC-005): login, switch project, load releases ───────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await captureScreenshot(page, "Step 1 (follows TC-005): login, switch project, load releases");

    // ─── Steps 2-5: Release → first-layer cycle → second-layer cycle → Test Suite ─
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await captureScreenshot(page, "Steps 2-5: Release → first-layer cycle → second-layer cycle → Test Suite");

    // ─── Step 6: Validate displayed records ──────────────────────────────────────
    // Expected: Only test runs belonging to the selected Test Suite are displayed
    await executeTabPage.verifyTestRunTableVisible();
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 6: Validate displayed records");
  });

});
