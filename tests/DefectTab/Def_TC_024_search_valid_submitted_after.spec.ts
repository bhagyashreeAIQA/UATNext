/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search
 * Test Case ID : Def_TC_024
 * Test Name    : Verify Defect Search by Valid Submitted After Date
 *
 * Description  : As a Test Engineer, I want to verify defect search functionality using a
 *                valid Submitted After date, so that I can filter defects created after a
 *                specific date.
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
 *   3. Enter a valid Submitted After date.
 *   4. Click the Search button.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Defect | Sub-Feature: Defect Search', () => {

  test('Def_TC_024 | Verify Defect Search by Valid Submitted After Date', async ({ page }) => {
    // ─── Steps 1-2: Open Defect tab, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyDefectsLoaded();

    // ─── Step 3: Enter a valid Submitted After date ───────────────────────────
    // Expected: Selected date should be displayed in the field
    await defectTabPage.setSubmittedAfter(EXPECTED.defect.submittedAfterDate);
    await expect(defectTabPage.submittedAfterInput).toHaveValue(EXPECTED.defect.submittedAfterDate);

    // ─── Step 4: Click the Search button ──────────────────────────────────────
    // Expected: Matching defects should be displayed in the right panel
    await defectTabPage.clickSearch();
    await defectTabPage.verifyDefectsLoaded();
    expect(await defectTabPage.getTotalEntries()).toBeGreaterThan(0);
  });

});
