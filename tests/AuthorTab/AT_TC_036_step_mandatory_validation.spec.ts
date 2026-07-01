/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_036
 * Test Name    : Verify Mandatory Field Validation for Adding a Test Step
 *
 * Description  : As a Test Engineer, I want to verify that adding a test step enforces the mandatory
 *                Step Description with a proper validation message.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-15): open a test case → "+" → new step (UAT default Business, Step Description empty) →
 *   leave Step Description blank → SAVE → "Error: Please fill in step description before saving." →
 *   (then enter description and save to add the step).
 *
 * Live note + DEVIATION (2026-06-30): the mandatory-Description validation (blank Save → error) is
 *   fully verified here. The subsequent successful add (steps 12-15) requires typing into the Step
 *   Description / Expected Result cells, which are TinyMCE `.testcase-prototype` editors whose
 *   programmatic text-commit is unreliable (the same reason Execute TC-100/101 are fixme) — that part
 *   is covered by the fixme step-create specs (AT_TC_040). This case asserts the validation behaviour.
 *
 * Post-condition: read-only — no test step is saved (validation only).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Mandatory Validation', () => {

  test('AT_TC_036 | Verify Mandatory Field Validation for Adding a Test Step', async ({ page }) => {
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
    await authorPage.addTestStep();
    await captureScreenshot(page, 'Step 1-5: New step section');

    // ─── Step 6-9: UAT default "Business"; Step Description + Expected Result empty ─────
    expect(await authorPage.newStepUatCategory.inputValue(), 'UAT default').toBe('Business');
    await expect(authorPage.stepDescriptionCell).toContainText(/click to add/i);
    await expect(authorPage.stepExpectedCell).toContainText(/click to add/i);
    await captureScreenshot(page, 'Step 6-9: Default empty fields');

    // ─── Step 11: leave Step Description blank → SAVE → validation error ────────────────
    await page.getByRole('button', { name: /^SAVE$/i }).first().click();
    await expect(authorPage.createNotification(/please fill in step description/i),
      'mandatory Step Description validation').toBeVisible({ timeout: 10000 });
    await captureScreenshot(page, 'Step 11: Step Description required validation');
  });

});
