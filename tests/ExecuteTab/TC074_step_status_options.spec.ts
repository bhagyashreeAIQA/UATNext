/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Status
 * Test Case ID : TC-074
 * Test Case Name: Validate Test Step Status Options Are Displayed
 *
 * Description  : As a Test Engineer, I want to validate that each test step displays execution
 *                status options, so that I can mark the result of every step.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-068 (the execution details panel is open with a steps grid).
 *
 * Steps:
 *   1. Follow TC-068.
 *   2. Open any test run using the Run button.
 *   3. Navigate to the Test Logs section.
 *   4. Validate the Status column for a test step.
 *   5. Validate multiple test steps.
 *   6. Validate the default state of step status.
 *
 * Note: each step's Status dropdown offers the documented values (the live app renders
 *       "InProgress" without a space — see EXPECTED.executionStatusOptions) and additionally
 *       offers "Unexecuted". Steps default to the "Unexecuted" state. Executing a step is
 *       irreversible (the dropdown stops offering "Unexecuted" once a real status is set), so
 *       this test uses a run row that the mutating tests do NOT touch — TC-075 executes a step
 *       on row 1, so this validates the default-Unexecuted state on row 2 (a clean run).
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

// The default-Unexecuted state can only be validated on a run with no executed steps. Runs get
// executed as the data evolves (a fixed row is no longer reliably clean — verified 2026-07-01: the
// suite's page-1 rows are all Failed/Blocked/InProgress/Passed/Incomplete), so the test filters the
// grid to Status = Unexecuted and opens one of those clean runs (row 0) rather than a fixed index.
const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Step Status', () => {

  test('TC-074 | Validate Test Step Status Options Are Displayed', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-068): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await executeTabPage.selectSidebarProject('Testdata_Module');
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // Filter to Status = Unexecuted so the opened run is guaranteed clean (all steps default state).
    let hasCleanRun = true;
    try {
      await executeTabPage.openStatusDropdown();
      await executeTabPage.selectFirstNonEmptyStatus(['Unexecuted']);
    } catch {
      hasCleanRun = false;
    }
    test.skip(!hasCleanRun, 'No Unexecuted (clean) run in this suite to validate the default step state.');

    // Dismiss the status dropdown overlay so it does not intercept the Run-button click, and let the
    // filtered grid settle before opening a run.
    await page.keyboard.press('Escape').catch(() => undefined);
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, "Steps 1-2 (follows TC-068): reach the grid and open a run");

    // ─── Step 3: Navigate to / locate the Test Logs (steps) grid ─────────────────
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, "Step 3: Navigate to / locate the Test Logs (steps) grid");

    // ─── Steps 4-5: validate the Status options for multiple steps ───────────────
    const stepCount = await executionPage.getStepRowCount();
    const sample = Math.min(stepCount, 3); // validate up to the first three steps
    for (let i = 0; i < sample; i++) {
      await executionPage.verifyStepStatusOptions(i, EXPECTED.executionStatusOptions);
    }
    await captureScreenshot(page, "Steps 4-5: validate the Status options for multiple steps");

    // ─── Step 6: validate the default state — all steps Unexecuted ───────────────
    await executionPage.verifyAllStepsUnexecuted();
    await captureScreenshot(page, "Step 6: validate the default state — all steps Unexecuted");
  });

});
