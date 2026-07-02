/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_026
 * Test Name    : Verify Defect Search Using Multiple Filters
 *
 * Description  : As a Test Engineer, I want to verify that multiple filters can be
 *                combined, so that I can retrieve precise defect search results.
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
 *   3. Enter valid values in two or more filter fields.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_026 | Verify Defect Search Using Multiple Filters', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // Status and Severity are read from the same (first) loaded defect, so the combined
    // filter is guaranteed to match at least that defect (data-independent).
    const status   = await defectTabPage.getFirstNonEmptyColumnValue('Status');
    const severity = await defectTabPage.getFirstNonEmptyColumnValue('Severity');
    expect(status, 'A loaded defect should expose a Status value').toBeTruthy();
    expect(severity, 'A loaded defect should expose a Severity value').toBeTruthy();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter valid values in two filter fields ──────────────────────
    // Expected: Selected filter values should be visible
    await defectTabPage.selectDropdownValue('Status', status!);
    await defectTabPage.selectDropdownValue('Severity', severity!);
    await expect(defectTabPage.statusDropdown).toHaveValue(status!);
    await expect(defectTabPage.severityDropdown).toHaveValue(severity!);
    await captureScreenshot(page, "Step 3: Enter valid values in two filter fields");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Search executes; only defects matching ALL selected filters are shown
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await defectTabPage.verifyAllRowsMatchColumn('Status', status!);
    await defectTabPage.verifyAllRowsMatchColumn('Severity', severity!);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
