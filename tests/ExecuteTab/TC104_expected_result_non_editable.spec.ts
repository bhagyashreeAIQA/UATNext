/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Steps
 * Test Case ID : TC-104
 * Test Case Name: Validate Expected Result Field is Non-Editable
 *
 * Description  : As a Test Engineer, I want to verify that the Expected Result field is
 *                non-editable during execution.
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
 *   4. Click inside an Expected Result field.
 *   5. Attempt to type or paste text.
 *   6. Move focus away.
 *
 * Expected:
 *   1. Expected Result field does not become editable.
 *   2. User input is not accepted.
 *   3. Expected Result content remains unchanged.
 *
 * Note: the Expected Result cell is a static `div` (not an input, not contenteditable), so typing
 *       while it is focused cannot change its content — all three expectations are asserted.
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
const STEP_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Steps', () => {

  test('TC-104 | Validate Expected Result Field is Non-Editable', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

    // ─── Step 3: Navigate to Test Logs ───────────────────────────────────────────
    await executionPage.verifyStepsGridVisible();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, "Step 3: Navigate to Test Logs");

    // ─── Steps 4-6 / Expected 1-3: click, attempt to type, blur — content unchanged ─
    const before = await executionPage.getExpectedResultText(STEP_INDEX);
    expect(before).not.toBe('');
    await executionPage.verifyExpectedResultNotEditable(STEP_INDEX);
    await captureScreenshot(page, "Steps 4-6 / Expected 1-3: click, attempt to type, blur — content unchanged");
  });

});
