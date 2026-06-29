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
 * Steps:
 *   1. Reach a Test Run that contains called test case steps.
 *   2. Open the Test Run.
 *   3. Navigate to Test Logs.
 *   4. Validate called test case steps.
 *   5. View the indicator.
 *
 * Expected:
 *   1. Test Execution Details page opens.
 *   2. Called test case steps display the called-test-case indicator/icon.
 *   3. System clearly differentiates called steps from normal steps.
 *
 * LIVE NOTES (verified 2026-06-26):
 *   Pre-condition 4 IS satisfiable on the deterministic path Testdata_Module → Testdata_Release_P01
 *   → Testdata_Cycle_1 → Dealer Master: the row-0 run (TR-1367) has 7 steps, of which 3 are called
 *   test case steps (indices 3-5) and 4 are normal — a clean differentiation case. The indicator is
 *   an icon in the step's `.description-with-icon` name cell (the same selector TC-103 proves absent
 *   for normal steps), surfaced via `getCalledStepIndices()`. The documented "filter by Passed"
 *   step is unnecessary here — the row-0 run already carries called steps.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Steps', () => {

  test('TC-102 | Validate Called Test Case Steps Are Indicated Correctly', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2: reach a run with called steps and open it ────────────────────────
    // Project: Testdata_Module (sidebar). Path: Testdata_Release_P01 → Testdata_Cycle_1 →
    // Dealer Master (its row-0 run, TR-1367, contains called test case steps). View All so the
    // grid is populated regardless of the logged-in user's assignments.
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await executeTabPage.selectSidebarProject('Testdata_Module');
    await executeTabPage.expandReleaseByName('Testdata_Release_P01');
    await executeTabPage.expandCycleByName('Testdata_Cycle_1');
    await executeTabPage.clickModuleByName('Dealer Master');
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, 'Step 1-2: Dealer Master grid reached');
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    // ─── Steps 2-3 / Expected 1: Test Execution Details opens; Test Logs render ────────
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();         // Expected 1
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, 'Step 2-3: Execution details open with Test Logs loaded');

    // ─── Steps 4-5 / Expected 2-3: at least one step shows the called indicator and
    //     normal steps do not (clear differentiation) ──────────────────────────────
    page.keyboard.press('PageDown');
    const stepCount = await executionPage.getStepRowCount();
    const calledSteps = await executionPage.getCalledStepIndices();
    expect(calledSteps.length, 'at least one called test case step must show the indicator')
      .toBeGreaterThan(0);                               // Expected 2
    expect(calledSteps.length, 'normal steps must remain unmarked (clear differentiation)')
      .toBeLessThan(stepCount);                          // Expected 3
    await captureScreenshot(page, 'Step 4-5: Called-step indicator differentiates called from normal steps');
  });

});
