/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Second-Layer Cycle – Status Dropdown Filter
 * Test Case ID : TC-041
 * Test Case Name: Validate Status Dropdown Filter Functionality for a Selected Second Layer
 *                 of Cycle
 *
 * Description  : As a Test Engineer, I want to validate that the Status dropdown filters
 *                test runs correctly based on execution status, so that I can quickly
 *                identify test runs by their current state.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-034 (second-layer cycle reached under View All so the grid is
 *                populated across statuses).
 *
 * Steps:
 *   1. Follow TC-034.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Validate the list of available statuses.
 *   5. Select a specific status (e.g., Passed).
 *   6. Change the selected status to another value (e.g., Failed).
 *
 * Notes:
 *   - The live dropdown renders "InProgress" without a space; EXPECTED.statusOptions holds
 *     the actual option strings (Passed, Failed, Retest, Blocked, InProgress, Incomplete,
 *     Unexecuted).
 *   - Per-status run counts in the second-layer module are volatile (e.g. Retest/Incomplete
 *     are frequently empty). Rather than hard-coding Passed→Failed, the test picks the first
 *     two *distinct non-empty* statuses so the "grid shows only matching runs" assertion
 *     stays meaningful regardless of which statuses currently hold data.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachSecondLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Second-Layer Cycle – Status Dropdown Filter', () => {

  test('TC-041 | Validate Status Dropdown Filter Functionality for a Selected Second Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000); // depth-2 traversal + iterating statuses to find populated ones

    // ─── Steps 1 & 2 (follows TC-034): reach a populated second-layer grid (View All) ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachSecondLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Steps 3 & 4: Open the Status dropdown and validate the statuses ─────────────
    // Expected: Dropdown displays all execution statuses (Passed, Failed, Retest, Blocked,
    //           InProgress, Incomplete, Unexecuted).
    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);

    // ─── Step 5: Select a specific status ────────────────────────────────────────────
    // Expected: Grid refreshes and shows only test runs with the selected status.
    const first = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(first.status);

    // ─── Step 6: Change to another status and validate the refreshed grid ────────────
    // Expected: Grid refreshes and shows only runs matching the newly selected status.
    const remaining = EXPECTED.statusOptions.filter(s => s !== first.status);
    const second = await executeTabPage.selectFirstNonEmptyStatus(remaining);
    expect(second.status).not.toBe(first.status);
    await executeTabPage.verifyAllRowsHaveStatus(second.status);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
