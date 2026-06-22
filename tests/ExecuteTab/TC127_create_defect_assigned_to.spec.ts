/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-127
 * Test Case Name: Verify Assigned To Field Value Selection
 *
 * Description  : As a Test Engineer, I want to verify that I can select a user from the Assigned To dropdown.
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
 *   2. Click the Assigned To dropdown.
 *   3. Select a Assigned To value.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Assigned To values are displayed.
 *   3. Selected Assigned To value is displayed and retained.
 *
 * Note: Assigned To has an empty default; a user is selected. No defect is created — the form is discarded.
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
const PLACEHOLDER = EXPECTED.createDefect.dropdownPlaceholders.assignedTo;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-127 | Verify Assigned To Field Value Selection', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: the Assigned To dropdown lists values ───
    expect(await executionPage.getDefectDropdownOptionCount(PLACEHOLDER),
      'Assigned To dropdown should list values').toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2 / Expected 2: the Assigned To dropdown lists values");

    // ─── Step 3 / Expected 3: select a value → it is displayed and retained ───
    const selected = await executionPage.selectFirstAvailableDefectDropdownValue(PLACEHOLDER);
    expect(await executionPage.getDefectDropdownValue(PLACEHOLDER)).toBe(selected);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Step 3 / Expected 3: select a value → it is displayed and retained");
  });

});
