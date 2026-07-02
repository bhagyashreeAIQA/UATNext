/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_033
 * Test Name    : Verify Previous Page Navigation While on First Page
 *
 * Description  : As a Test Engineer, I want to verify that previous-page navigation is
 *                disabled on the first page, so that users cannot navigate before page one.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 50 defects exist (multiple pages).
 *   5. User is on the first page.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the "<" (Previous) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_033 | Verify Previous Page Navigation While on First Page', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded (page 1 by default) ─
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyPaginationVisible();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded (page 1 by default)");

    // ─── Steps 3-4: Previous button is disabled; clicking it does not navigate ─
    expect(await defectTabPage.isPaginationControlDisabled('Previous')).toBe(true);

    await defectTabPage.previousButton.click();
    await page.waitForTimeout(1500);
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Steps 3-4: Previous button is disabled; clicking it does not navigate");
  });

});
