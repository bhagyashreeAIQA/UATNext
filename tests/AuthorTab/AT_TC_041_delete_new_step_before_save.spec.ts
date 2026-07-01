/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_041
 * Test Name    : Verify User Can Delete a Newly Added Test Step Before Saving
 *
 * Description  : As a Test Engineer, I want to validate that the Delete Test Step icon removes a newly
 *                added (unsaved) step row, cancelling step creation before saving.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-10): open a test case → "+" → new step section → select UAT Category → Delete icon enabled
 *   → click Delete → the newly added step row is removed.
 *
 * Live note (2026-06-30): the new step's Step Description / Expected Result are TinyMCE editors (not
 *   reliably typeable by automation, see AT_TC_036), but they are NOT needed to validate deletion — the
 *   row is added and deleted without entering them, so no data is saved.
 *
 * Post-condition: no new test step is created; existing steps unchanged.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Delete New Step', () => {

  test('AT_TC_041 | Verify User Can Delete a Newly Added Test Step Before Saving', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-5: open a test case → "+" → new step section ───────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    await expect(authorPage.addStepButton).toBeEnabled();
    const stepsBefore = await authorPage.getStepRowCount();
    await authorPage.addTestStep();
    expect(await authorPage.getStepRowCount(), 'a new step row was added').toBe(stepsBefore + 1);
    await captureScreenshot(page, 'Step 1-5: New step row added');

    // ─── Step 6: select UAT Category (a non-TinyMCE field) ─────────────────────────────
    expect(await authorPage.newStepUatCategory.inputValue()).toBe('Business');

    // ─── Step 9-10: Delete icon enabled → click → row removed ──────────────────────────
    await expect(authorPage.stepDeleteIcon).toBeEnabled();
    await authorPage.deleteNewStep();
    expect(await authorPage.getStepRowCount(), 'the new step row was removed').toBe(stepsBefore);
    await captureScreenshot(page, 'Step 9-10: New step row deleted');
  });

});
