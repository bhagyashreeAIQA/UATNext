/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_035
 * Test Name    : Verify No Unintended Changes Occur When Modifying Test Case
 *
 * Description  : As a Test Engineer, I want to validate that modifying specific test case properties
 *                updates only those fields while the rest remain unchanged.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-12): open a test case → note current values → modify one field → SAVE → "Successfully
 *   updated" → reopen → the modified field changed and the unmodified fields are unchanged.
 *
 * MUTATING + DEVIATION (2026-06-30): edits a REAL qTest test case. The spec modifies Name/Description,
 *   but those text fields lack stable selectors; the dropdown fields are reliably editable, so this
 *   modifies ONLY the Priority dropdown and asserts the other fields (Status, Assigned To) are
 *   unchanged — validating the "only the modified field updates" behaviour.
 *
 * Post-condition: MUTATES data — a test case's Priority is changed and saved.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Management – Selective Update', () => {

  test('AT_TC_035 | Verify No Unintended Changes Occur When Modifying Test Case', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-5: open a test case → note current field values ────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    const tcId = await authorPage.openTestCaseDetail(0);
    const before = {
      priority: await authorPage.getTcDetailFieldValue('Priority'),
      status: await authorPage.getTcDetailFieldValue('Status'),
      assignedTo: await authorPage.getTcDetailFieldValue('Assigned To'),
    };
    await captureScreenshot(page, 'Step 1-5: Current values noted');

    // ─── Step 6-8: modify ONLY one field → SAVE → "Successfully updated" ────────────────
    const newPriority = await authorPage.changeTcDetailDropdown('Priority');
    expect(newPriority).not.toBe(before.priority);
    await authorPage.saveTcDetail();
    await captureScreenshot(page, 'Step 6-8: Saved');

    // ─── Step 9-12: reopen → only Priority changed; Status/Assigned To unchanged ───────
    await authorPage.tcDetailBackToList();
    expect(await authorPage.openTestCaseDetail(0)).toBe(tcId);
    expect(await authorPage.getTcDetailFieldValue('Priority'), 'modified field updated').toBe(newPriority);
    expect(await authorPage.getTcDetailFieldValue('Status'), 'Status unchanged').toBe(before.status);
    expect(await authorPage.getTcDetailFieldValue('Assigned To'), 'Assigned To unchanged').toBe(before.assignedTo);
    await captureScreenshot(page, 'Step 9-12: Only modified field changed');
  });

});
