/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-105
 * Test Case Name: Verify Mandatory Fields Are Marked Correctly in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to validate that mandatory fields are clearly
 *                identified in the Create Defect screen.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-098 (open a run → LINK DEFECT → NEW → Create Defect form).
 *
 * Steps:
 *   1. Follow TC-098.
 *   2. Validate field labels.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Mandatory fields (Summary, Affected Release/Build, Severity, Priority, Status,
 *      Type, Description) are marked with an asterisk (*).
 *
 * Note: each mandatory label carries a `span.defect-text-wrapper-2` "*". No defect is created.
 *       Module is no longer asterisked in the live form (it is auto-populated from the qTest
 *       mapping — see TC-110), so it is intentionally excluded from EXPECTED.mandatoryFields.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-105 | Verify Mandatory Fields Are Marked Correctly in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-098): open the Create Defect form ────────────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2: every mandatory field shows the asterisk marker ─────────────────
    for (const field of EXPECTED.createDefect.mandatoryFields) {
      await executionPage.verifyMandatoryFieldMarked(field); // Expected 2
    }

    await executionPage.closeCreateDefectForm();         // discard — no defect created
  });

});
