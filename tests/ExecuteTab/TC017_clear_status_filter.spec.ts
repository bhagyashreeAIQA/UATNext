/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Status Filter – Clear
 * Test Case ID : TC-017
 * Test Case Name: Validate Clearing the Status Filter Restores Test Run List for a
 *                 Selected Release
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
 * Dependencies : Follows TC-006 (View All so the grid is populated).
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Select the View All radio button.
 *   3. Apply a Status filter.
 *   4. Clear the Status filter.
 *   5. Validate the test run grid.
 *
 * Note: The Status dropdown is cleared by selecting its "All" option, which removes the
 *       status constraint and restores the grid to the remaining filters (View All).
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Status Filter – Clear', () => {

  test('TC-017 | Validate Clearing the Status Filter Restores Test Run List for a Selected Release', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 & 2 (follows TC-006): reach a populated grid under View All ──────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    const unfilteredTotal = await executeTabPage.getTotalEntries();

    // ─── Step 3: Apply a Status filter ───────────────────────────────────────────
    // Expected: Grid refreshes and shows only test runs with the selected status

    const { status } = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(status);

    // ─── Step 4: Clear the Status filter ─────────────────────────────────────────
    // Expected: Status filter should be removed

    await executeTabPage.clearStatusFilter();
    expect(await executeTabPage.getCurrentStatusValue()).toBe('All');

    // ─── Step 5: Validate the test run grid ──────────────────────────────────────
    // Expected: Grid refreshes and displays test runs based on the remaining filters
    //
    // The status value clears instantly, but the grid re-queries over SignalR; poll until
    // the total returns to the pre-filter (View All) count.

    await expect.poll(() => executeTabPage.getTotalEntries(), { timeout: 30000 })
      .toBe(unfilteredTotal);
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
