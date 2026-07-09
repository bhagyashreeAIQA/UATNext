/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_026
 * Test Name    : Verify User Can Add a Test Case from Add Test Case Button
 *
 * Description  : As a Test Engineer, I want to validate that the Add Test Case button opens a popup
 *                where I can enter details and create a test case for the selected requirement.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): follow AT_TC_021 → ADD TEST CASE visible → open popup → fields shown → enter valid
 *   mandatory details (Name + Priority, plus Description) → Save → the new test case is displayed in
 *   the linked test case list for the requirement.
 *
 * MUTATING (2026-06-30): creates a REAL qTest test case linked to the requirement (unique timestamped
 *   name). Name and Priority are mandatory.
 *
 * Post-condition: MUTATES data — a new test case is created and linked to the requirement.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Creation', () => {

  test('AT_TC_026 | Verify User Can Add a Test Case from Add Test Case Button', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-2: open a requirement; ADD TEST CASE visible ───────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.verifyAddTestCaseEnabled();

    // ─── Step 3-4: open the Add Test Case popup → fields shown ─────────────────────────
    await authorPage.openAddTestCasePopup();
    await authorPage.verifyCreatePopupFields();
    await captureScreenshot(page, 'Step 3-4: Add Test Case popup fields');

    // ─── Step 5-6: enter valid mandatory details → Save ────────────────────────────────
    const tcName = `Auto TC ${Date.now()}`;
    await authorPage.fillCreateTestCase({ name: tcName, description: 'Created by AT_TC_026' });
    await authorPage.selectCreatePriority();
    await authorPage.selectCreateAssignedTo(['Sounak Sen', 'Anubhav Ganguly', 'Saheb Ohja']);
    await authorPage.clickCreateSave();
    await expect(authorPage.createNotification(/error|required|fail/i)).toHaveCount(0);
    await captureScreenshot(page, 'Step 5-6: Saved');

    // ─── Step 7: the new test case is displayed in the linked test case list ───────────
    if (await authorPage.createPopup.isVisible().catch(() => false)) {
      await authorPage.closeAddTestCasePopup();
    }
    await expect.poll(() => authorPage.linkedTcContainsName(tcName), { timeout: 20000 }).toBe(true);
    await captureScreenshot(page, 'Step 7: New test case listed');
  });

});
