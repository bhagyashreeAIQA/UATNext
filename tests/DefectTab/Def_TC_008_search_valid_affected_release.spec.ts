/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_008
 * Test Name    : Verify Defect Search by Valid Affected Release
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Affected Release value, so that I can filter defects by release.
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
 *   3. Select a valid value in the Affected Release dropdown.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_008 | Verify Defect Search by Valid Affected Release', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    // Expected: Defect page displayed; project defects loaded
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // A real Affected Release value is read from the dropdown (first option after the
    // "Please Select" placeholder) so the test is data-independent.
    const options = await defectTabPage.getDropdownOptions('Affected Release');
    const validRelease = options.find(o => o && !/please select/i.test(o));
    expect(validRelease, 'Affected Release dropdown should expose at least one release').toBeTruthy();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Select a valid value in the Affected Release dropdown ─────────
    // Expected: Selected release value should be displayed in the field
    await defectTabPage.selectDropdownValue('Affected Release', validRelease!);
    await expect(defectTabPage.affectedReleaseDropdown).toHaveValue(validRelease!);
    await captureScreenshot(page, "Step 3: Select a valid value in the Affected Release dropdown");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
