/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_022
 * Test Name    : Verify Defect Search by Valid Created By Value
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid Created By value, so that I can find specific defects created by
 *                a particular user.
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
 *   3. Select a valid value in the Created By dropdown.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_022 | Verify Defect Search by Valid Created By Value', async ({ page }) => {
    // BLOCKED (data): No selectable Created By value owns any defects. The Created By
    // dropdown exposes ~852 users, but the seeded defects were all created by a qTest
    // integration account that is NOT present in that list — sampling 12+ users across the
    // whole list (including every Assigned To / Business User who appears in the grid)
    // returned "Total 0 Entries" for each. The SRS expectation "Matching defects should be
    // displayed" therefore cannot be satisfied until a creator becomes selectable. The body
    // below is the intended verification and will work once such data exists.
    test.fixme(true, 'No selectable Created By value returns defects in this data (creators are a non-listed qTest integration account).');

    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Select a valid value in the Created By dropdown ───────────────
    // Expected: Selected Created By value should be displayed in the field. There is no
    //           Created By grid column to read from, so the known creator of the seeded
    //           defects is used (see testData).
    await defectTabPage.selectDropdownValue('Created By', EXPECTED.defect.validCreatedBy);
    await expect(defectTabPage.createdByDropdown).toHaveValue(EXPECTED.defect.validCreatedBy);
    await captureScreenshot(page, "Step 3: Select a valid value in the Created By dropdown");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
