/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Status Filter – Empty State
 * Test Case ID : TC-016
 * Test Case Name: Validate Selecting a Status with No Test Runs for a Selected Release
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
 * Dependencies : Follows TC-006 (View All so the grid is populated before filtering).
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Select the View All radio button.
 *   3. Click on the Status dropdown.
 *   4. Select a status that has no test runs.
 *   5. Validate the test run grid.
 *
 * Note: Which statuses are empty changes as data evolves, so the test iterates the offered
 *       statuses and selects the first one with zero runs rather than hard-coding one.
 */

import { test } from '@playwright/test';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Status Filter – Empty State', () => {

  test('TC-016 | Validate Selecting a Status with No Test Runs for a Selected Release', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 & 2 (follows TC-006): reach a populated grid under View All ──────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);

    // Select the "Testdata_Module" project from the sidebar Projects dropdown. Switching the
    // header to "UATNext Dev" (done above) exposes two sidebar projects — "SET Dealer CRM"
    // (the default) and "Testdata_Module"; pick the latter and wait for its release tree.
    await executeTabPage.openWorkspaceDropdown();
    await executeTabPage.selectWorkspaceOption('Testdata_Module');
    await executeTabPage.waitForReleasesLoad();

    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 1 & 2 (follows TC-006): reach a populated grid under View All");

    // ─── Steps 3 & 4: Open the Status dropdown and select a status with no runs ───
    // Expected: Status dropdown shows the available statuses; the grid refreshes

    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);
    await executeTabPage.selectFirstEmptyStatus(EXPECTED.statusOptions);
    await captureScreenshot(page, "Steps 3 & 4: Open the Status dropdown and select a status with no runs");

    // ─── Step 5: Validate the test run grid ──────────────────────────────────────
    // Expected: Grid should display "No matching results found"

    await executeTabPage.verifyNoResultsMessageVisible();
    await captureScreenshot(page, "Step 5: Validate the test run grid");
  });

});
