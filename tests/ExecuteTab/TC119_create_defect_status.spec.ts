/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-119
 * Test Case Name: Verify Status Field Value Selection in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that I can view and select values from the
 *                Status dropdown in the Create Defect screen.
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
 *   2. Click the Status dropdown.
 *   3. Select a Status value (New, Rejected, Deferred, Open, Assigned, Remediation Started, Fixed,
 *      Ready To Retest).
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Status values are displayed.
 *   3. Selected Status value is displayed and retained.
 *
 * Note: Status defaults to "New"; the live workflow exposes a superset of the documented values
 *       (15 statuses), so the documented set is asserted as a present subset. A non-default value
 *       ("Assigned") is selected. No defect is created.
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
const PLACEHOLDER = EXPECTED.createDefect.dropdownPlaceholders.status;
const SELECT_VALUE = 'Assigned';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-119 | Verify Status Field Value Selection in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: the Status dropdown lists the documented values ────
    const options = await executionPage.getDefectDropdownOptions(PLACEHOLDER);
    for (const value of EXPECTED.createDefect.statusOptions) {
      expect(options, `Status options should include "${value}"`).toContain(value);
    }
    await captureScreenshot(page, "Step 2 / Expected 2: the Status dropdown lists the documented values");

    // ─── Step 3 / Expected 3: select a value → it is displayed and retained ───────
    await executionPage.selectDefectDropdownValue(PLACEHOLDER, SELECT_VALUE);
    expect(await executionPage.getDefectDropdownValue(PLACEHOLDER)).toBe(SELECT_VALUE);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Step 3 / Expected 3: select a value → it is displayed and retained");
  });

});
