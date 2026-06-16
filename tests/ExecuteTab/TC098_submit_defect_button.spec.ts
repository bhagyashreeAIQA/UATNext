/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-098
 * Test Case Name: Validate Submit Defect Button Functionality in Test Run
 *
 * Description  : As a Test Engineer, I want to validate that opening the defect creation flow
 *                from a test run opens the defect creation screen.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has a runnable test run).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Open any Test Run.
 *   3. Validate the defect-creation entry point.
 *   4. Open the Create Defect screen.
 *   5. Validate the opened screen.
 *
 * Note: the live build has no button literally labelled "Submit Defect". The run-level defect
 *       entry point is the LINK DEFECT button, whose panel offers a NEW action that opens the
 *       Create Defect form. This test validates that flow opens the Create Defect form. No
 *       defect is submitted (the form is only opened), so no qTest data is created.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-098 | Validate Submit Defect Button Functionality in Test Run', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // ─── Step 3: validate the defect-creation entry point is present + enabled ───
    await executionPage.verifyDefectSectionVisible();

    // ─── Step 4: open the defect panel and trigger the Create Defect form ────────
    await executionPage.openLinkDefectPanel();
    await executionPage.verifyDefectPanelOpen();
    await executionPage.verifyNewDefectButtonVisible();
    await executionPage.clickNewDefect();

    // ─── Step 5: the Create Defect form should be displayed ──────────────────────
    await executionPage.verifyCreateDefectFormOpen();
  });

});
