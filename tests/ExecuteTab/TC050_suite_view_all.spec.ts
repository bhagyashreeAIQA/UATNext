/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – View All
 * Test Case ID : TC-050
 * Test Case Name: Validate "View All" Radio Button Operation for a Selected Test Suite
 *
 * Description  : As a Test Engineer, I want to validate that the View All radio button
 *                displays all test runs, regardless of assignment, so that I can see and
 *                execute every test run in the selected project, release, cycle, and suite.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (Test Suite selected), reached on its "Assigned to me"
 *                default.
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Verify that the "Assigned to me" radio button is selected.
 *   3. Select the View All radio button.
 *   4. Verify that test runs not assigned to the logged-in user are displayed.
 *   5. Validate grid columns.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – View All', () => {

  test('TC-050 | Validate "View All" Radio Button Operation for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach the suite grid on its Assigned-to-me default ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: false });

    // ─── Step 2: "Assigned to me" is selected ────────────────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeCount = await executeTabPage.getTotalEntries();

    // ─── Step 3: Select the View All radio button ────────────────────────────────
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());

    // ─── Step 4: Test runs assigned to other users are displayed ─────────────────
    const viewAllCount = await executeTabPage.getTotalEntries();
    expect(viewAllCount).toBeGreaterThan(assignedToMeCount);
    await executeTabPage.verifyTestRunsLoaded();
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 5: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
