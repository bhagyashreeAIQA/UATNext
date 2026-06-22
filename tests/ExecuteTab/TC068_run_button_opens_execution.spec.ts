/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details
 * Test Case ID : TC-068
 * Test Case Name: Verify Run Button Functionality to Open Test Run Execution Details
 *
 * Description  : As a Test Engineer, I want to verify that clicking the Run button for a test
 *                run opens the Test Run Execution Details screen, so that I can start executing
 *                test steps.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has test-run rows to run).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Locate any test run row.
 *   3. Click the Run button.
 *   4. Validate the Test Run Details section.
 *
 * Note: the Run (▶) button lives in the Action column and opens the execution details panel
 *       in place (the URL does not change). The Test Run ID shown in the panel breadcrumb is
 *       asserted against the row's Test Run ID to confirm the correct run was opened.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details', () => {

  test('TC-068 | Verify Run Button Functionality to Open Test Run Execution Details', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach a populated suite grid (View All) ────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 1 (follows TC-047): reach a populated suite grid (View All)");

    // ─── Step 2: Locate a test run row + capture its Test Run ID ─────────────────
    await executeTabPage.verifyRunButtonVisible(0);
    const rowRunId = await executeTabPage.getRowTestRunId(0);
    await captureScreenshot(page, "Step 2: Locate a test run row + capture its Test Run ID");

    // ─── Step 3: Click the Run button → execution details opens ──────────────────
    await executeTabPage.clickRunButton(0);
    await captureScreenshot(page, "Step 3: Click the Run button → execution details opens");

    // ─── Step 4: Validate the Test Run Details section ───────────────────────────
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // Correct test run information should be displayed (breadcrumb TR id matches the row).
    await executionPage.verifyTestRunId(rowRunId);
    await executionPage.verifyTestCaseNameNotEmpty();
    await captureScreenshot(page, "Step 4: Validate the Test Run Details section");
  });

});
