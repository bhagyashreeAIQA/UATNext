/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_037
 * Test Name    : Verify User Can Modify Test Step Details and Save Changes
 *
 * Description  : As a Test Engineer, I want to validate that existing test step details can be modified
 *                and saved.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-12): open a test case with steps → select a step → fields editable (Step Description,
 *   Expected Result, UAT Category) → modify Step Description + UAT Category → Save → "Successfully
 *   updated" → updated values shown; step number/count unchanged; other steps unaffected.
 *
 * Note: modifying the Step Description requires editing the step's TinyMCE editor (iframe
 *   `[title="Rich Text Area"]`). Clicking a committed step's `.testcase-prototype` cell re-opens its
 *   editor; typing real keystrokes + Tab commits the change to the Blazor model (see
 *   `enterStepDescription`). `fill()` does NOT commit, so the same recipe as AT_TC_040 is used.
 *
 * Post-condition: this case MUTATES data — it edits an existing test step (and seeds one if the test
 *   case has none).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Modify Step', () => {

  test('AT_TC_037 | Verify User Can Modify Test Step Details and Save Changes', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.selectFeature(data.featureA);

    // ─── Step 1-4: open a test case with existing steps ────────────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);

    // Ensure the test case has at least one saved step to modify (seed one if it has none).
    if (await authorPage.getTestStepCount() === 0) {
      await authorPage.addTestStep();
      await authorPage.enterStepDescription('Seed step for modify');
      await authorPage.enterStepExpected('Seed expected result');
      await authorPage.saveTcDetail();
    }
    const stepsBefore = await authorPage.getTestStepCount();
    await captureScreenshot(page, 'Step 1-4: Test Case detail with existing steps');  
    // ─── Step 5-7: modify the last step's Step Description + UAT Category → Save ────────
    await authorPage.enterStepDescription(' (edited)'); // re-opens the step editor; appends text
    const newCategory = await authorPage.changeUatCategory(); // switches to a different category
    await authorPage.saveTcDetail();                    // waits for the "updated successfully" toast
    await captureScreenshot(page, 'Step 5-7: Step modified and saved');

    // ─── Step 8-12: success; step count unchanged; category updated ────────────────────
    expect(await authorPage.getTestStepCount(), 'step count unchanged after modify').toBe(stepsBefore);
    await expect.poll(() => authorPage.newStepUatCategory.inputValue(), { timeout: 10000 })
      .toBe(newCategory);
    await captureScreenshot(page, 'Step 8-12: Updated step persisted');
  });

});
