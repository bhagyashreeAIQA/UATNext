/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Steps
 * Test Case ID : TC-103
 * Test Case Name: Validate Normal Test Steps Are Not Marked as Called Test Cases
 *
 * Description  : As a Test Engineer, I want to validate that normal test steps are not marked as
 *                called test cases.
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
 *   4. Validate normal test steps.
 *   5. Compare normal and called steps.
 *
 * Expected:
 *   1. Test Execution Details page opens.
 *   2. Normal test steps do not display called-test-case indicators.
 *   3. Only called test case steps are marked.
 *
 * Note: a called step renders an icon inside its `.description-with-icon` name cell; normal steps
 *       render only the step text. This run's steps are all normal, so none carry the indicator.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Steps', () => {

  test('TC-103 | Validate Normal Test Steps Are Not Marked as Called Test Cases', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();         // Expected 1
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

    // ─── Step 3: Navigate to Test Logs ───────────────────────────────────────────
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, "Step 3: Navigate to Test Logs");

    // ─── Steps 4-5 / Expected 2-3: normal steps carry no called-test-case indicator ─
    await executionPage.verifyNoStepsMarkedAsCalled();
    expect(await executionPage.getCalledStepIndices()).toEqual([]);
    await captureScreenshot(page, "Steps 4-5 / Expected 2-3: normal steps carry no called-test-case indicator");
  });

});
