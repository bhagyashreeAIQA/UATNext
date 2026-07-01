/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_028
 * Test Name    : Verify Add Row, Delete Row and Close Button Functionality
 *
 * Description  : As a Test Engineer, I want to validate that the Add Test Case popup supports adding
 *                rows, deleting a row, and closing the popup.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-12): follow AT_TC_021 → ADD TEST CASE → Create Test Cases section → ADD ROW enabled →
 *   click ADD ROW (row added) → Delete icon → delete the row (removed) → CLOSE → popup closed.
 *
 * Live note (2026-06-30): no data is saved (read-only) — the added row is deleted and the popup closed
 *   without Save, so no test case is created.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Add Test Case Popup', () => {

  test('AT_TC_028 | Verify Add Row, Delete Row and Close Button Functionality', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-4: open a requirement → Add Test Case popup (Create Test Cases) ─────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openAddTestCasePopup();
    await captureScreenshot(page, 'Step 1-4: Create Test Cases popup');

    // ─── Step 5-6: ADD ROW enabled → click → a new row is added ─────────────────────────
    await expect(authorPage.createPopupAddRow).toBeEnabled();
    const before = await authorPage.getCreatePopupRowCount();
    await authorPage.addCreateRow();
    expect(await authorPage.getCreatePopupRowCount(), 'a new row was added').toBe(before + 1);
    await captureScreenshot(page, 'Step 5-6: Row added');

    // ─── Step 8-9: Delete icon enabled → delete the added row (removed) ────────────────
    await expect(authorPage.createPopupDeleteIcons.first()).toBeVisible();
    await authorPage.deleteCreateRow(before); // delete the newly added (last) row
    expect(await authorPage.getCreatePopupRowCount(), 'the row was removed').toBe(before);
    await captureScreenshot(page, 'Step 8-9: Row deleted');

    // ─── Step 10-12: CLOSE → popup closes ──────────────────────────────────────────────
    await expect(authorPage.createPopupClose).toBeEnabled();
    await authorPage.closeAddTestCasePopup();
    await expect(authorPage.createPopup).toBeHidden();
    await captureScreenshot(page, 'Step 10-12: Popup closed');
  });

});
