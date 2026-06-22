/**
 * Feature      : Defect
 * Sub-Feature  : Defect List
 * Test Case ID : Def_TC_003
 * Test Name    : Verify Defect List Display
 *
 * Description  : As a Test Engineer, I want to verify that the defect list loads
 *                correctly, so that users can view project defects.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. Test data is available.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a project that contains defects.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect List', () => {

  test('Def_TC_003 | Verify Defect List Display', async ({ page }) => {
    // ─── Step 1: Click on the Defect tab ──────────────────────────────────────
    // Expected: Defect page should be displayed
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await captureScreenshot(page, "Step 1: Click on the Defect tab");

    // ─── Step 2: Select a project that contains defects ───────────────────────
    // Expected: All defects related to the selected project should be displayed
    await defectTabPage.verifyProjectSelected();
    await defectTabPage.verifyDefectsLoaded();

    // Pagination should reflect the populated list, and work when multiple pages exist.
    await defectTabPage.verifyPaginationVisible();
    const total = await defectTabPage.getTotalEntries();
    expect(total).toBeGreaterThan(0);

    const firstPageIds = await defectTabPage.getDefectIdsOnPage();
    expect(firstPageIds.length).toBeGreaterThan(0);

    if (total > firstPageIds.length) {
      // Multiple pages exist → Next should advance to page 2 and load a different set.
      expect(await defectTabPage.getCurrentPageNumber()).toBe(1);

      await defectTabPage.nextButton.click();
      await expect
        .poll(() => defectTabPage.getCurrentPageNumber(), { timeout: 15000 })
        .toBe(2);

      // The page indicator flips to 2 before the rows finish streaming in, and the grid
      // is momentarily empty mid-transition. Wait for a populated set that differs from
      // page 1, rather than reading eagerly (an empty transient set would falsely satisfy
      // a plain "not equal" check).
      await expect
        .poll(async () => {
          const ids = await defectTabPage.getDefectIdsOnPage();
          return ids.length > 0 && JSON.stringify(ids) !== JSON.stringify(firstPageIds);
        }, { timeout: 15000 })
        .toBe(true);

      // Returning to the first page restores the original set.
      await defectTabPage.firstPageButton.click();
      await expect
        .poll(() => defectTabPage.getCurrentPageNumber(), { timeout: 15000 })
        .toBe(1);
      await expect
        .poll(() => defectTabPage.getDefectIdsOnPage(), { timeout: 15000 })
        .toEqual(firstPageIds);
    }
    await captureScreenshot(page, "Step 2: Select a project that contains defects");
  });

});
