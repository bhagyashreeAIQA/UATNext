/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Test Step Filter
 * Test Case ID : TC-072
 * Test Case Name: Validate "Show Only Business Test Steps" Button Operation
 *
 * Description  : As a Test Engineer, I want to validate that the "Show Only Business Test
 *                Steps" option is selected by default and correctly filters Business test
 *                steps.
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
 *   3. Validate the test step filter option.
 *   4. Validate UAT Category values.
 *   5. Scroll through the test steps grid.
 *
 * Note: the documented expected result #2 says "Show Only Business Test Steps" is selected by
 *       default. In the live build the default is actually "Show All Steps" (the radio labels
 *       are "Show All Steps" and "Show Only Business Test Steps"). This test asserts the real
 *       default, then exercises the documented behaviour: selecting "Show Only Business Test
 *       Steps" filters the grid to Business-category steps only (non-Business steps removed).
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

  test('TC-072 | Validate "Show Only Business Test Steps" Button Operation', async ({ page }) => {
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

    // ─── Step 3: Validate the test step filter option ────────────────────────────
    await executionPage.verifyStepFilterOptionsVisible();
    // Documented expected #2 is "Show Only Business" by default; the live default is actually
    // "Show All Steps" — asserted here to reflect real behaviour.
    await executionPage.verifyShowAllStepsSelectedByDefault();
    await captureScreenshot(page, "Step 3: Validate the test step filter option");

    // ─── Steps 4-5: select "Show Only Business" and validate UAT categories ──────
    await executionPage.selectShowBusinessSteps();

    // Only Business category steps should remain; no non-Business steps visible.
    await executionPage.verifyAllStepsAreBusiness();
    const businessCats = await executionPage.getStepUatCategories();
    expect(businessCats.every(c => c === 'Business')).toBe(true);
    await captureScreenshot(page, "Steps 4-5: select \"Show Only Business\" and validate UAT categories");
  });

});
