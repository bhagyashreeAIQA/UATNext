/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-126
 * Test Case Name: Verify Target Release/Build Field Value Selection
 *
 * Description  : As a Test Engineer, I want to verify that I can select a Target Release/Build value from the dropdown.
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
 *   2. Click the Target Release/Build dropdown.
 *   3. Select a Target Release/Build value.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Target Release/Build values are displayed.
 *   3. Selected Target Release/Build value is displayed and retained.
 *
 * Note: Target Release/Build has an empty default; a value is selected. No defect is created — the form is discarded.
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
const PLACEHOLDER = EXPECTED.createDefect.dropdownPlaceholders.targetRelease;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-126 | Verify Target Release/Build Field Value Selection', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2 / Expected 2: the Target Release/Build dropdown lists values ───
    expect(await executionPage.getDefectDropdownOptionCount(PLACEHOLDER),
      'Target Release/Build dropdown should list values').toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2 / Expected 2: the Target Release/Build dropdown lists values");

    // ─── Step 3 / Expected 3: select a value → it is displayed and retained ───
    const selected = await executionPage.selectFirstAvailableDefectDropdownValue(PLACEHOLDER);
    expect(await executionPage.getDefectDropdownValue(PLACEHOLDER)).toBe(selected);

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Step 3 / Expected 3: select a value → it is displayed and retained");
  });

});
