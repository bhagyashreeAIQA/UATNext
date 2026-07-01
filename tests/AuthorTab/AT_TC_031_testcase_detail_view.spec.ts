/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_031
 * Test Name    : Verify Test Case Details Are Displayed on Clicking Test Case ID
 *
 * Description  : As a Test Engineer, I want to validate that clicking a Test Case ID opens its detail
 *                view with all fields and the Test Steps section.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-10): Author tab → select a requirement (with linked test cases) → click a Test Case ID →
 *   detail view: TC ID header, Name, fields (Priority / Assigned To / Business User / Description /
 *   Precondition / Type / Automation Progress / Status), Requirement reference, Test Steps section,
 *   "+" add-step icon, ADD CALLED TEST CASE button.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Detail View', () => {

  test('AT_TC_031 | Verify Test Case Details Are Displayed on Clicking Test Case ID', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-2: select a requirement with linked test cases ─────────────────────────
    const req = await authorPage.selectRequirementWithLinkedTestCases();
    await captureScreenshot(page, 'Step 1-2: Requirement with linked test cases');

    // ─── Step 3: click a Test Case ID → detail view opens ──────────────────────────────
    const tcId = await authorPage.openTestCaseDetail(0);
    expect(tcId, 'opened a test case').toMatch(/^TC-\d+$/);
    await captureScreenshot(page, 'Step 3: Test Case detail opened');

    // ─── Step 4-8: TC id/name/fields, Requirement reference, Test Steps section ────────
    await authorPage.verifyTestCaseDetails(tcId, req.id);
    await captureScreenshot(page, 'Step 4-8: Test Case detail fields');

    // ─── Step 9-10: "+" add-step icon + ADD CALLED TEST CASE button ────────────────────
    await expect(authorPage.addCalledTestCaseButton).toBeVisible();
    await captureScreenshot(page, 'Step 9-10: Add-step icon + ADD CALLED TEST CASE');
  });

});
