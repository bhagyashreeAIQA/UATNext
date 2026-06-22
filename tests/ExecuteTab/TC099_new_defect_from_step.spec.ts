/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-099
 * Test Case Name: Validate New Button Opens Create Defect Panel from Test Step
 *
 * Description  : As a Test Engineer, I want to verify that clicking the New button from the
 *                test step defect panel opens the Create Defect screen.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has a runnable test run).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Open any Test Run.
 *   3. Navigate to Test Logs.
 *   4. Click the Bug icon for a test step.
 *   5. Validate the New button.
 *   6. Click New → the Create Defect form opens.
 *
 * Note: the step Bug icon opens the same search/link defect panel as the run-level LINK
 *       DEFECT button; its NEW action opens the Create Defect form. No defect is submitted.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-099 | Validate New Button Opens Create Defect Panel from Test Step', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

    // ─── Step 3: Navigate to Test Logs ───────────────────────────────────────────
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, "Step 3: Navigate to Test Logs");

    // ─── Steps 4-5: open the step Bug-icon defect panel and validate NEW ─────────
    await executionPage.openStepDefectPanel(0);
    await executionPage.verifyDefectPanelOpen();
    await executionPage.verifyNewDefectButtonVisible();
    await captureScreenshot(page, "Steps 4-5: open the step Bug-icon defect panel and validate NEW");

    // ─── Step 6: Click New → the Create Defect form opens ────────────────────────
    await executionPage.clickNewDefect();
    await executionPage.verifyCreateDefectFormOpen();
    await captureScreenshot(page, "Step 6: Click New → the Create Defect form opens");
  });

});
