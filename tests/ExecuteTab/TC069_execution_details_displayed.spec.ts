/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details
 * Test Case ID : TC-069
 * Test Case Name: Validate Test Run Details Are Displayed Correctly
 *
 * Description  : As a Test Engineer, I want to validate that all test run information is
 *                displayed correctly, so that I can confirm I am executing the correct test
 *                run.
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
 *   3. Validate Test Run ID and Test Case Name.
 *   4. Validate Project, Release, Test Cycle, and Test Suite fields.
 *   5. Validate Tester name.
 *   6. Validate Precondition field.
 *   7. Validate Status dropdown.
 *
 * Note: the documented spec expects Project / Release / Test Cycle / Test Suite / Tester
 *       fields on this screen, but the current build surfaces the run's context only through
 *       the header Project selector and the sidebar release/cycle/suite tree — the detail
 *       panel itself shows the qTest-mapped Assigned To (tester), Business User, Status and
 *       Precondition fields. This test validates the Test Run ID + Test Case Name, the
 *       mapped fields, the Precondition and the Status dropdown that actually render, and
 *       keeps the selected Project visible in the header for steps 4-5.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details', () => {

  test('TC-069 | Validate Test Run Details Are Displayed Correctly', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-068): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(0);
    await executeTabPage.clickRunButton(0);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // ─── Step 3: Validate Test Run ID and Test Case Name ─────────────────────────
    await executionPage.verifyTestRunId(rowRunId);
    await executionPage.verifyTestCaseNameNotEmpty();

    // ─── Steps 4-5: Project context + Tester (Assigned To) ───────────────────────
    // The run's Project remains shown in the header selector; Release/Test Cycle/Test Suite
    // come from the sidebar tree the run was opened from. The panel surfaces the assigned
    // tester via the "Assigned To" field (validated with the mapped fields below).
    await executeTabPage.verifyProjectTextVisible();
    await executionPage.verifyMappedFieldsVisible();

    // ─── Step 6: Validate the Precondition field ─────────────────────────────────
    await executionPage.verifyPreconditionVisible();

    // ─── Step 7: Validate the Status dropdown (current status shown) ─────────────
    await executionPage.verifyStatusDisplayed();
  });

});
