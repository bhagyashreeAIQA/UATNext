/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_023
 * Test Name    : Verify Requirement Selection When No Linked Test Cases Are Available
 *
 * Description  : As a Test Engineer, I want to validate that selecting a requirement with no linked
 *                test cases shows its details and an appropriate empty state in the Linked Test Cases
 *                section.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-10): EPIC_A → Feature_A → requirement list → click a requirement with no linked test cases
 *   → details shown → Linked Test Cases grid empty → "no test case linked" message → ADD TEST CASE
 *   button visible + enabled.
 *
 * Real data (2026-06-30): RQ-8442 (under epicA + featureA) has no linked test cases.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Selection – Empty Linked Test Cases', () => {

  test('AT_TC_023 | Verify Requirement Selection When No Linked Test Cases Are Available', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await captureScreenshot(page, 'Step 1: Author tab, Testdata_Module selected');
    // ─── Step 2-4: EPIC_A + Feature_A → requirement list ───────────────────────────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await page.waitForTimeout(5000);
    //await authorPage.waitForTotalEntries(data.epicACount);
    await captureScreenshot(page, 'Step 2-4: EPIC_A + Feature_A requirement list');
    // ─── Step 5-6: click a requirement with no linked test cases → details shown ───────
    await authorPage.selectRequirementById(data.reqWithoutTestCases);
    await authorPage.verifyRequirementDetails(data.reqWithoutTestCases);
    await captureScreenshot(page, 'Step 5-6: Requirement (no test cases) detail');

    // ─── Step 7-9: Linked Test Cases grid empty + "no test case linked" message ────────
    await authorPage.verifyNoLinkedTestCases();
    await captureScreenshot(page, 'Step 7-9: No linked test cases empty state');

    // ─── Step 10: ADD TEST CASE button visible + enabled ───────────────────────────────
    await authorPage.verifyAddTestCaseEnabled();
    await captureScreenshot(page, 'Step 10: ADD TEST CASE button');
  });

});
