/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_021
 * Test Name    : Verify Defect Search by Invalid Business User Value
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                an invalid Business User value, so that invalid selections do not return
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
 *   3. Enter an invalid Business User value in the Business User dropdown.
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

  test('Def_TC_021 | Verify Defect Search by Invalid Business User Value', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter an invalid Business User value ─────────────────────────
    // Expected: Entered value visible; dropdown shows "Please Select" + "No results found"
    await defectTabPage.typeInDropdown('Business User', EXPECTED.defect.invalidDropdownValue);
    await expect(defectTabPage.businessUserDropdown).toHaveValue(EXPECTED.defect.invalidDropdownValue);

    await expect
      .poll(() => defectTabPage.getDropdownListText('Business User'), { timeout: 10000 })
      .toContain(EXPECTED.defect.dropdownNoResultsText);
    expect(await defectTabPage.getDropdownListText('Business User')).toContain('Please Select');
    await captureScreenshot(page, "Step 3: Enter an invalid Business User value");

    // ─── Step 4: No valid user is committed → no Business User filter is applied ─
    expect(await defectTabPage.businessUserDropdown.inputValue()).toBe(EXPECTED.defect.invalidDropdownValue);
    await captureScreenshot(page, "Step 4: No valid user is committed → no Business User filter is applied");
  });

});
