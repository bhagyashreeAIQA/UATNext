/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Actual Result
 * Test Case ID : TC-100
 * Test Case Name: Validate Entering Actual Result for a Test Step
 *
 * Description  : As a Test Engineer, I want to validate that I can enter and save the Actual
 *                Result for a test step.
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
 *   4. Click inside the Actual Result field.
 *   5. Enter valid execution text.
 *   6. Click outside the field.
 *   7. Click Save.
 *   8. Validate the notification.
 *   9. Reopen the Test Run.
 *   10. Validate the Actual Result.
 *
 * Note: the Actual Result cell mounts a TinyMCE rich-text editor; text is typed into its body
 *       and committed on blur. The save toast renders as "Test log updated successfully"
 *       (EXPECTED.saveSuccessMessage); the documented spec writes "Testlog Updated
 *       Successfully.". A unique marker is used so the persisted value is unambiguous.
 *
 * STABILISED (2026-06-15): previously flaky (~60-80%) because the TinyMCE→Blazor commit could
 *       miss the SAVE serialisation — the old commit check fell back to the contenteditable's
 *       textContent (which holds the text even while the bound textarea is still empty), so SAVE
 *       caught nothing. `enterActualResult` now flushes TinyMCE into its textarea (triggerSave +
 *       input/change events) and verifies the BOUND TEXTAREA specifically holds the text before
 *       SAVE; the close→reopen Run click is retried by `reopenTestRun`. Verified 6/6 (3× each on
 *       TC-100/101).
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

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Step Actual Result', () => {

  test('TC-100 | Validate Entering Actual Result for a Test Step', async ({ page }) => {
    test.setTimeout(300000);

    const marker = `Executed OK ${Date.now()}`;

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // ─── Steps 3-6: enter Actual Result text for step 0 and blur ─────────────────
    await executionPage.verifyStepsGridVisible();
    await executionPage.enterActualResult(0, marker);
    await executionPage.verifyActualResultContains(0, marker); // visible before save

    // ─── Steps 7-8: Save and validate the confirmation message ───────────────────
    await executionPage.clickSave();
    await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);

    // ─── Steps 9-10: reopen the run and confirm the Actual Result persisted ──────
    await executionPage.close();
    await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);

    await executionPage.verifyTestRunId(rowRunId);
    await executionPage.verifyActualResultContains(0, marker);
  });

});
