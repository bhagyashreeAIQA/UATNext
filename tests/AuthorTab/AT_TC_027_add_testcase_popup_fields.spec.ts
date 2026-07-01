/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_027
 * Test Name    : Verify Create Test Case Popup Fields and Default State
 *
 * Description  : As a Test Engineer, I want to validate that the Add Test Case popup shows all
 *                required fields and controls.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-6): follow AT_TC_021 → ADD TEST CASE visible → open popup → fields (Name, Description,
 *   QA User, Business User, Precondition, Priority) → Delete icon → SAVE + CLOSE enabled.
 *
 * Live note (2026-06-30): the popup is the inline "Create Test Cases" form (Name* / Description /
 *   Priority* / QA User / Business User / Precondition / Action columns + ADD ROW / SAVE / CLOSE).
 *   Read-only — the popup is opened and closed without saving (no data is created).
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Add Test Case Popup', () => {

  test('AT_TC_027 | Verify Create Test Case Popup Fields and Default State', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-2: open a requirement (with linked TCs); ADD TEST CASE visible ─────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.verifyAddTestCaseEnabled();
    await captureScreenshot(page, 'Step 1-2: ADD TEST CASE visible');

    // ─── Step 3: open the Add Test Case popup ──────────────────────────────────────────
    await authorPage.openAddTestCasePopup();
    await captureScreenshot(page, 'Step 3: Add Test Case popup');

    // ─── Step 4-6: fields + Delete icon + SAVE/CLOSE enabled ───────────────────────────
    await authorPage.verifyCreatePopupFields();
    await captureScreenshot(page, 'Step 4-6: Popup fields, delete icon, SAVE/CLOSE');

    // Close without saving (no data created).
    await authorPage.closeAddTestCasePopup();
  });

});
