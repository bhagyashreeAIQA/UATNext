/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – View All
 * Test Case ID : TC-024
 * Test Case Name: Validate "View All" Radio Button Operation for a Selected First Layer
 *                 of Cycle
 *
 * Description  : As a Test Engineer, I want to validate that the View All radio button
 *                displays all test runs regardless of assignment.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-021 (first-layer cycle selected), reached on its default
 *                "Assigned to me" filter so the default can be asserted first.
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Verify "Assigned to me" is selected.
 *   3. Select the View All radio button.
 *   4. Verify test runs assigned to other users are displayed.
 *   5. Validate grid columns.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – View All', () => {

  test('TC-024 | Validate "View All" Radio Button Operation for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-021): reach the cycle grid (default Assignee intact) ──
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });

    // ─── Step 2: "Assigned to me" is selected by default ─────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeCount = await executeTabPage.getTotalEntries();

    // ─── Step 3: Select the View All radio button ────────────────────────────────
    // Expected: Grid refreshes and displays all test runs
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
