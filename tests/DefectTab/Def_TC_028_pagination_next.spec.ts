/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_028
 * Test Name    : Verify Next Page Navigation
 *
 * Description  : As a Test Engineer, I want to verify next-page navigation functionality,
 *                so that I can browse additional defect records.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 50 defects exist (multiple pages).
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the ">" (Next) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_028 | Verify Next Page Navigation', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // Pre-condition: multiple pages must exist
    await defectTabPage.verifyPaginationVisible();
    expect(await defectTabPage.getLastPageNumber()).toBeGreaterThan(1);
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);

    // ─── Steps 3-4: Click the Next button ─────────────────────────────────────
    // Expected: User is navigated to the next page; page number updates to 2
    await defectTabPage.goToNextPage();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(2);
  });

});
