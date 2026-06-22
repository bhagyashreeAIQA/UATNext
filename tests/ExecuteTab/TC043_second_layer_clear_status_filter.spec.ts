/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Second-Layer Cycle – Clear Status Filter
 * Test Case ID : TC-043
 * Test Case Name: Validate Clearing the Status Filter Restores Test Run List for a
 *                 Selected Second Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to validate that clearing the Status filter
 *                restores the test run grid based on other applied filters, so that I can
 *                easily return to viewing all relevant test runs.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-034 (View All so the grid is populated).
 *
 * Steps:
 *   1. Follow TC-034.
 *   2. Select the View All radio button.
 *   3. Apply a Status filter.
 *   4. Clear the Status filter.
 *   5. Validate the test run grid.
 *
 * Note: The Status dropdown is cleared by selecting its "All" option, which removes the
 *       status constraint and restores the grid to the remaining filters (View All).
 *       A first-non-empty status is applied so the "rows match the status" step is
 *       meaningful regardless of which statuses currently hold data.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachSecondLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Second-Layer Cycle – Clear Status Filter', () => {

  test('TC-043 | Validate Clearing the Status Filter Restores Test Run List for a Selected Second Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000);

    // ─── Steps 1 & 2 (follows TC-034): reach a populated grid under View All ─────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachSecondLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();
    const unfilteredTotal = await executeTabPage.getTotalEntries();
    await captureScreenshot(page, "Steps 1 & 2 (follows TC-034): reach a populated grid under View All");

    // ─── Step 3: Apply a Status filter ───────────────────────────────────────────
    const { status } = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(status);
    await captureScreenshot(page, "Step 3: Apply a Status filter");

    // ─── Step 4: Clear the Status filter ─────────────────────────────────────────
    await executeTabPage.clearStatusFilter();
    expect(await executeTabPage.getCurrentStatusValue()).toBe('All');
    await captureScreenshot(page, "Step 4: Clear the Status filter");

    // ─── Step 5: Validate the test run grid (restored to remaining filters) ──────
    await expect.poll(() => executeTabPage.getTotalEntries(), { timeout: 30000 })
      .toBe(unfilteredTotal);
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
    await captureScreenshot(page, "Step 5: Validate the test run grid (restored to remaining filters)");
  });

});
