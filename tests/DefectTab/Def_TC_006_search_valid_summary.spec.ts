/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_006
 * Test Name    : Verify Defect Search by Valid Defect Summary
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using
 *                a valid defect summary, so that I can locate defects by summary text.
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
 *   3. Enter a valid defect summary in the Summary/Defect ID field.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_006 | Verify Defect Search by Valid Defect Summary', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    // Expected: Defect page displayed; project defects loaded
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // A real (defect, summary) pair is read from the loaded list so the search is
    // data-independent.
    const defectId = await defectTabPage.getFirstDefectId();
    const summary  = await defectTabPage.getSummaryForDefect(defectId);
    expect(summary.length).toBeGreaterThan(0);
    await captureScreenshot(page, "Steps 1-2: Open Defect tab, project defects loaded");

    // ─── Step 3: Enter a valid defect summary ─────────────────────────────────
    // Expected: Entered summary should be visible in the field
    await defectTabPage.fillSummaryOrId(summary);
    await expect(defectTabPage.summaryDefectIdInput).toHaveValue(summary);
    await captureScreenshot(page, "Step 3: Enter a valid defect summary");

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defect should be displayed in the right panel
    await defectTabPage.clickSearch();

    await defectTabPage.verifyDefectVisible(defectId);
    expect(await defectTabPage.getDefectIdsOnPage()).toContain(defectId);
    await captureScreenshot(page, "Step 4: Click the Search button");
  });

});
