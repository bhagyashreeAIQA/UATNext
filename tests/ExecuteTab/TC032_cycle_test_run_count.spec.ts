/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Test Run Count
 * Test Case ID : TC-032
 * Test Case Name: Validate Test Run Count for the First Layer of Cycle
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
 * Dependencies : Follows TC-021 (View All so the grid is populated).
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Validate pagination controls at the bottom.
 *   3. Note the displayed test run count.
 *
 * Note: The grid renders 10 rows per page, so the visible row count equals the displayed
 *       total when it fits on one page, and equals the page size otherwise.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Test Run Count', () => {

  test('TC-032 | Validate Test Run Count for the First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-021): reach a populated grid under View All ──────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });

    // ─── Step 2: Validate pagination controls at the bottom ──────────────────────
    await executeTabPage.verifyPaginationControlsVisible();

    // ─── Step 3: Displayed count matches the rows shown ──────────────────────────
    await executeTabPage.verifyDisplayedCountMatchesRows();

    // Single-page case: narrow to a status that fits one page so total == visible rows.
    const { status, count } = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(status);
    if (count <= 10) {
      expect(await executeTabPage.getTestRunCount()).toBe(count);
    }
    await executeTabPage.verifyDisplayedCountMatchesRows();
  });

});
