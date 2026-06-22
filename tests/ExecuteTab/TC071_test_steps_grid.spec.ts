/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details
 * Test Case ID : TC-071
 * Test Case Name: Validate Test Steps Grid Is Displayed Correctly
 *
 * Description  : As a Test Engineer, I want to validate that all test steps are displayed
 *                correctly in the Test Logs section, so that I can execute each step
 *                accurately.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-068 (the execution details panel is open for a known run).
 *
 * Steps:
 *   1. Follow TC-068.
 *   2. Open any test run using the Run button.
 *   3. Navigate to the Test Logs section.
 *   4. Validate column headers.
 *   5. Validate test step data.
 *
 * Note: the documented columns are Step No, UAT Category, Test Step, Expected Result, Actual
 *       Result and Status. The live grid labels "Step No" as "Step Number" and "Test Step" as
 *       "Description" (see EXPECTED.executionStepColumns); each step row carries a step number
 *       and a UAT Category (Business / Technical).
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

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details', () => {

  test('TC-071 | Validate Test Steps Grid Is Displayed Correctly', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-068): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(0);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, "Steps 1-2 (follows TC-068): reach the grid and open a run");

    // ─── Step 3: Navigate to / locate the Test Logs (test-steps) section ─────────
    await executionPage.verifyStepsGridVisible();
    await captureScreenshot(page, "Step 3: Navigate to / locate the Test Logs (test-steps) section");

    // ─── Step 4: Validate column headers ─────────────────────────────────────────
    await executionPage.verifyStepColumns(EXPECTED.executionStepColumns);
    await captureScreenshot(page, "Step 4: Validate column headers");

    // ─── Step 5: Validate test step data ─────────────────────────────────────────
    await executionPage.verifyStepsLoaded();
    await executionPage.verifyEachStepHasData();
    await captureScreenshot(page, "Step 5: Validate test step data");
  });

});
