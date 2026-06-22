/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Status
 * Test Case ID : TC-081
 * Test Case Name: Validate Persistence of Test Step Status After Save
 *
 * Description  : As a Test Engineer, I want to validate that updated test step statuses are
 *                saved and retained, so that execution progress is not lost.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-080 (three step statuses updated in the open run).
 *
 * Steps:
 *   1. Follow TC-080.
 *   2. Click the Save button.
 *   3. Reopen the same test run.
 *   4. Validate the previously updated step statuses.
 *
 * Note: persistence is verified by reopening the run (the reopened panel re-fetches the saved
 *       step statuses from qTest). Reopening right after a close can drop the first Run click
 *       during the grid re-render, so it is retried.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
  reopenTestRun,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Step Status', () => {

  test('TC-081 | Validate Persistence of Test Step Status After Save', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-080): open the run and update three step statuses ────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyStepsLoaded();

    await executionPage.selectStepStatus(0, 'Passed');
    await executionPage.selectStepStatus(1, 'Failed');
    await executionPage.selectStepStatus(2, 'Blocked');
    await captureScreenshot(page, "Step 1 (follows TC-080): open the run and update three step statuses");

    // ─── Step 2: Save ─────────────────────────────────────────────────────────────
    await executionPage.save();
    await captureScreenshot(page, "Step 2: Save");

    // ─── Step 3: reopen the same test run ────────────────────────────────────────
    await executionPage.close();
    await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);
    await executionPage.verifyTestRunId(rowRunId);
    await captureScreenshot(page, "Step 3: reopen the same test run");

    // ─── Step 4: validate the previously updated step statuses persisted ─────────
    await executionPage.verifyStepStatusPersisted(0, 'Passed');
    await executionPage.verifyStepStatusPersisted(1, 'Failed');
    await executionPage.verifyStepStatusPersisted(2, 'Blocked');
    await captureScreenshot(page, "Step 4: validate the previously updated step statuses persisted");
  });

});
