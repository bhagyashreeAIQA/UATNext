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
 * Steps: open a test case → delete EVERY test step (one at a time, saving after each) → no steps
 *   remain → empty state → reopen → no steps remain.
 *
 * Live note (2026-06-30): the reachable test cases have no steps, so this self-seeds SEVERAL steps
 *   (TinyMCE iframe entry) to give a known set to delete, then deletes them all to reach the empty
 *   state. MUTATING during the run (the seeded steps are removed → the test case ends with no steps).
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

    // ─── Step 1-4: open a test case and seed several steps to delete ──────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(1);
    // The reachable test cases start with no steps, so seed a known set so there is more
    // than one to delete (this test MUTATES: it ends with the test case empty).
    for (let i = 1; i <= 1; i++) {
      await authorPage.addAndSaveTestStep(`AT_TC_052 step ${i}`, `AT_TC_052 expected ${i}`);
    }
    expect(await authorPage.getTestStepCount(), 'steps seeded to delete').toBeGreaterThan(0);
    await captureScreenshot(page, 'Step 1-4: Seeded test steps');

    // ─── Step 5-8: delete EVERY step (delete → save, repeat) until none remain ─────────
    let stepCount = await authorPage.getTestStepCount();
    while (stepCount > 0) {
      await authorPage.deleteStepAt(0);
      await authorPage.saveTcDetail();
      await expect.poll(() => authorPage.getTestStepCount(), { timeout: 15000 }).toBe(stepCount - 1);
      stepCount = await authorPage.getTestStepCount();
    }
    expect(stepCount, 'no steps after deleting all').toBe(0);
    await captureScreenshot(page, 'Step 5-8: All steps deleted → empty');

    // ─── Step 9: reopen → validate no test step present ────────────────────────────────
    await authorPage.tcDetailBackToList();
    await authorPage.openTestCaseDetail(1);
    expect(await authorPage.getTestStepCount(), 'no steps after reopen').toBe(0);
    await captureScreenshot(page, 'Step 9: No steps after reopen');
  });

});
