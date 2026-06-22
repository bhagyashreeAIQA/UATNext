/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Save
 * Test Case ID : TC-092
 * Test Case Name: Validate "Testlog Updated Successfully." Message After Saving Test Run
 *
 * Description  : As a Test Engineer, I want to validate that the system displays the
 *                confirmation message after saving updates in a test run.
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
 *   2. Open any test run.
 *   3. Update an editable field (here: the test-run-level Status).
 *   4. Click Save.
 *   5. Validate the system message.
 *   6. Reopen the test run.
 *   7. Validate saved changes.
 *
 * Note: the documented message is "Testlog Updated Successfully." — the live app renders it as
 *       "Test log updated successfully" (EXPECTED.saveSuccessMessage), matched
 *       case-insensitively. The toast is transient, so it is asserted immediately after Save.
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

  test('TC-092 | Validate "Testlog Updated Successfully." Message After Saving Test Run', async ({ page }) => {
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
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

    // ─── Step 3: update an editable field (run-level Status) ─────────────────────
    const current = await executionPage.getStatusValue();
    const newStatus = await executionPage.selectDifferentStatus(current, EXPECTED.executionStatusOptions);
    await captureScreenshot(page, "Step 3: update an editable field (run-level Status)");

    // ─── Steps 4-5: Save and validate the confirmation message ───────────────────
    await executionPage.clickSave();
    await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);
    await captureScreenshot(page, "Steps 4-5: Save and validate the confirmation message");

    // ─── Steps 6-7: reopen the run and confirm the change persisted ──────────────
    await executionPage.close();
    await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);

    await executionPage.verifyTestRunId(rowRunId);
    await executionPage.verifyStatusValuePersisted(newStatus);
    await captureScreenshot(page, "Steps 6-7: reopen the run and confirm the change persisted");
  });

});
