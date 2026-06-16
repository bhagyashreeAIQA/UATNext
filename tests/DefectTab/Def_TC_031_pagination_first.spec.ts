/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_031
 * Test Name    : Verify First Page Navigation
 *
 * Description  : As a Test Engineer, I want to verify first-page navigation functionality,
 *                so that I can quickly return to the beginning of the defect list.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 100 defects exist (multiple pages).
 *   5. User is not on the first page.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the "<<" (First Page) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_031 | Verify First Page Navigation', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyPaginationVisible();
    expect(await defectTabPage.getLastPageNumber()).toBeGreaterThan(1);

    // Pre-condition: move off the first page (to the last page)
    await defectTabPage.goToLastPage();
    expect(await defectTabPage.getCurrentPageNumber()).toBeGreaterThan(1);

    // ─── Steps 3-4: Click the First Page button ───────────────────────────────
    // Expected: User is navigated to the first page; page number displays 1
    await defectTabPage.goToFirstPage();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);
  });

});
