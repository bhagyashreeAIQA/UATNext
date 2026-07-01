/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_051
 * Test Name    : Verify User Can Delete a Test Step
 *
 * Description  : As a Test Engineer, I want to validate that a saved test step can be deleted.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-13): open a test case → add a test step (description + expected) → Save → the step appears →
 *   Delete icon → delete → the step is removed → Save → remaining steps renumber sequentially.
 *
 * Live note (2026-06-30): the reachable test cases have no steps, so this self-seeds one (the TinyMCE
 *   step cells are entered via the iframe editor) and then deletes it — net zero, but MUTATING during
 *   the run.
 *
 * Post-condition: MUTATES data — a test step is created then deleted (net unchanged).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Delete Step', () => {

  test('AT_TC_051 | Verify User Can Delete a Test Step', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-3: open a test case ────────────────────────────────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await page.waitForTimeout(5000); // Waits for 5 seconds
    await authorPage.openTestCaseDetail(0);
    const stepsBefore = await authorPage.getTestStepCount();

    // ─── Step 4-8: add a step (desc + expected) → Save → it appears ────────────────────
    await authorPage.addAndSaveTestStep('AT_TC_051 step description', 'AT_TC_051 expected result');
    expect(await authorPage.getTestStepCount(), 'step added').toBe(stepsBefore + 1);
    await captureScreenshot(page, 'Step 4-8: Test step added');

    // ─── Step 9-13: Delete icon → delete → Save → step removed ─────────────────────────
    // The just-added step is the LAST saved step, so target the last delete icon. (Index off the
    // per-step delete-icon count, NOT getStepRowCount() — the latter counts an extra trailing
    // `#test-steps-row` that carries no delete icon, so its last index overshoots.)
    await expect(authorPage.stepDeleteIcons.last()).toBeVisible();
    await authorPage.deleteStepAt((await authorPage.stepDeleteIcons.count()) - 1);
    await authorPage.saveTcDetail();
    await expect.poll(() => authorPage.getTestStepCount(), { timeout: 15000 }).toBe(stepsBefore);
    await captureScreenshot(page, 'Step 9-13: Test step deleted');
  });

});
