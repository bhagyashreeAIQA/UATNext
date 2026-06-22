/**
 * Feature      : Defect
 * Sub-Feature  : Pagination
 * Test Case ID : Def_TC_029
 * Test Name    : Verify Previous Page Navigation
 *
 * Description  : As a Test Engineer, I want to verify previous-page navigation
 *                functionality, so that I can return to earlier pages of defect records.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. More than 50 defects exist (multiple pages).
 *   5. User is on page 2 or later.
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Scroll to the bottom of the defect grid.
 *   4. Click the "<" (Previous) button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Pagination', () => {

  test('Def_TC_029 | Verify Previous Page Navigation', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.verifyPaginationVisible();
    expect(await defectTabPage.getLastPageNumber()).toBeGreaterThan(1);

    // Pre-condition: be on page 2
    await defectTabPage.goToNextPage();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(2);
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Steps 3-4: Click the Previous button ─────────────────────────────────
    // Expected: User is navigated to the previous page; page number updates to 1
    await defectTabPage.goToPreviousPage();
    expect(await defectTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Steps 3-4: Click the Previous button");
  });

});
