/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Second-Layer Cycle – Assignee Filter
 * Test Case ID : TC-035
 * Test Case Name: Validate "Assigned To Me and View All" Radio Button Operation for a
 *                 Selected Second Layer of Cycle
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
 * Dependencies : Follows TC-034 (second-layer cycle selected), reached on its
 *                "Assigned to me" default.
 *
 * Steps:
 *   1. Follow TC-034.
 *   2. Verify "Assigned to me" is selected by default.
 *   3. Click the View All radio button.
 *   4. Re-select the "Assigned to me" radio button.
 *   5. Verify dynamic grid refresh.
 *   6. Validate grid columns.
 *
 * Note: The user has no runs in this module, so the data-independent dynamic-refresh proof
 *       is that the pagination total changes on each radio toggle.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import { stepScreenshot } from '../../utils/screenshot';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachSecondLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Second-Layer Cycle – Assignee Filter', () => {

  test('TC-035 | Validate "Assigned To Me and View All" Radio Button Operation for a Selected Second Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000);

    // ─── Step 1 (follows TC-034): reach the module grid on its Assigned-to-me default ─
    const executeTabPage = await stepScreenshot(page, 'Step 1: Reach second-layer cycle grid (Assigned-to-me default)', async () => {
      const { executeTabPage } = await loginAndOpenExecuteTab(page);
      await switchProjectAndLoadReleases(executeTabPage);
      await reachSecondLayerCycleGrid(executeTabPage, { viewAll: false });
      return executeTabPage;
    });

    // ─── Step 2: "Assigned to me" is selected by default ─────────────────────────
    const assignedToMeTotal = await stepScreenshot(page, 'Step 2: "Assigned to me" selected by default', async () => {
      await executeTabPage.verifyAssignedToMeSelectedByDefault();
      return executeTabPage.getTotalEntriesText();
    });

    // ─── Step 3: Click the View All radio button ─────────────────────────────────
    const viewAllTotal = await stepScreenshot(page, 'Step 3: Click the View All radio button', async () => {
      await executeTabPage.selectViewAllAndWaitForRefresh(assignedToMeTotal);
      const viewAllTotal = await executeTabPage.getTotalEntriesText();
      expect(viewAllTotal).not.toBe(assignedToMeTotal);
      await executeTabPage.verifyTotalEntriesPositive();
      return viewAllTotal;
    });

    // ─── Step 4: Re-select the "Assigned to me" radio button ─────────────────────
    await stepScreenshot(page, 'Step 4: Re-select the "Assigned to me" radio button', async () => {
      await executeTabPage.selectAssignedToMeAndWaitForRefresh(viewAllTotal);
    });

    // ─── Step 5: Dynamic refresh without page reload ─────────────────────────────
    await stepScreenshot(page, 'Step 5: Dynamic refresh without page reload', async () => {
      await executeTabPage.verifyAssignedToMeSelectedByDefault();
      expect(await executeTabPage.getTotalEntriesText()).toBe(assignedToMeTotal);
    });

    // ─── Step 6: Validate grid columns ───────────────────────────────────────────
    await stepScreenshot(page, 'Step 6: Validate grid columns', async () => {
      await executeTabPage.verifyGridPresent();
      await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    });
  });

});
