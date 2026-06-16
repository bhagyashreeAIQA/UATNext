/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Search
 * Test Case ID : TC-025
 * Test Case Name: Verify Search and Filter Test Runs Functionality for a Selected First
 *                 Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to verify that the search and filter
 *                functionality correctly displays matching test runs.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-021 (View All so the grid is populated and an existing
 *                Test Case ID can be read from it to search for).
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Enter a Test Run ID or Test Case ID and click Search.
 *   3. Validate grid columns.
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Search', () => {

  test('TC-025 | Verify Search and Filter Test Runs Functionality for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-021): reach a populated grid under View All ──────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 2: Search for an existing Test Case ID and click Search ────────────
    // Expected: Grid displays only test runs matching the search criteria
    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);

    // ─── Step 3: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
