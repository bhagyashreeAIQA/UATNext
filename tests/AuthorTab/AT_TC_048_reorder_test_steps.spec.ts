/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_048
 * Test Name    : Verify User Can Move Test Steps Using Up and Down Arrow Actions
 *
 * Description  : As a Test Engineer, I want to validate that test steps can be reordered with the
 *                Up/Down arrows, that step numbers update, and that the arrows are disabled at the
 *                first/last boundaries.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module";
 *                 a test case with at least THREE existing test steps.
 *
 * Steps (1-13): open a test case with ≥3 steps → Up/Down arrows visible+enabled on a non-boundary step
 *   → click Up → step moves up + numbers update → first step's Up arrow disabled → click Down on a
 *   movable step → moves down + numbers update → last step's Down arrow disabled.
 *
 * BLOCKED (test.fixme) — data: no test case with ≥3 test steps is currently available under
 *   Testdata_Module (the reachable test cases have 0 steps). Steps could be created first via the
 *   now-working step-add flow (AT_TC_040 / `addTestStep` + `enterStepDescription`/`enterStepExpected`),
 *   but that is heavy mutating setup; enable once a ≥3-step test case is available (or once a
 *   create-3-steps fixture is added). Reorder selectors: `#test-steps-row .move-up`/`.move-down`
 *   (boundary arrow carries `.disable` + `aria-disabled`), step numbers `.step-number`.
 *
 * Post-condition: this case (when enabled) MUTATES data — it reorders and saves test steps.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Reorder', () => {

  test.fixme('AT_TC_048 | Verify User Can Move Test Steps Using Up and Down Arrow Actions', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-3: open a test case with ≥3 steps ──────────────────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    expect(await authorPage.getStepRowCount(), 'a test case with ≥3 steps').toBeGreaterThanOrEqual(3);

    // ─── Step 5-7: Up/Down arrows on a non-first step → move up → numbers update ───────
    await expect(authorPage.stepMoveUp(1)).toBeVisible();
    await expect(authorPage.stepMoveDown(1)).toBeVisible();
    const before = await authorPage.getStepNumbers();
    await authorPage.stepMoveUp(1).click();
    expect(await authorPage.getStepNumbers(), 'step numbers updated').not.toEqual(before);
    await captureScreenshot(page, 'Step 5-7: Step moved up');

    // ─── Step 8-9: first step's Up arrow disabled ──────────────────────────────────────
    expect(await authorPage.isStepArrowDisabled(authorPage.stepMoveUp(0)), 'first step Up disabled').toBe(true);

    // ─── Step 12-13: last step's Down arrow disabled ───────────────────────────────────
    const last = (await authorPage.getStepNumbers()).length - 1;
    expect(await authorPage.isStepArrowDisabled(authorPage.stepMoveDown(last)), 'last step Down disabled').toBe(true);
    await captureScreenshot(page, 'Step 12-13: Boundary arrows disabled');
  });

});
