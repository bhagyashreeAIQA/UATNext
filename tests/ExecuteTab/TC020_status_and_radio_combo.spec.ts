/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Combined Status + Assignee Filter
 * Test Case ID : TC-020
 * Test Case Name: Validate Combination of Status Dropdown Filter and Radio Button Filter
 *                 Functionality for a Selected Release
 *
 * Description  : As a Test Engineer, I want to validate that the Status dropdown and radio
 *                button filters work together correctly, so that I can identify test runs
 *                based on both assignment and execution status.
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
 *   3. Click on the Status dropdown.
 *   4. Validate the list of statuses.
 *   5. Select a specific status (Passed).
 *   6. Change the selected status to another value (Failed).
 *   7. Switch to the "Assigned to me" radio button (status filter persists).
 *   8. Switch back to the View All radio button.
 *   9. Verify that test runs not assigned to the logged-in user are displayed.
 *  10. Validate grid columns.
 *
 * Note: The Status filter persists across Assignee radio toggles, so "Assigned to me" +
 *       Failed narrows the set to the user's Failed runs (none here) while View All +
 *       Failed shows everyone's — proving the two filters combine.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Combined Status + Assignee Filter', () => {

  test('TC-020 | Validate Combination of Status Dropdown Filter and Radio Button Filter Functionality for a Selected Release', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Steps 1 & 2 (follows TC-006): reach a populated grid under View All ─────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Steps 3 & 4: Open Status dropdown and validate the available statuses ────
    // Expected: Dropdown displays all execution statuses

    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);

    // ─── Step 5: Select a specific status (Passed) ───────────────────────────────
    // Expected: Grid shows only test runs with the selected status

    await executeTabPage.selectStatus('Passed');
    await executeTabPage.verifyAllRowsHaveStatus('Passed');

    // ─── Step 6: Change the selected status (Failed) ─────────────────────────────
    // Expected: Grid shows only test runs matching the newly selected status

    await executeTabPage.selectStatus('Failed');
    await executeTabPage.verifyAllRowsHaveStatus('Failed');
    const viewAllStatusTotal = await executeTabPage.getTotalEntries();

    // ─── Step 7: Switch to "Assigned to me" (Failed status persists) ─────────────
    // Expected: Grid shows only the user's test runs with the selected status

    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getCurrentStatusValue()).toBe('Failed'); // status persisted
    const assignedStatusTotal = await executeTabPage.getTotalEntries();
    expect(assignedStatusTotal).toBeLessThanOrEqual(viewAllStatusTotal);

    // ─── Step 8: Switch back to View All (Failed status still applied) ────────────
    // Expected: Grid shows all test runs matching the selected status

    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getCurrentStatusValue()).toBe('Failed');
    expect(await executeTabPage.getTotalEntries()).toBe(viewAllStatusTotal);

    // ─── Step 9: Test runs not assigned to the user are displayed ─────────────────
    // Expected: Grid includes test runs assigned to other users

    expect(viewAllStatusTotal).toBeGreaterThan(assignedStatusTotal);
    await executeTabPage.verifyAllRowsHaveStatus('Failed');

    // ─── Step 10: Validate grid columns ──────────────────────────────────────────
    // Expected: All columns should display correct data for the filtered test runs

    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
