/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Steps
 * Test Case ID : TC-102
 * Test Case Name: Validate Called Test Case Steps Are Indicated Correctly
 *
 * Description  : As a Test Engineer, I want to validate that steps coming from called test cases
 *                are visually indicated.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *   4. Test Run contains called test case steps.
 *
 * Dependencies : Follows TC-047 (View All so the grid has a runnable test run).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Open any Test Run.
 *   3. Navigate to Test Logs.
 *   4. Validate called test case steps.
 *   5. View the indicator.
 *
 * Expected:
 *   1. Test Execution Details page opens.
 *   2. Called test case steps display the called-test-case indicator/icon.
 *   3. System clearly differentiates called steps from normal steps.
 *
 * BLOCKED (test.fixme): pre-condition 4 is unmet in the reachable data — the runs probed under
 *       the first test suite (grid rows 0-2) contain only normal steps (row 0 has 3 normal steps,
 *       rows 1-2 have 0 steps), so there is no called-test-case step to assert against. The body
 *       asserts the indicator (an icon in the step's `.description-with-icon` name cell, the same
 *       selector TC-103 proves absent for normal steps); enable it against a Test Run that
 *       actually contains called test case steps.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Steps', () => {

  // BLOCKED: no reachable Test Run contains called test case steps (pre-condition 4 unmet).
  test.fixme('TC-102 | Validate Called Test Case Steps Are Indicated Correctly', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();         // Expected 1
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();

    // ─── Steps 4-5 / Expected 2-3: at least one step shows the called indicator and
    //     normal steps do not (clear differentiation) ──────────────────────────────
    const calledSteps = await executionPage.getCalledStepIndices();
    expect(calledSteps.length).toBeGreaterThan(0);       // Expected 2
    expect(calledSteps.length).toBeLessThan(await executionPage.getStepRowCount()); // Expected 3
  });

});
