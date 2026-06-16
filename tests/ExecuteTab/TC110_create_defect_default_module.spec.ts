/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-110
 * Test Case Name: Verify Default Module Value in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that the Module field is pre-populated with
 *                the mapped module.
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
 *   2. Validate the Module field.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Module is pre-populated with the mapped value (e.g. MD-6078 SET Dealer CRM).
 *
 * Note: the documented example is "MD-6078 SET Dealer CRM"; the live mapping for this test data
 *       is "MD-6111 Testdata_Module". Both follow the "MD-<id> <name>" shape, which is asserted
 *       (the exact mapped value is data-dependent).
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-110 | Verify Default Module Value in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: Module pre-populated with the mapped value ─────────
    const moduleValue = await executionPage.getDefectFieldValue('Module');
    expect(moduleValue).toMatch(EXPECTED.createDefect.modulePattern);

    await executionPage.closeCreateDefectForm();
  });

});
