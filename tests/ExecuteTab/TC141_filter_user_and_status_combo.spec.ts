/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-141
 * Test Case Name: Verify Combination of Assigned User Filter and Status Filter
 *
 * Description  : As a Test Engineer, I want to combine user filtering and status filtering to
 *                narrow down test run results.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release with test runs is selected.
 *   3. A user is selected using Assigned To / Business User filter.
 *
 * Dependencies : Follows TC-138 (a user with runs is filtered in).
 *
 * Steps:
 *   1. Follow TC-138.
 *   2. Click the Status dropdown.
 *   3. Select a status (one the filtered user actually has).
 *   4. Validate the test run grid.
 *   5. Change the status value.
 *   6. Validate grid columns.
 *
 * Expected:
 *   1. Status dropdown displays all execution statuses.
 *   2. Grid refreshes automatically.
 *   3. Only records matching BOTH filters (user + status) are displayed.
 *   4. Grid columns display correct data.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  test('TC-141 | Verify Combination of Assigned User Filter and Status Filter', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 1 (TC-138): filter by a real user who has runs ─────────────────────
    const assignee = (await executeTabPage.getAssignedToDisplay(0)).trim();
    await executeTabPage.selectAssignedToBusinessUser();
    const chosen = await executeTabPage.selectUserAndWaitForRefresh(assignee.split(/\s+/)[0], assignee);
    await executeTabPage.verifyAllRowsMatchUser(chosen);

    // ─── Steps 2-3 / Expected 1-2: status dropdown lists statuses; pick one ──────
    await executeTabPage.openStatusDropdown();
    await executeTabPage.verifyStatusOptions(EXPECTED.statusOptions);  // Expected 1
    const { status } = await executeTabPage.selectFirstNonEmptyStatus(EXPECTED.statusOptions); // Expected 2

    // ─── Steps 4-6 / Expected 3-4: rows match BOTH user and status; columns ok ───
    await executeTabPage.verifyAllRowsMatchUser(chosen);
    await executeTabPage.verifyAllRowsHaveStatus(status);
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
  });

});
