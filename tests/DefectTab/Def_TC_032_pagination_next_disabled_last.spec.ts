/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_032
 * Test Name    : Verify Next Page Navigation While on Last Page
 *
 * Description  : As a Test Engineer, I want to verify that next-page navigation is disabled
 *                on the last page, so that users cannot navigate beyond available pages.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 50 defects exist (multiple pages).
 *   5. User is on the last page.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the ">" (Next) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_032 | Verify Next Page Navigation While on Last Page', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyPaginationVisible();
    expect(await defectTabPage.getLastPageNumber()).toBeGreaterThan(1);

    // Pre-condition: be on the last page
    await defectTabPage.goToLastPage();
    const lastPage = await defectTabPage.getCurrentPageNumber();
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Steps 3-4: Next button is disabled; clicking it does not navigate ─────
    expect(await defectTabPage.isPaginationControlDisabled('Next')).toBe(true);

    await defectTabPage.nextButton.click();
    await page.waitForTimeout(1500);
    expect(await defectTabPage.getCurrentPageNumber()).toBe(lastPage);
    await captureScreenshot(page, "Steps 3-4: Next button is disabled; clicking it does not navigate");
  });

});
