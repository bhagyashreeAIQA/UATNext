/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_035
 * Test Name    : Verify First Page Navigation While on First Page
 *
 * Description  : As a Test Engineer, I want to verify that the First Page button is disabled
 *                when already on the first page.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 100 defects exist (multiple pages).
 *   5. User is on the first page.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the "<<" (First Page) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_035 | Verify First Page Navigation While on First Page', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded (page 1 by default) ─
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyPaginationVisible();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded (page 1 by default)");

    // ─── Steps 3-4: First Page button is disabled; clicking it does not navigate ─
    expect(await defectTabPage.isPaginationControlDisabled('First Page')).toBe(true);

    await defectTabPage.firstPageButton.click();
    await page.waitForTimeout(1500);
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Steps 3-4: First Page button is disabled; clicking it does not navigate");
  });

});
