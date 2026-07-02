/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_030
 * Test Name    : Verify Last Page Navigation
 *
 * Description  : As a Test Engineer, I want to verify last-page navigation functionality,
 *                so that I can quickly access the final page of defect records.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 100 defects exist (multiple pages).
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the ">>" (Last Page) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_030 | Verify Last Page Navigation', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyPaginationVisible();

    const lastPage = await defectTabPage.getLastPageNumber();
    expect(lastPage).toBeGreaterThan(1);
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Steps 3-4: Click the Last Page button ────────────────────────────────
    // Expected: User is navigated to the last available page
    await defectTabPage.goToLastPage();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(lastPage);
    await captureScreenshot(page, "Steps 3-4: Click the Last Page button");
  });

});
