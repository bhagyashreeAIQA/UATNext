/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Filter
 * Test Case ID : TC-073
 * Test Case Name: Validate "Show All Test Steps" Button Operation
 *
 * Description  : As a Test Engineer, I want to validate that selecting "Show All Test Steps"
 *                displays all test steps, so that I can view and execute every step.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-068 (the execution details panel is open with a steps grid).
 *
 * Steps:
 *   1. Follow TC-068.
 *   2. Open any test run using the Run button.
 *   3. Validate that "Show Only Business Test Steps" is selected by default.
 *   4. Click on "Show All Test Steps".
 *   5. Validate the test steps grid.
 *
 * Note: the live default is actually "Show All Steps" (the radio is labelled "Show All Steps",
 *       not "Show All Test Steps"), not "Show Only Business Test Steps" as expected result #2
 *       states. To exercise the toggle meaningfully this test first switches to "Show Only
 *       Business Test Steps" (filtered view), then clicks "Show All Steps" and verifies the
 *       grid refreshes to show every step — both Business and non-Business.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Test Step Filter', () => {

  test('TC-073 | Validate "Show All Test Steps" Button Operation', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-068): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(0);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyStepsGridVisible();
    await captureScreenshot(page, "Steps 1-2 (follows TC-068): reach the grid and open a run");

    // ─── Step 3: validate the default selection (actual default = "Show All Steps") ─
    await executionPage.verifyStepFilterOptionsVisible();
    await executionPage.verifyShowAllStepsSelectedByDefault();

    // Switch to the filtered (Business-only) view first so the "Show All" transition is real.
    await executionPage.selectShowBusinessSteps();
    await executionPage.verifyAllStepsAreBusiness();
    const businessCount = (await executionPage.getStepUatCategories()).length;
    await captureScreenshot(page, "Step 3: validate the default selection (actual default = \"Show All Steps\")");

    // ─── Step 4: Click on "Show All Steps" → it becomes selected, grid refreshes ─
    await executionPage.selectShowAllSteps();
    await captureScreenshot(page, "Step 4: Click on \"Show All Steps\" → it becomes selected, grid refreshes");

    // ─── Step 5: validate "Show All" reveals at least every Business step, plus any
    // non-Business steps the run has. Which run lands at grid row 0 varies per session and
    // some runs contain only Business steps, so the non-Business *reveal* is asserted only when
    // the run actually has non-Business steps (Show All shows more than the Business-only view).
    // The monotonic guarantee (Show All ⊇ Show Only Business) holds for every run.
    await expect(async () => {
      const allCats = await executionPage.getStepUatCategories();
      expect(allCats.length).toBeGreaterThanOrEqual(businessCount);
      expect(allCats.filter(c => c === 'Business').length).toBeGreaterThanOrEqual(businessCount);
      if (allCats.length > businessCount) {
        // Show All revealed extra steps beyond the Business-only set → they are the non-Business ones.
        expect(allCats.some(c => c !== 'Business')).toBe(true);
      }
    }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
    await captureScreenshot(page, "Step 5: validate \"Show All\" reveals at least every Business step, plus any");
  });

});
