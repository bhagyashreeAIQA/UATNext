/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_042
 * Test Name    : Verify Newly Added Test Step Is Assigned the Correct Step Number
 *
 * Description  : As a Test Engineer, I want to validate that a newly added test step receives the next
 *                sequential step number.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-13): open a test case → "+" → UAT Category → Step Description + Expected Result → Save →
 *   "Test Case updated successfully" → the new step appears with the next sequential step number.
 *
 * Note: saving a step requires entering the Step Description (a TinyMCE iframe editor). Typing real
 *   keystrokes + Tab commits it to the Blazor model — see `enterStepDescription` (same recipe as
 *   AT_TC_040). Step numbers render only on SAVED steps (`#test-steps-row .step-number`), matching the
 *   "Test Steps(N)" heading; the trailing "add new" row has no number.
 *
 * Post-condition: this case MUTATES data — it adds a test step.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Step Numbering', () => {

  test('AT_TC_042 | Verify Newly Added Test Step Is Assigned the Correct Step Number', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.selectFeature(data.featureA);

    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    const stepsBefore = await authorPage.getTestStepCount(); // saved steps (the "Test Steps(N)" heading)

    // ─── Step 5-9: add step → UAT + description + expected → Save ───────────────────────
    await authorPage.addTestStep();
    await authorPage.selectUatCategory('Business');
    await authorPage.enterStepDescription('Step for numbering check');
    await authorPage.enterStepExpected('Expected for numbering check');
    await authorPage.saveTcDetail();
    await captureScreenshot(page, 'Step 5-9: Step saved');

    // ─── Step 11-13: new step appears with the next sequential number ──────────────────
    await expect.poll(() => authorPage.getTestStepCount(), { timeout: 10000 }).toBe(stepsBefore + 1);
    const numbers = (await authorPage.getStepNumbers()).map(Number);
    expect(numbers, 'step numbers are sequential with no gaps (1..N)')
      .toEqual(numbers.map((_, i) => i + 1));
    expect(numbers.at(-1), 'new step received the next sequential number').toBe(stepsBefore + 1);
    await captureScreenshot(page, 'Step 11-13: Sequential step number');
  });

});
