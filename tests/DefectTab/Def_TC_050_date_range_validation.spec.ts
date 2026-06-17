/**
 * Feature      : Defect
 * Sub-Feature  : Defect Search – Date validation
 * Test Case ID : Def_TC_050
 * Test Name    : Verify Submitted After Date is Greater than Submitted Before Date
 *
 * Description  : As a Test Engineer, I want to verify date validation when Submitted After is later
 *                than Submitted Before.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into UATNext.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *   4. Test data is available.
 *
 * Steps:
 *   1. Navigate to Defect tab.
 *   2. Select a valid project.
 *   3. Enter Submitted After date as 20-04-2027.
 *   4. Attempt to enter Submitted Before date as 20-04-2026.
 *
 * Expected:
 *   1. The system prevents an invalid date selection.
 *   2. Dates prior to 20-04-2027 are disabled for Submitted Before.
 *   3. The user cannot create an invalid date range.
 *
 * BUILD NOTE: the app enforces this by coupling the two native date inputs — setting Submitted After
 *   applies its value as the `min` attribute of Submitted Before, so the picker disables every
 *   earlier date. This test sets Submitted After and asserts that coupling (the verifiable contract);
 *   the native picker, not the DOM value, is what blocks an earlier manual selection.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Defect | Sub-Feature: Defect Search – Date validation', () => {

  test('Def_TC_050 | Verify Submitted After Date is Greater than Submitted Before Date', async ({ page }) => {
    const { after } = EXPECTED.createDefectPage.dateValidation;

    // ─── Steps 1-2: Defect tab open, defects loaded ───────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();

    // ─── Step 3: enter Submitted After = 2027-04-20 ───────────────────────────
    await defectTabPage.setSubmittedAfter(after);
    await expect(defectTabPage.submittedAfterInput).toHaveValue(after);

    // ─── Step 4 / Expected: Submitted Before now disables earlier dates ────────
    // The coupling exposes itself as a `min` attribute equal to the Submitted After date, so every
    // date prior to 20-04-2027 is unselectable in the Submitted Before picker.
    await expect(defectTabPage.submittedBeforeInput).toHaveAttribute('min', after);
  });

});
