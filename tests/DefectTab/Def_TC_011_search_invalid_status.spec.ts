/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_011
 * Test Name    : Verify Defect Search by Invalid Defect Status
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                an invalid Status value, so that invalid selections do not return any
 *                defects.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. Test data is available.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Enter an invalid Status value in the Status dropdown.
 *   4. Click the Search button.
 *
 * Expected:
 *   - Project defects are loaded.
 *   - Dropdown shows "Please Select" and "No results found".
 *   - Search is not executed (no valid status is committed).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_011 | Verify Defect Search by Invalid Defect Status', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter an invalid Status value in the Status dropdown ──────────
    // Expected: Entered value visible; dropdown shows "Please Select" + "No results found"
    await defectTabPage.typeInDropdown('Status', EXPECTED.defect.invalidDropdownValue);
    await expect(defectTabPage.statusDropdown).toHaveValue(EXPECTED.defect.invalidDropdownValue);

    await expect
      .poll(() => defectTabPage.getDropdownListText('Status'), { timeout: 10000 })
      .toContain(EXPECTED.defect.dropdownNoResultsText);
    expect(await defectTabPage.getDropdownListText('Status')).toContain('Please Select');
    await captureScreenshot(page, "Step 3: Enter an invalid Status value in the Status dropdown");

    // ─── Step 4: No valid status is committed → no status filter is applied ────
    expect(await defectTabPage.statusDropdown.inputValue()).toBe(EXPECTED.defect.invalidDropdownValue);
    await captureScreenshot(page, "Step 4: No valid status is committed → no status filter is applied");
  });

});
