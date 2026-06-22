/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_005
 * Test Name    : Verify Defect Search by Invalid Defect ID
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                an invalid Defect ID, so that no unrelated defects are displayed.
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
 *   3. Enter an invalid Defect ID in the Summary/Defect ID field.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_005 | Verify Defect Search by Invalid Defect ID', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    // Expected: Defect page displayed; project defects loaded
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter an invalid Defect ID ───────────────────────────────────
    // Expected: Invalid Defect ID should be accepted in the search field
    await defectTabPage.fillSummaryOrId(EXPECTED.defect.invalidDefectId);
    await expect(defectTabPage.summaryDefectIdInput).toHaveValue(EXPECTED.defect.invalidDefectId);
    await captureScreenshot(page, "Step 3: Enter an invalid Defect ID");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Right panel shows "No defects found. Use the filters to search for defects."
    await defectTabPage.clickSearch();
    await defectTabPage.verifyNoDefectsMessage();
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
