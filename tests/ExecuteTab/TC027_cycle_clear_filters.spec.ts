/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Reset / Clear Filters
 * Test Case ID : TC-027
 * Test Case Name: Verify Reset/Clear Filter Functionality for a Selected First Layer of
 *                 Cycle
 *
 * Description  : As a Test Engineer, I want to verify that the Reset/Clear filter
 *                functionality clears all applied filters and restores the default view,
 *                so that I can quickly return to the initial state of the Execute Test
 *                Cases page.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-021 (View All so the grid is populated and a real search term
 *                can be applied before clearing).
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Select the View All radio button.
 *   3. Enter a keyword in the Search box and click Search.
 *   4. Click the Reset/Clear Filters option.
 *   5. Validate the filter section and grid.
 *   6. Validate the test run grid.
 *
 * Note: The single "CLEAR" control doubles as Reset — it empties the search box, resets
 *       the Assignee radio to "Assigned to me", resets the Status dropdown to "All", and
 *       refreshes the grid to the default view.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Reset / Clear Filters', () => {

  test('TC-027 | Verify Reset/Clear Filter Functionality for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Steps 1 & 2 (follows TC-021): reach a populated grid under View All ─────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 3: Enter a keyword in Search and click Search ──────────────────────
    // Expected: Grid shows only test runs matching the search criteria
    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);

    // ─── Step 4: Click the Reset/Clear Filters option ────────────────────────────
    // Expected: All filters and search values should be cleared
    await executeTabPage.clearFilters();

    // ─── Step 5: Validate the filter section (default restored) ──────────────────
    // Expected: Assigned To Me selected, filters cleared, grid refreshed
    await executeTabPage.verifyDefaultStateRestored();

    // ─── Step 6: Validate the test run grid (default view) ───────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    if (await executeTabPage.getTotalEntries() === 0) {
      await executeTabPage.verifyNoResultsMessageVisible();
    } else {
      await executeTabPage.verifyEachRowHasReadableData();
    }
    expect(await executeTabPage.getSearchValue()).toBe('');
  });

});
