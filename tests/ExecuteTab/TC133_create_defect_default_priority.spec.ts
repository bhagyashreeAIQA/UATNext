/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-133
 * Test Case Name: Validate Default Priority Value in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify the default Priority value when creating a
 *                defect.
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
 *   2. Validate the Priority field.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Priority defaults to "3 - Medium".
 *
 * Note: No defect is created — the form is discarded.
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

  test('TC-133 | Validate Default Priority Value in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: Priority defaults to "3 - Medium" ──────────────────
    expect(await executionPage.getDefectFieldValue('Priority')).toBe(EXPECTED.createDefect.defaultPriority);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
  });

});
