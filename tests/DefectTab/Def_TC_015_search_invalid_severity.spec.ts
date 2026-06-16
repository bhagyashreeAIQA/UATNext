/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_015
 * Test Name    : Verify Defect Search by Invalid Severity
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                an invalid Severity value, so that invalid selections do not return any
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
 *   3. Enter an invalid Severity value in the Severity dropdown.
 *   4. Click the Search button.
 *
 * Expected:
 *   - Entered value should be visible.
 *   - Dropdown shows "Please Select" and "No results found".
 *   - Search is not executed (no valid severity is committed).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_015 | Verify Defect Search by Invalid Severity', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // ─── Step 3: Enter an invalid Severity value in the Severity dropdown ──────
    // Expected: Entered value visible; dropdown shows "Please Select" + "No results found"
    await defectTabPage.typeInDropdown('Severity', EXPECTED.defect.invalidDropdownValue);
    await expect(defectTabPage.severityDropdown).toHaveValue(EXPECTED.defect.invalidDropdownValue);

    await expect
      .poll(() => defectTabPage.getDropdownListText('Severity'), { timeout: 10000 })
      .toContain(EXPECTED.defect.dropdownNoResultsText);
    expect(await defectTabPage.getDropdownListText('Severity')).toContain('Please Select');

    // ─── Step 4: No valid severity is committed → no severity filter is applied ─
    expect(await defectTabPage.severityDropdown.inputValue()).toBe(EXPECTED.defect.invalidDropdownValue);
  });

});
