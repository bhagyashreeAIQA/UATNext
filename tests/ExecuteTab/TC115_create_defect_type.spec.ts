/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-115
 * Test Case Name: Verify Type Field Value Selection in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that I can select a Type value from the
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
 *   2. Click the Type dropdown.
 *   3. Select a Type value (Bug, Enhancement, Change Request, Other).
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Type values are displayed.
 *   3. Selected Type value is displayed and retained.
 *
 * Note: Type defaults to "Bug"; the live options exactly match the documented set. A non-default
 *       value ("Enhancement") is selected. No defect is created.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const PLACEHOLDER = EXPECTED.createDefect.dropdownPlaceholders.type;
const SELECT_VALUE = 'Enhancement';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-115 | Verify Type Field Value Selection in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: the Type dropdown lists the documented values ──────
    const options = await executionPage.getDefectDropdownOptions(PLACEHOLDER);
    for (const value of EXPECTED.createDefect.typeOptions) {
      expect(options, `Type options should include "${value}"`).toContain(value);
    }
    await captureScreenshot(page, "Step 2 / Expected 2: the Type dropdown lists the documented values");

    // ─── Step 3 / Expected 3: select a value → it is displayed and retained ───────
    await executionPage.selectDefectDropdownValue(PLACEHOLDER, SELECT_VALUE);
    expect(await executionPage.getDefectDropdownValue(PLACEHOLDER)).toBe(SELECT_VALUE);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Step 3 / Expected 3: select a value → it is displayed and retained");
  });

});
