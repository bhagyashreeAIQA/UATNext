/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_010
 * Test Name    : Verify Defect Search by Valid Status
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Status value, so that I can filter defects by status.
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
 *   3. Select a valid Status value.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_010 | Verify Defect Search by Valid Status', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    // Expected: Defect page displayed; project defects loaded
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // Pick a Status that actually owns defects by reading it from the loaded grid, so the filter is
    // guaranteed to return matches (a dropdown option like "New" may have zero defects → empty grid).
    const status = (await defectTabPage.getFirstNonEmptyColumnValue('Status'))?.trim();
    expect(status, 'A loaded defect should expose a Status value').toBeTruthy();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Select a valid Status value ──────────────────────────────────
    // Expected: Selected Status value should be displayed in the field
    await defectTabPage.selectDropdownValue('Status', status!);
    await expect(defectTabPage.statusDropdown).toHaveValue(status!);
    await captureScreenshot(page, "Step 3: Select a valid Status value");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);

    // Every returned defect should carry the selected status.
    await defectTabPage.verifyAllRowsHaveStatus(status!);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
