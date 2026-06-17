/**
 * Feature      : Defect
 * Sub-Feature  : View Defect
 * Test Case ID : Def_TC_041
 * Test Name    : Verify View Defect Details Page UI
 *
 * Description  : As a Test Engineer, I want to verify that clicking a defect ID opens the defect
 *                details page, so that users can view complete defect information.
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
 *   3. Click any Defect ID from the grid.
 *
 * Expected:
 *   1. Defect details page opens; the breadcrumb shows the Defect ID.
 *   2. All documented fields are displayed (Save/Close, Summary, every dropdown, Description,
 *      Browse File, Linked Test Run section).
 *   3. Existing defect data is displayed (Summary + key fields are populated).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';

test.describe('Feature: Defect | Sub-Feature: View Defect', () => {

  test('Def_TC_041 | Verify View Defect Details Page UI', async ({ page }) => {
    // ─── Steps 1-2: Defect tab open, defects loaded ───────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();

    // ─── Step 3: open the first defect's details ──────────────────────────────
    const defectId = await defectTabPage.getFirstDefectId();
    expect(defectId).toMatch(/^DF-\d+$/);
    await defectTabPage.openDefectById(defectId);

    const detailsPage = new CreateDefectPage(page);
    await detailsPage.waitForEditFormOpen();

    // Expected 1: breadcrumb shows the Defect ID.
    expect(await detailsPage.getBreadcrumbText()).toContain(defectId);

    // Expected 2: all documented fields are present (edit form → update SAVE button).
    await detailsPage.verifyAllFieldsPresent(true);

    // Expected 3: existing defect data is shown (Summary + the mandatory Affected Release/Build).
    expect(await detailsPage.getSummaryValue()).not.toBe('');
    expect(await detailsPage.getDropdownValue(CreateDefectPage.PLACEHOLDER.affectedRelease)).not.toBe('');
  });

});
