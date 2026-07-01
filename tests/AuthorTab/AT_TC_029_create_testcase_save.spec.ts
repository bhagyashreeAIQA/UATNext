/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_029
 * Test Name    : Verify Test Case Creation Using Save Button
 *
 * Description  : As a Test Engineer, I want to validate that entering valid details and clicking Save
 *                creates a test case linked to the selected requirement.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-8): follow AT_TC_021 → ADD TEST CASE → Create Test Cases fields → enter valid Name +
 *   Description + Priority → SAVE enabled → Save → the new test case appears in the Existing Test
 *   Cases table.
 *
 * MUTATING (2026-06-30): this creates a REAL test case in qTest linked to the requirement (a unique
 *   timestamped name is used so repeated runs are identifiable). Name and Priority are mandatory.
 *
 * Post-condition: MUTATES data — a new test case is created and linked to the requirement.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Creation', () => {

  test('AT_TC_029 | Verify Test Case Creation Using Save Button', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-3: open a requirement → Add Test Case popup ────────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.verifyAddTestCaseEnabled();
    await authorPage.openAddTestCasePopup();
    await captureScreenshot(page, 'Step 1-3: Create Test Cases popup');

    // ─── Step 4-5: enter valid Name + Description + Priority ────────────────────────────
    const tcName = `Auto TC ${Date.now()}`;
    await authorPage.verifyCreatePopupFields();
    await authorPage.fillCreateTestCase({ name: tcName, description: 'Created by AT_TC_029' });
    await authorPage.selectCreatePriority();
    await captureScreenshot(page, 'Step 4-5: Valid data entered');

    // ─── Step 6-7: SAVE enabled → Save → test case created ─────────────────────────────
    await expect(authorPage.createPopupSave).toBeEnabled();
    await authorPage.clickCreateSave();
    await expect(authorPage.createNotification(/error|required|fail/i)).toHaveCount(0);
    await captureScreenshot(page, 'Step 6-7: Saved');

    // ─── Step 8: the new test case is displayed in the Existing Test Cases table ───────
    if (await authorPage.createPopup.isVisible().catch(() => false)) {
      await authorPage.closeAddTestCasePopup();
    }
    await expect.poll(() => authorPage.linkedTcContainsName(tcName), { timeout: 20000 }).toBe(true);
    await captureScreenshot(page, 'Step 8: New test case listed');
  });

});
