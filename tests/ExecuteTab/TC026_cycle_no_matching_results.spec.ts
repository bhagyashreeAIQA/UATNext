/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Empty State
 * Test Case ID : TC-026
 * Test Case Name: Validate "No Matching Results Found" Message When No Data Exists for a
 *                 Selected First Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to validate that the system displays the
 *                message "No Matching Results Found" when no test runs match the selected
 *                filters or search criteria, so that I clearly understand when no data is
 *                available for execution.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-001 (workspace auto-fill) then reaches a first-layer cycle
 *                whose grid holds no runs for the user.
 *
 * Steps:
 *   1. Follow TC-001.
 *   2. Navigate to the Execute Test Cases tab.
 *   3. Select a Release + first-layer Cycle combination with no test runs (the default
 *      "Assigned to me" view returns no runs for this user).
 *   4. Validate the test run grid.
 *   5. Enter a search keyword that does not match any test run.
 *
 * Note: Two independent empty-state paths are exercised — the default "Assigned to me"
 *       filter (0 runs for this user) and a validly-formatted non-existent Test Run ID
 *       search (0 matches). Both render "No matching results found".
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Empty State', () => {

  test('TC-026 | Validate "No Matching Results Found" Message When No Data Exists for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Steps 1 & 2 (follows TC-001): login + Execute tab + workspace auto-fill ─
    // loginAndOpenExecuteTab verifies the qTest-synced Workspace value.
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);

    // ─── Step 3: Select a Release + first-layer Cycle with no runs ───────────────
    // Expected: Grid refreshes automatically (default "Assigned to me" → no runs)
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });

    // ─── Step 4: Validate the test run grid ──────────────────────────────────────
    // Expected: Grid displays "No matching results found"
    await executeTabPage.verifyNoResultsMessageVisible();

    // ─── Step 5: Enter a non-matching search keyword ─────────────────────────────
    // Expected: Grid continues displaying "No matching results found"
    await executeTabPage.searchTestRun(EXPECTED.nonMatchingSearchId);
    await executeTabPage.verifyNoResultsMessageVisible();
  });

});
