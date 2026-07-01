/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_039
 * Test Name    : Verify Default State of Fields in New Test Steps Section
 *
 * Description  : As a Test Engineer, I want to validate that the New Test Step fields are empty/default
 *                and editable so new step information can be entered.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-9): open a test case → "+" visible/enabled → click → new step section → UAT Category
 *   default "Business" → Step Description empty/editable → Expected Result empty/editable → Action
 *   column delete icon enabled.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Default Field State', () => {

  test('AT_TC_039 | Verify Default State of Fields in New Test Steps Section', async ({ page }) => {
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

    // ─── Step 6-9: UAT default Business; desc/expected empty; delete icon enabled ──────
    await authorPage.verifyNewStepDefaults();
    await expect(authorPage.stepDeleteIcon).toBeEnabled();
    await captureScreenshot(page, 'Step 6-9: Default field state');
  });

});
