/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Clear Status Filter
 * Test Case ID : TC-056
 * Test Case Name: Validate Clearing the Status Filter Restores Test Run List for a Selected
 *                 Test Suite
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
 * Dependencies : Follows TC-047 (View All so the grid is populated).
 *
 * Steps:
 *   1. Follow TC-047.
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
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Clear Status Filter', () => {

  test('TC-056 | Validate Clearing the Status Filter Restores Test Run List for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1 & 2 (follows TC-047): reach a populated suite grid (View All) ───
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();
    const unfilteredTotal = await executeTabPage.getTotalEntries();

    // ─── Step 3: Apply a Status filter ───────────────────────────────────────────
    const { status } = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(status);

    // ─── Step 4: Clear the Status filter ─────────────────────────────────────────
    await executeTabPage.clearStatusFilter();
    expect(await executeTabPage.getCurrentStatusValue()).toBe('All');

    // ─── Step 5: Validate the test run grid (restored to remaining filters) ──────
    await expect.poll(() => executeTabPage.getTotalEntries(), { timeout: 30000 })
      .toBe(unfilteredTotal);
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
