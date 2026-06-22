/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_018
 * Test Name    : Verify Defect Search by Valid Assigned To Value
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Assigned To value, so that I can filter defects assigned to a
 *                specific user.
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
 *   3. Select a valid value in the Assigned To dropdown.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_018 | Verify Defect Search by Valid Assigned To Value', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // An Assigned To value that owns defects is read from the loaded grid so the filter
    // is guaranteed to return matches (the Assigned To dropdown is an 800+ user list, so
    // an arbitrary user would usually have no defects).
    const assignee = await defectTabPage.getFirstNonEmptyColumnValue('Assigned To');
    expect(assignee, 'A loaded defect should expose an Assigned To value').toBeTruthy();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Select a valid value in the Assigned To dropdown ──────────────
    // Expected: Selected Assigned To value should be displayed in the field
    await defectTabPage.selectDropdownValue('Assigned To', assignee!);
    await expect(defectTabPage.assignedToDropdown).toHaveValue(assignee!);
    await captureScreenshot(page, "Step 3: Select a valid value in the Assigned To dropdown");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await defectTabPage.verifyAllRowsMatchColumn('Assigned To', assignee!);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
