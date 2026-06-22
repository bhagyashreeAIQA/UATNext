/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_027
 * Test Name    : Verify Clear Button Functionality
 *
 * Description  : As a Test Engineer, I want to verify that the Clear button resets all
 *                filters except the Project dropdown, so that I can quickly return to the
 *                default defect list.
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
 *   3. Enter values in multiple filters.
 *   4. Click the Search button.
 *   5. Click the Clear button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_027 | Verify Clear Button Functionality', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    const project = (await defectTabPage.projectsDropdown.inputValue()).trim();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter values in multiple filters ─────────────────────────────
    const status = await defectTabPage.getFirstNonEmptyColumnValue('Status');
    const summaryDefectId = await defectTabPage.getFirstDefectId();
    await defectTabPage.selectDropdownValue('Status', status!);
    await defectTabPage.fillSummaryOrId(summaryDefectId);
    await captureScreenshot(page, "Step 3: Enter values in multiple filters");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed after search
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Step 4: Click the Search button");

    // ─── Step 5: Click the Clear button ───────────────────────────────────────
    // Expected: All filter fields reset; Project unchanged; default list restored
    await defectTabPage.clickClear();

    await expect(defectTabPage.statusDropdown).toHaveValue('');
    await expect(defectTabPage.summaryDefectIdInput).toHaveValue('');
    await expect(defectTabPage.affectedReleaseDropdown).toHaveValue('');
    await expect(defectTabPage.submittedAfterInput).toHaveValue('');
    await expect(defectTabPage.submittedBeforeInput).toHaveValue('');

    // Selected Project remains unchanged
    await expect(defectTabPage.projectsDropdown).toHaveValue(project);

    // Default defect list restored in the right panel
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 5: Click the Clear button");
  });

});
