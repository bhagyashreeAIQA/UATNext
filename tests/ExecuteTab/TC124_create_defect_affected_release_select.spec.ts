/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-124
 * Test Case Name: Verify Affected Release/Build Field Value Selection
 *
 * Description  : As a Test Engineer, I want to verify that I can select an Affected Release/Build
 *                value from the dropdown.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-098 (open a run → LINK DEFECT → NEW → Create Defect form).
 *
 * NOT APPLICABLE (test.fixme) — app behaviour, not seeding: in the current build the Affected
 *   Release/Build field is NOT a dropdown. It renders as a display-only, pre-populated value
 *   (`.defect-form-text-field` with a `.defect-text-2` span, no `input` — verified 2026-06-15,
 *   value e.g. "Testdata_Release_P01"). There is no dropdown to open or value to select, so the
 *   documented selection flow cannot be exercised. The pre-populated value is covered by TC-111.
 *   Enable this only if Affected Release/Build becomes an editable dropdown.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  // NOT APPLICABLE: Affected Release/Build is display-only (no dropdown) in this build — see header.
  test.fixme('TC-124 | Verify Affected Release/Build Field Value Selection', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1: reach the suite grid and open a Test Run ────────────────────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    // ─── Step 1: open the Create Defect form ─────────────────────────────────────────
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();
    await captureScreenshot(page, 'Step 1: Create Defect form open');

    // Affected Release/Build has no dropdown to open/select — display-only (see header note).
  });

});
