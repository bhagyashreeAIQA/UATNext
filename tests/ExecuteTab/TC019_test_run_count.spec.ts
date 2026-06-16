/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Count
 * Test Case ID : TC-019
 * Test Case Name: Validate Test Run Count
 *
 * Description  : As a Test Engineer, I want to validate that the test run count displayed
 *                in the grid matches the actual number of test runs after applying filters,
 *                so that I can rely on the data shown.
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
 *   2. Validate pagination controls at the bottom.
 *   3. Note the displayed test run count.
 *
 * Note: The grid renders 10 rows per page, so the visible row count equals the displayed
 *       total when it fits on one page, and equals the page size otherwise. Both the
 *       multi-page (View All) and single-page (a filtered status) cases are checked.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Count', () => {

  test('TC-019 | Validate Test Run Count', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-006): reach a populated grid under View All ──────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });

    // ─── Step 2: Validate pagination controls at the bottom ──────────────────────
    // Expected: Pagination controls should be visible

    await executeTabPage.verifyPaginationControlsVisible();

    // ─── Step 3: Note the displayed test run count ───────────────────────────────
    // Expected: Displayed count should match the number of rows shown in the grid
    //
    // First page of the full set: a full page of rows (capped at the page size).

    await executeTabPage.verifyDisplayedCountMatchesRows();

    // Single-page case: narrow to a status that fits on one page so the displayed total
    // equals the visible row count exactly.
    const { status, count } = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(status);
    if (count <= 10) {
      expect(await executeTabPage.getTestRunCount()).toBe(count);
    }
    await executeTabPage.verifyDisplayedCountMatchesRows();
  });

});
