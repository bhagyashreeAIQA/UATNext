/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Status Dropdown Filter
 * Test Case ID : TC-028
 * Test Case Name: Validate Status Dropdown Filter Functionality for a Selected First Layer
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
 * Dependencies : Follows TC-021 (View All so the grid is populated across statuses).
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Validate the list of available statuses.
 *   5. Select a specific status (Passed).
 *   6. Change the selected status to another value (Failed).
 *   7. Validate the displayed test runs.
 *
 * Note: The live dropdown renders "InProgress" without a space; EXPECTED.statusOptions
 *       holds the actual option strings.
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Status Dropdown Filter', () => {

  test('TC-028 | Validate Status Dropdown Filter Functionality for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Steps 1 & 2 (follows TC-021): reach a populated grid under View All ─────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Steps 1 & 2 (follows TC-021): reach a populated grid under View All");

    // ─── Steps 3 & 4: Open the Status dropdown and validate the statuses ─────────
    // Expected: Dropdown displays all execution statuses
    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);
    await captureScreenshot(page, "Steps 3 & 4: Open the Status dropdown and validate the statuses");

    // ─── Step 5: Select a specific status (Passed) ───────────────────────────────
    // Expected: Grid shows only test runs with the selected status
    await executeTabPage.selectStatus('Passed');
    await executeTabPage.verifyAllRowsHaveStatus('Passed');
    await captureScreenshot(page, "Step 5: Select a specific status (Passed)");

    // ─── Steps 6 & 7: Change the status (Failed) and validate displayed runs ──────
    // Expected: Grid shows only runs matching the new status (this cycle + Failed)
    await executeTabPage.selectStatus('Failed');
    await executeTabPage.verifyAllRowsHaveStatus('Failed');
    await executeTabPage.verifyEachRowHasReadableData();
    await captureScreenshot(page, "Steps 6 & 7: Change the status (Failed) and validate displayed runs");
  });

});
