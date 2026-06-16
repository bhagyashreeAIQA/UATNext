/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Assignee Filter
 * Test Case ID : TC-048
 * Test Case Name: Validate "Assigned To Me and View All" Radio Button Operation for a
 *                 Selected Test Suite
 *
 * Description  : As a Test Engineer, I want to validate the behavior of the Assigned To Me
 *                and View All radio buttons on the Execute Test Cases page, so that I can
 *                filter test runs either assigned to me or all test runs correctly.
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
 *   2. Verify "Assigned to me" is selected by default.
 *   3. Click the View All radio button.
 *   4. Re-select the "Assigned to me" radio button.
 *   5. Verify dynamic grid refresh.
 *   6. Validate grid columns.
 *
 * Note: The user has no runs in this suite, so the data-independent dynamic-refresh proof is
 *       that the pagination total changes on each radio toggle.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Assignee Filter', () => {

  test('TC-048 | Validate "Assigned To Me and View All" Radio Button Operation for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach the suite grid on its Assigned-to-me default ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: false });

    // ─── Step 2: "Assigned to me" is selected by default ─────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeTotal = await executeTabPage.getTotalEntriesText();

    // ─── Step 3: Click the View All radio button ─────────────────────────────────
    await executeTabPage.selectViewAllAndWaitForRefresh(assignedToMeTotal);
    const viewAllTotal = await executeTabPage.getTotalEntriesText();
    expect(viewAllTotal).not.toBe(assignedToMeTotal);
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 4: Re-select the "Assigned to me" radio button ─────────────────────
    await executeTabPage.selectAssignedToMeAndWaitForRefresh(viewAllTotal);

    // ─── Step 5: Dynamic refresh without page reload ─────────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    expect(await executeTabPage.getTotalEntriesText()).toBe(assignedToMeTotal);

    // ─── Step 6: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
  });

});
