/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_016
 * Test Name    : Verify Defect Search by Valid Priority
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Priority value, so that I can filter defects by priority.
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
 *   3. Select a valid Priority value.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_016 | Verify Defect Search by Valid Priority', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // A Priority value that owns defects is read from the loaded grid so the filter is
    // guaranteed to return matches (data-independent).
    const priority = await defectTabPage.getFirstNonEmptyColumnValue('Priority');
    expect(priority, 'A loaded defect should expose a Priority value').toBeTruthy();

    // ─── Step 3: Select a valid Priority value ────────────────────────────────
    // Expected: Selected Priority value should be displayed in the field
    await defectTabPage.selectDropdownValue('Priority', priority!);
    await expect(defectTabPage.priorityDropdown).toHaveValue(priority!);

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await defectTabPage.verifyAllRowsMatchColumn('Priority', priority!);
  });

});
