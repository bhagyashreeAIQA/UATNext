/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_014
 * Test Name    : Verify Defect Search by Valid Severity
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Severity value, so that I can filter defects by severity.
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
 *   3. Select a valid Severity value.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_014 | Verify Defect Search by Valid Severity', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // A Severity value that owns defects is read from the loaded grid so the filter is
    // guaranteed to return matches (data-independent).
    const severity = await defectTabPage.getFirstNonEmptyColumnValue('Severity');
    expect(severity, 'A loaded defect should expose a Severity value').toBeTruthy();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Select a valid Severity value ────────────────────────────────
    // Expected: Selected Severity value should be displayed in the field
    await defectTabPage.selectDropdownValue('Severity', severity!);
    await expect(defectTabPage.severityDropdown).toHaveValue(severity!);
    await captureScreenshot(page, "Step 3: Select a valid Severity value");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await defectTabPage.verifyAllRowsMatchColumn('Severity', severity!);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
