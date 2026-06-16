/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-118
 * Test Case Name: Verify Priority Field Value Selection in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that I can select a Priority value from the
 *                dropdown.
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
 *   2. Click the Priority dropdown.
 *   3. Select a Priority value.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Priority values are displayed.
 *   3. Selected Priority value is displayed and retained.
 *
 * Note: Priority defaults to "3 - Medium" (options like "1 -  Critical" carry irregular spacing,
 *       which the POM normalises). A value other than the default is selected. No defect is created.
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
const PLACEHOLDER = EXPECTED.createDefect.dropdownPlaceholders.priority;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-118 | Verify Priority Field Value Selection in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: the Priority dropdown lists values ─────────────────
    expect(await executionPage.getDefectDropdownOptionCount(PLACEHOLDER),
      'Priority dropdown should list values').toBeGreaterThan(0);

    // ─── Step 3 / Expected 3: select a value → it is displayed and retained ───────
    const selected = await executionPage.selectFirstAvailableDefectDropdownValue(PLACEHOLDER);
    expect(await executionPage.getDefectDropdownValue(PLACEHOLDER)).toBe(selected);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
  });

});
