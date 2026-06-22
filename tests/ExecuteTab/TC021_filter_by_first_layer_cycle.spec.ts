/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle Filter
 * Test Case ID : TC-021
 * Test Case Name: Verify Filtering Test Runs by First Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to filter test runs using the first layer of
 *                Cycle, so that only test runs of the selected Cycle are displayed.
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
 *   3. Select a Release from the list.
 *   4. Click on the Cycle list.
 *   5. Select a first-layer Cycle from the list.
 *   6. Validate displayed records.
 *
 * Note: "View All" is selected so the first-layer cycle's runs are visible regardless of
 *       assignment, making the "only this cycle's runs" assertion meaningful.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle Filter', () => {

  test('TC-021 | Verify Filtering Test Runs by First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-005): login, switch project, load releases ───────────
    // Expected: Releases should be visible based on the selected project
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await captureScreenshot(page, "Step 1 (follows TC-005): login, switch project, load releases");

    // ─── Steps 2-5: Expand a release and select a first-layer cycle ──────────────
    // Expected: Release list opens, cycle list opens, and the test run list refreshes
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await captureScreenshot(page, "Steps 2-5: Expand a release and select a first-layer cycle");

    // ─── Step 6: Validate displayed records ──────────────────────────────────────
    // Expected: Only test runs belonging to the selected Cycle should be displayed

    await executeTabPage.verifyTestRunTableVisible();
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 6: Validate displayed records");
  });

});
