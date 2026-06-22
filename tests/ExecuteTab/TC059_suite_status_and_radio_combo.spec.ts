/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Combined Status + Assignee Filter
 * Test Case ID : TC-059
 * Test Case Name: Validate Combination of Status Dropdown Filter and Radio Button Filter
 *                 Functionality for a Selected Test Suite
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
 * Dependencies : Follows TC-047 (View All so the grid is populated across statuses).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Validate the list of statuses.
 *   5. Select a specific status (e.g., Passed).
 *   6. Change the selected status to another value (e.g., Failed).
 *   7. Verify "Assigned to me" can be selected (status persists).
 *   8. Select View All.
 *   9. Verify test runs assigned to other users are displayed.
 *  10. Validate grid columns.
 *
 * Notes:
 *   - Per-status run counts in the suite are volatile, so instead of hard-coding Passed→
 *     Failed the test picks the first two *distinct non-empty* statuses.
 *   - The Status filter persists across Assignee radio toggles. The logged-in user owns no
 *     runs in this suite, so "Assigned to me" + status yields fewer runs than "View All" +
 *     the same status — proving the two filters combine.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Combined Status + Assignee Filter', () => {

  test('TC-059 | Validate Combination of Status Dropdown Filter and Radio Button Filter Functionality for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1 & 2 (follows TC-047): reach a populated suite grid (View All) ───
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Steps 1 & 2 (follows TC-047): reach a populated suite grid (View All)");

    // ─── Steps 3 & 4: Open Status dropdown and validate the available statuses ────
    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);
    await captureScreenshot(page, "Steps 3 & 4: Open Status dropdown and validate the available statuses");

    // ─── Step 5: Select a specific status (first non-empty) ──────────────────────
    const first = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(first.status);
    await captureScreenshot(page, "Step 5: Select a specific status (first non-empty)");

    // ─── Step 6: Change to another (distinct non-empty) status ───────────────────
    const remaining = EXPECTED.statusOptions.filter(s => s !== first.status);
    const second = await executeTabPage.selectFirstNonEmptyStatus(remaining);
    expect(second.status).not.toBe(first.status);
    await executeTabPage.verifyAllRowsHaveStatus(second.status);
    const viewAllStatusTotal = await executeTabPage.getTotalEntries();
    await captureScreenshot(page, "Step 6: Change to another (distinct non-empty) status");

    // ─── Step 7: Switch to "Assigned to me" (status persists) ────────────────────
    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getCurrentStatusValue()).toBe(second.status);
    const assignedStatusTotal = await executeTabPage.getTotalEntries();
    expect(assignedStatusTotal).toBeLessThanOrEqual(viewAllStatusTotal);
    await captureScreenshot(page, "Step 7: Switch to \"Assigned to me\" (status persists)");

    // ─── Step 8: Switch back to View All (status still applied) ───────────────────
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getCurrentStatusValue()).toBe(second.status);
    expect(await executeTabPage.getTotalEntries()).toBe(viewAllStatusTotal);
    await captureScreenshot(page, "Step 8: Switch back to View All (status still applied)");

    // ─── Step 9: Test runs not assigned to the user are displayed ─────────────────
    expect(viewAllStatusTotal).toBeGreaterThan(assignedStatusTotal);
    await executeTabPage.verifyAllRowsHaveStatus(second.status);
    await captureScreenshot(page, "Step 9: Test runs not assigned to the user are displayed");

    // ─── Step 10: Validate grid columns ──────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
    await captureScreenshot(page, "Step 10: Validate grid columns");
  });

});
