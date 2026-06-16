/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Assignee Filter
 * Test Case ID : TC-022
 * Test Case Name: Validate "Assigned To Me and View All" Radio Button Operation for a
 *                 Selected First Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to validate the behavior of the Assigned To Me
 *                and View All radio buttons so that I can filter test runs either assigned
 *                to me or all test runs correctly.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-021 (first-layer cycle selected). The grid is reached on its
 *                "Assigned to me" default so that default can be asserted first.
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Verify "Assigned to me" is selected by default.
 *   3. Click the View All radio button.
 *   4. Re-select the "Assigned to me" radio button.
 *   5. Verify dynamic grid refresh.
 *   6. Validate grid columns.
 *
 * Note: The logged-in user has no runs in this cycle, so the data-independent
 *       dynamic-refresh proof is that the pagination total changes on each radio toggle.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Assignee Filter', () => {

  test('TC-022 | Validate "Assigned To Me and View All" Radio Button Operation for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-021): reach the cycle grid (default Assignee intact) ──
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });

    // ─── Step 2: "Assigned to me" is selected by default ─────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeTotal = await executeTabPage.getTotalEntriesText();

    // ─── Step 3: Click the View All radio button ─────────────────────────────────
    // Expected: Grid displays all test runs, including those assigned to other users
    await executeTabPage.selectViewAllAndWaitForRefresh(assignedToMeTotal);
    const viewAllTotal = await executeTabPage.getTotalEntriesText();
    expect(viewAllTotal).not.toBe(assignedToMeTotal);
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 4: Re-select the "Assigned to me" radio button ─────────────────────
    // Expected: Grid again displays only the user's test runs
    await executeTabPage.selectAssignedToMeAndWaitForRefresh(viewAllTotal);

    // ─── Step 5: Dynamic refresh without page reload ─────────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    expect(await executeTabPage.getTotalEntriesText()).toBe(assignedToMeTotal);

    // ─── Step 6: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
  });

});
