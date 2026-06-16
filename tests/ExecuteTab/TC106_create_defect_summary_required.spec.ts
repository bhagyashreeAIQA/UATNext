/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-106
 * Test Case Name: Validate Summary Mandatory Field in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that a defect cannot be created without
 *                entering a Summary.
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
 *   2. Leave the Summary field blank.
 *   3. Click Save.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. A validation message is displayed.
 *   3. Defect is not created.
 *
 * Note: the documented spec expects "Please fill all mandatory fields"; the live build shows the
 *       field-specific "Summary cannot be blank." (EXPECTED.createDefect.summaryBlankError). The
 *       form stays open afterwards, confirming no defect was created.
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

  test('TC-106 | Validate Summary Mandatory Field in Create Defect Screen', async ({ page }) => {
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

    // ─── Steps 2-3: leave Summary blank and Save ─────────────────────────────────
    await executionPage.typeSummary('');
    await executionPage.clickCreateDefectSave();

    // ─── Expected 2-3: validation shown, defect not created (form still open) ────
    await executionPage.verifyCreateDefectValidation(EXPECTED.createDefect.summaryBlankError);
    await executionPage.verifyStillOnCreateDefectForm();

    await executionPage.closeCreateDefectForm();
  });

});
