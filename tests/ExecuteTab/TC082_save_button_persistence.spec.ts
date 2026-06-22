/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Save
 * Test Case ID : TC-082
 * Test Case Name: Validate Save Button Functionality in Test Execution Details
 *
 * Description  : As a Test Engineer, I want to validate that the Save button stores all
 *                updates made in the test run, so that any execution progress or changes are
 *                not lost.
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
 *   2. Open any test run using the Run button.
 *   3. Update an editable field (here: a test step status).
 *   4. Click the Save button.
 *   5. Navigate back and reopen the same test run.
 *   6. Validate the previously updated values.
 *
 * Note: a step status is used as the editable field; the save success toast is asserted as
 *       the "success indication", and persistence is confirmed by reopening the run.
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

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Save', () => {

  test('TC-082 | Validate Save Button Functionality in Test Execution Details', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

    // ─── Step 3: update an editable field (step 0 status) ────────────────────────
    const current = await executionPage.getStepStatusValue(0);
    const newStatus = await executionPage.selectDifferentStepStatus(0, current, EXPECTED.executionStatusOptions);
    await executionPage.verifyStepStatusValue(0, newStatus); // reflected on screen before save
    await captureScreenshot(page, "Step 3: update an editable field (step 0 status)");

    // ─── Step 4: Save → success indication ───────────────────────────────────────
    await executionPage.clickSave();
    await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);
    await captureScreenshot(page, "Step 4: Save → success indication");

    // ─── Steps 5-6: reopen the run and confirm the change persisted ──────────────
    await executionPage.close();
    await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);

    await executionPage.verifyTestRunId(rowRunId);
    await executionPage.verifyStepStatusPersisted(0, newStatus);
    await captureScreenshot(page, "Steps 5-6: reopen the run and confirm the change persisted");
  });

});
