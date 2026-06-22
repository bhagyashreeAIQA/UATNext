/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Actual Result
 * Test Case ID : TC-101
 * Test Case Name: Validate Persistence of Actual Result for a Test Step
 *
 * Description  : As a Test Engineer, I want to validate that the Actual Result entered for a test
 *                step is retained after saving and reopening the Test Run.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-100 (enter + save an Actual Result for a test step).
 *
 * Steps:
 *   1. Follow TC-100.
 *   2. Refresh or reopen the Test Run.
 *   3. Navigate to Test Logs.
 *   4. Validate the Actual Result field.
 *
 * Expected:
 *   1. Test Execution Details page opens.
 *   2. Previously entered Actual Result is displayed.
 *   3. Saved data persists correctly.
 *
 * STABILISED (2026-06-15): shares TC-100's fix — `enterActualResult` now flushes TinyMCE into its
 *       bound textarea (triggerSave + input/change) and verifies the textarea value before SAVE,
 *       and `reopenTestRun` retries the close→reopen Run click. Previously ~60-80%; verified 6/6
 *       (3× each on TC-100/101).
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
  reopenTestRun,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const STEP_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Step Actual Result', () => {

  test('TC-101 | Validate Persistence of Actual Result for a Test Step', async ({ page }) => {
    test.setTimeout(300000);

    const marker = `Persisted ${Date.now()}`;

    // ─── Step 1 (follows TC-100): enter + save an Actual Result ──────────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyStepsGridVisible();
    await executionPage.enterActualResult(STEP_INDEX, marker);
    await executionPage.clickSave();
    await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);
    await captureScreenshot(page, "Step 1 (follows TC-100): enter + save an Actual Result");

    // ─── Steps 2-3: reopen the Test Run and go to Test Logs ──────────────────────
    await executionPage.close();
    await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);
    await executionPage.verifyTestRunId(rowRunId);        // Expected 1
    await executionPage.verifyStepsGridVisible();
    await captureScreenshot(page, "Steps 2-3: reopen the Test Run and go to Test Logs");

    // ─── Step 4 / Expected 2-3: the saved Actual Result persisted ────────────────
    await executionPage.verifyActualResultContains(STEP_INDEX, marker);
    await captureScreenshot(page, "Step 4 / Expected 2-3: the saved Actual Result persisted");
  });

});
