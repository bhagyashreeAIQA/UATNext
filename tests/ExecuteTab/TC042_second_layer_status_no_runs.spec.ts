/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Second-Layer Cycle – Status Filter Empty State
 * Test Case ID : TC-042
 * Test Case Name: Validate Selecting a Status with No Test Runs for a Selected Second Layer
 *                 of Cycle
 *
 * Description  : As a Test Engineer, I want to validate that when I select a Status value
 *                that has no associated test runs, the system displays the correct no-data
 *                message, so that I clearly understand that no matching records exist.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-034 (second-layer cycle reached under View All so the grid is
 *                populated before filtering).
 *
 * Steps:
 *   1. Follow TC-034.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Select a status that has no test runs.
 *   5. Validate the test run grid.
 *
 * Note: Which statuses are empty in the second-layer module changes as data evolves
 *       (Retest/Incomplete are frequently empty), so the test iterates the offered statuses
 *       and selects the first one with zero runs rather than hard-coding one.
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachSecondLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Second-Layer Cycle – Status Filter Empty State', () => {

  test('TC-042 | Validate Selecting a Status with No Test Runs for a Selected Second Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000); // depth-2 traversal + iterating statuses to find an empty one

    // ─── Steps 1 & 2 (follows TC-034): reach a populated grid under View All ─────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachSecondLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyViewAllIsDefaultSelected();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Steps 3 & 4: Open the Status dropdown and select a status with no runs ───
    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);
    await executeTabPage.selectFirstEmptyStatus(EXPECTED.statusOptions);

    // ─── Step 5: Validate the test run grid ──────────────────────────────────────
    // Expected: Grid should display "No Matching Results Found"
    await executeTabPage.verifyNoResultsMessageVisible();
  });

});
