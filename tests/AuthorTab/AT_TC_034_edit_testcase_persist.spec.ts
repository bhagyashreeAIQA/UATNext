/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_034
 * Test Name    : Verify Updated Test Case Details Are Reflected Correctly
 *
 * Description  : As a Test Engineer, I want to validate that after modifying and saving a test case,
 *                the updated details are reflected (persisted) correctly.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-10): open a requirement's test case → editable fields show existing values → update a
 *   field → SAVE → "Successfully updated" → back to the linked list → reopen → updated value persists.
 *
 * MUTATING + DEVIATION (2026-06-30): edits a REAL qTest test case. The detail view's text fields
 *   (Name/Description) do not expose stable selectors, while the dropdown fields (Priority / Status /
 *   Type / Automation Progress / Assigned To / Business User) are reliably editable — so this updates
 *   the Priority dropdown to validate the edit → save → persist flow.
 *
 * Post-condition: MUTATES data — a test case's Priority is changed and saved.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Management – Persist Update', () => {

  test('AT_TC_034 | Verify Updated Test Case Details Are Reflected Correctly', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-4: open a test case → editable fields show existing values ─────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    const tcId = await authorPage.openTestCaseDetail(0);
    await expect(authorPage.tcDetailField('Priority'), 'Priority field is displayed').toBeVisible();
    const originalPriority = await authorPage.getTcDetailFieldValue('Priority');
    await captureScreenshot(page, 'Step 1-4: Test case detail with existing values');

    // ─── Step 5-7: update a field → SAVE → "Successfully updated" ───────────────────────
    const newPriority = await authorPage.changeTcDetailDropdown('Priority');
    expect(newPriority, 'a different priority was chosen').not.toBe(originalPriority);
    await authorPage.saveTcDetail();
    await captureScreenshot(page, 'Step 5-7: Saved with "Successfully updated"');

    // ─── Step 8-10: back to list → reopen → updated value persists ─────────────────────
    await authorPage.tcDetailBackToList();
    const reopened = await authorPage.openTestCaseDetail(0);
    expect(reopened).toBe(tcId);
    expect(await authorPage.getTcDetailFieldValue('Priority'), 'updated Priority persisted').toBe(newPriority);
    await captureScreenshot(page, 'Step 8-10: Updated value persisted');
  });

});
