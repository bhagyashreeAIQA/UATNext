/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-111
 * Test Case Name: Verify Default Affected Release Value in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that the Affected Release/Build field is
 *                pre-populated.
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
 *   2. Validate the Affected Release/Build field.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Affected Release/Build is pre-populated with the mapped release value.
 *
 * Note: Affected Release/Build is a display-only field (`.defect-text-2`, no input); the mapped
 *       value is data-dependent (e.g. "Testdata_Release_P01"), so a non-empty value is asserted.
 *       No defect is created — the form is discarded.
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

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-111 | Verify Default Affected Release Value in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Expected 2: Affected Release/Build pre-populated with the mapped release ─
    const affectedRelease = await executionPage.getDefectFieldValue('Affected Release/Build');
    expect(affectedRelease.trim().length, 'Affected Release/Build should be pre-populated').toBeGreaterThan(0);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Expected 2: Affected Release/Build pre-populated with the mapped release");
  });

});
