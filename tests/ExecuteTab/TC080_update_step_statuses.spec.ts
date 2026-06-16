/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Status
 * Test Case ID : TC-080
 * Test Case Name: Validate Updating a Test Step Status
 *
 * Description  : As a Test Engineer, I want to validate that I can update the status of a test
 *                step, so that I can record execution results correctly.
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
 *   2. Click the Run button for a test run.
 *   3. Navigate to the Test Logs section.
 *   4. Set the Passed status for one test step.
 *   5. Set the Failed status for another test step.
 *   6. Set the Blocked status for another test step.
 *   7. Validate the Step Status column.
 *
 * Note: the documented steps refer to a "Pass/Fail/Blocked status icon", but the live app
 *       exposes the step status as a per-row dropdown (no discrete icons), so each status is
 *       applied via that dropdown. The "all steps Unexecuted" pre-condition is not asserted:
 *       executing a step is irreversible (a step can never return to Unexecuted), so this
 *       test simply sets and validates the three statuses regardless of the starting state.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';

const RUN_ROW_INDEX = 0; // first suite run (reliably has multiple steps)

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Step Status', () => {

  test('TC-080 | Validate Updating a Test Step Status', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // ─── Step 3: Navigate to the Test Logs section ───────────────────────────────
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();

    // ─── Steps 4-6: set Passed / Failed / Blocked on three different steps ────────
    await executionPage.selectStepStatus(0, 'Passed');
    await executionPage.selectStepStatus(1, 'Failed');
    await executionPage.selectStepStatus(2, 'Blocked');

    // ─── Step 7: Validate the Step Status column reflects each update ────────────
    await executionPage.verifyStepStatusValue(0, 'Passed');
    await executionPage.verifyStepStatusValue(1, 'Failed');
    await executionPage.verifyStepStatusValue(2, 'Blocked');
  });

});
