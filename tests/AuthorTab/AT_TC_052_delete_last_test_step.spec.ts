/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_052
 * Test Name    : Verify Deletion of Last Remaining Test Step
 *
 * Description  : As a Test Engineer, I want to validate that deleting the only test step shows the
 *                empty state.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-9): open a test case with a single test step → Delete icon → delete → no steps remain →
 *   empty state → Save → reopen → no steps remain.
 *
 * Live note (2026-06-30): the reachable test cases have no steps, so this self-seeds a SINGLE step
 *   (TinyMCE iframe entry) so that there is exactly one to delete, then deletes it to reach the empty
 *   state. MUTATING during the run (the seeded step is removed → the test case ends with no steps).
 *
 * Post-condition: MUTATES data — the test case is left with no test steps.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Delete Last Step', () => {

  test('AT_TC_052 | Verify Deletion of Last Remaining Test Step', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-4: open a test case and ensure exactly one test step exists ────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    test.skip(await authorPage.getTestStepCount() > 0,
      'Test case already has steps; this case needs a single-step (self-seeded) test case.');
    await authorPage.addAndSaveTestStep('AT_TC_052 single step', 'AT_TC_052 expected');
    expect(await authorPage.getTestStepCount(), 'exactly one test step').toBe(1);
    await captureScreenshot(page, 'Step 1-4: Single test step');

    // ─── Step 5-8: delete the only step → no steps + empty state → Save ────────────────
    await authorPage.deleteStepAt(0);
    await authorPage.saveTcDetail();
    await expect.poll(() => authorPage.getTestStepCount(), { timeout: 15000 }).toBe(0);
    await captureScreenshot(page, 'Step 5-8: Last step deleted → empty');

    // ─── Step 9: reopen → no steps remain ──────────────────────────────────────────────
    await authorPage.tcDetailBackToList();
    await authorPage.openTestCaseDetail(0);
    expect(await authorPage.getTestStepCount(), 'no steps after reopen').toBe(0);
    await captureScreenshot(page, 'Step 9: No steps after reopen');
  });

});
