/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_020
 * Test Name    : Verify Defect Search by Valid Business User Value
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Business User value, so that I can filter defects associated with
 *                a specific business user.
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
 *   3. Select a valid Business User value.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_020 | Verify Defect Search by Valid Business User Value', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // A Business User value that owns defects is read from the loaded grid so the filter
    // is guaranteed to return matches (the Business User dropdown is an 800+ user list, so
    // an arbitrary user would usually have no defects).
    const businessUser = await defectTabPage.getFirstNonEmptyColumnValue('Business User');
    expect(businessUser, 'A loaded defect should expose a Business User value').toBeTruthy();

    // ─── Step 3: Select a valid Business User value ───────────────────────────
    // Expected: Selected Business User value should be displayed in the field
    await defectTabPage.selectDropdownValue('Business User', businessUser!);
    await expect(defectTabPage.businessUserDropdown).toHaveValue(businessUser!);

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await defectTabPage.verifyAllRowsMatchColumn('Business User', businessUser!);
  });

});
