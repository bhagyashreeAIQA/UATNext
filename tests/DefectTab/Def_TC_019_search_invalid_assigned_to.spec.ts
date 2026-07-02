/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_019
 * Test Name    : Verify Defect Search by Invalid Assigned To Value
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                an invalid Assigned To value, so that invalid selections do not return
 *                any defects.
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
 *   3. Enter an invalid Assigned To value in the Assigned To dropdown.
 *   4. Click the Search button.
 *
 * Expected:
 *   - Entered value should be visible.
 *   - Dropdown shows "Please Select" and "No results found".
 *   - Search is not executed (no valid user is committed).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_019 | Verify Defect Search by Invalid Assigned To Value', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter an invalid Assigned To value ───────────────────────────
    // Expected: Entered value visible; dropdown shows "Please Select" + "No results found"
    await defectTabPage.typeInDropdown('Assigned To', EXPECTED.defect.invalidDropdownValue);
    await expect(defectTabPage.assignedToDropdown).toHaveValue(EXPECTED.defect.invalidDropdownValue);

    await expect
      .poll(() => defectTabPage.getDropdownListText('Assigned To'), { timeout: 10000 })
      .toContain(EXPECTED.defect.dropdownNoResultsText);
    expect(await defectTabPage.getDropdownListText('Assigned To')).toContain('Please Select');
    await captureScreenshot(page, "Step 3: Enter an invalid Assigned To value");

    // ─── Step 4: No valid user is committed → no Assigned To filter is applied ─
    expect(await defectTabPage.assignedToDropdown.inputValue()).toBe(EXPECTED.defect.invalidDropdownValue);
    await captureScreenshot(page, "Step 4: No valid user is committed → no Assigned To filter is applied");
  });

});
