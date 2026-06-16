/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-131
 * Test Case Name: Successful Defect Creation in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to create a defect successfully after entering all
 *                mandatory details.
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
 *   2. Populate all mandatory fields.
 *   3. Click Save.
 *
 * Expected:
 *   1. All mandatory fields accept valid values.
 *   2. Defect is created successfully.
 *   3. Success message "Defect Created Successfully" is displayed.
 *
 * MUTATING: this creates a REAL qTest defect (the only mandatory fields without a default are
 *   Summary and Team — the rest are pre-populated: Affected Release/Build, Severity, Status,
 *   Priority, Type, Description). qTest has no automated defect deletion here, so the defect
 *   persists; the Summary is timestamped so created defects are identifiable. Run sparingly.
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

  test('TC-131 | Successful Defect Creation in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const summary = `Automated test defect ${Date.now()}`;

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Step 2: populate the mandatory fields lacking a default (Summary, Team) ──
    await executionPage.typeSummary(summary);
    await executionPage.selectFirstAvailableDefectDropdownValue(EXPECTED.createDefect.dropdownPlaceholders.team);

    // ─── Step 3 / Expected 2-3: Save → "Defect Created Successfully" ─────────────
    await executionPage.clickCreateDefectSave();
    await executionPage.verifyDefectCreatedMessage(EXPECTED.createDefect.defectCreatedMessage);
  });

});
