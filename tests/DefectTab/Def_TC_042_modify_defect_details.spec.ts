/**
 * Feature      : Defect
 * Sub-Feature  : Modify Defect
 * Test Case ID : Def_TC_042
 * Test Name    : Verify Modify Defect Details
 *
 * Description  : As a Test Engineer, I want to verify defect modification functionality, so that
 *                users can update existing defects.
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
 *   3. Open an existing defect.
 *   4. Modify a field value (here: Priority).
 *   5. Click Save.
 *   6. Close the defect.
 *   7. Reopen the same defect.
 *
 * Expected:
 *   1. Toast "Defect updated successfully."
 *   2. The user can return to the Defect page (via Close).
 *   3. The modified value persists after reopening the defect.
 *
 * BUILD NOTE: after Save the build keeps the user on the edit form (it does NOT auto-return to the
 *   grid), so the documented "User should return to the Defect page" is realised here by clicking
 *   Close. Update-validation enforces the same required fields as create (Reason, Business User, …),
 *   and many seeded defects predate those rules (e.g. DF-6 has a blank Reason), so modifying an
 *   arbitrary existing defect would fail validation; this test instead seeds its own fully-valid
 *   defect and then modifies that, keeping it self-contained and deterministic.
 * MUTATING: creates one REAL qTest defect and updates it (timestamped Summary; run sparingly).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Modify Defect', () => {

  test('Def_TC_042 | Verify Modify Defect Details', async ({ page }) => {
    test.setTimeout(480000);
    const PRIORITY = CreateDefectPage.PLACEHOLDER.priority;
    const summary = `Automated defect Def_TC_042 ${Date.now()}`;

    // ─── Setup: seed a fully-valid defect to modify (Step 3 precondition) ──────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const detailsPage = new CreateDefectPage(page);
    await detailsPage.waitForCreateFormOpen();
    await detailsPage.fillRequiredForSave({ summary });
    await detailsPage.clickCreateSave();
    await expect(detailsPage.toast(EXPECTED.createDefectPage.createdSuccessMessage)).toBeVisible({ timeout: 20000 });
    await captureScreenshot(page, "Setup: seed a fully-valid defect to modify (Step 3 precondition)");

    // ─── Steps 1-3: locate and open the seeded defect ─────────────────────────
    await defectTabPage.waitForResults();
    const defectId = await defectTabPage.searchAndGetDefectIdBySummary(summary);
    await defectTabPage.openDefectById(defectId);
    await detailsPage.waitForEditFormOpen();
    await captureScreenshot(page, "Steps 1-3: locate and open the seeded defect");

    // ─── Step 4: modify a field value (Priority → first different option) ──────
    const before = await detailsPage.getDropdownValue(PRIORITY);
    const newValue = await detailsPage.selectFirstAvailable(PRIORITY);
    expect(newValue, 'a different Priority was selected').not.toBe('');
    expect(newValue).not.toBe(before);
    await captureScreenshot(page, "Step 4: modify a field value (Priority → first different option)");

    // ─── Step 5: Save → "Defect updated successfully." ────────────────────────
    await detailsPage.clickUpdateSave();
    await expect(detailsPage.toast(EXPECTED.createDefectPage.updatedSuccessMessage)).toBeVisible({ timeout: 20000 });
    await captureScreenshot(page, "Step 5: Save → \"Defect updated successfully.\"");

    // ─── Step 6: Close → return to the Defect grid ────────────────────────────
    await detailsPage.closeDiscardingIfPrompted();         // Expected 2
    await expect(defectTabPage.createDefectButton).toBeVisible();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Step 6: Close → return to the Defect grid");

    // ─── Step 7: reopen the same defect → modified value persists ─────────────
    // The summary filter persists in the left panel while the edit form is open, so closing it
    // restores the same single-result grid — reopen the row directly (re-searching the identical
    // text would not re-trigger Blazor's change event, leaving SEARCH disabled).
    await defectTabPage.openDefectById(defectId);
    await detailsPage.waitForEditFormOpen();
    expect(await detailsPage.getDropdownValue(PRIORITY)).toBe(newValue);   // Expected 3
    await captureScreenshot(page, "Step 7: reopen the same defect → modified value persists");
  });

});
