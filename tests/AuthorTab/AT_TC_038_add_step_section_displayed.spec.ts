/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_038
 * Test Name    : Verify New Test Step Section Is Displayed on Clicking Add Test Step
 *
 * Description  : As a Test Engineer, I want to validate that clicking the Add Test Step "+" displays a
 *                new editable step row with its fields and a delete icon.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-8): open a test case → "+" add-step icon visible/enabled → click → new step section → new
 *   editable row → UAT Category / Step Description / Expected Result fields → Delete icon in Action.
 *
 * Live note (2026-06-30): the add-step control is `#addRowIcon`; no data is saved (read-only).
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Add Step UI', () => {

  test('AT_TC_038 | Verify New Test Step Section Is Displayed on Clicking Add Test Step', async ({ page }) => {
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
    await authorPage.openTestCaseDetail(0);
    await captureScreenshot(page, 'Step 1-3: Test case detail');

    // ─── Step 4: "+" add-step icon visible + enabled ───────────────────────────────────
    await expect(authorPage.addStepButton).toBeVisible();
    await expect(authorPage.addStepButton).toBeEnabled();
    await captureScreenshot(page, 'Step 4: Add-step icon');

    // ─── Step 5-8: click + → new editable row with fields + Delete icon ────────────────
    await authorPage.addTestStep();
    await expect(authorPage.newStepUatCategory, 'UAT Category field').toBeVisible();
    await expect(authorPage.stepDescriptionCell, 'Step Description field').toBeVisible();
    await expect(authorPage.stepExpectedCell, 'Expected Result field').toBeVisible();
    await expect(authorPage.stepDeleteIcon, 'Delete icon in Action').toBeVisible();
    await captureScreenshot(page, 'Step 5-8: New step row fields + delete icon');
  });

});
