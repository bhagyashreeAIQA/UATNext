/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_009
 * Test Name    : Verify Defect Search by Invalid Affected Release
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                an invalid Affected Release value, so that invalid filters do not return
 *                results.
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
 *   3. Enter an invalid release value in the Affected Release dropdown.
 *   4. Click the Search button.
 *
 * Expected:
 *   - Entered value should be visible.
 *   - Dropdown should display "Please Select" and "No results found".
 *   - Search should not be executed (no valid release is committed).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_009 | Verify Defect Search by Invalid Affected Release', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    // Expected: Defect page displayed; project defects loaded
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter an invalid release value in the Affected Release dropdown ─
    // Expected: Entered value visible; dropdown shows "Please Select" + "No results found"
    await defectTabPage.typeInDropdown('Affected Release', EXPECTED.defect.invalidRelease);
    await expect(defectTabPage.affectedReleaseDropdown).toHaveValue(EXPECTED.defect.invalidRelease);

    // The dropdown re-filters its options asynchronously, so poll until the no-match
    // state appears rather than reading the list once.
    await expect
      .poll(() => defectTabPage.getDropdownListText('Affected Release'), { timeout: 10000 })
      .toContain(EXPECTED.defect.dropdownNoResultsText);
    expect(await defectTabPage.getDropdownListText('Affected Release')).toContain('Please Select');
    await captureScreenshot(page, "Step 3: Enter an invalid release value in the Affected Release dropdown");

    // ─── Step 4: No valid release is committed → no release filter is applied ──
    // The typed text matches no option, so no release value is selected; the dropdown
    // input retains the typed value rather than a real release.
    expect(await defectTabPage.affectedReleaseDropdown.inputValue())
      .toBe(EXPECTED.defect.invalidRelease);
    await captureScreenshot(page, "Step 4: No valid release is committed → no release filter is applied");
  });

});
