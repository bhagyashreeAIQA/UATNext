/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Status Dropdown Filter
 * Test Case ID : TC-054
 * Test Case Name: Validate Status Dropdown Filter Functionality for a Selected Test Suite
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
 * Dependencies : Follows TC-047 (Test Suite reached under View All so the grid is populated
 *                across statuses).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Validate the list of available statuses.
 *   5. Select a specific status (e.g., Passed).
 *   6. Change the selected status to another value (e.g., Failed).
 *
 * Notes:
 *   - The live dropdown renders "InProgress" without a space; EXPECTED.statusOptions holds
 *     the actual option strings.
 *   - Per-status run counts in the suite are volatile, so the test picks the first two
 *     *distinct non-empty* statuses rather than hard-coding Passed→Failed.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Status Dropdown Filter', () => {

  test('TC-054 | Validate Status Dropdown Filter Functionality for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1 & 2 (follows TC-047): reach a populated suite grid (View All) ───
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Steps 3 & 4: Open the Status dropdown and validate the statuses ─────────
    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);

    // ─── Step 5: Select a specific status (first non-empty) ──────────────────────
    const first = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions);
    await executeTabPage.verifyAllRowsHaveStatus(first.status);

    // ─── Step 6: Change to another status and validate the refreshed grid ────────
    const remaining = EXPECTED.statusOptions.filter(s => s !== first.status);
    const second = await executeTabPage.selectFirstNonEmptyStatus(remaining);
    expect(second.status).not.toBe(first.status);
    await executeTabPage.verifyAllRowsHaveStatus(second.status);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
