/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Team configuration
 * Test Case ID : Def_TC_044
 * Test Name    : Verify Validation When Team is Mandatory but Not Selected
 *
 * Description  : As a Test Engineer, I want to verify validation when Team is mandatory but left
 *                blank.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User has access to multiple Business Units.
 *   3. Team is mandatory for the selected Business Unit.
 *
 * Steps:
 *   1. Select a Business Unit where Team is mandatory.
 *   2. Navigate to Defect tab.
 *   3. Click New Defect.
 *   4. Fill all mandatory fields except Team.
 *   5. Click Save.
 *
 * Expected:
 *   1. Defect is not saved.
 *   2. A validation message / error toast is displayed.
 *
 * BLOCKED (test.fixme): requires a Business Unit configured with Team as mandatory (see Def_TC_043).
 *   Enable once such a BU is available; the body fills every field except Team and asserts the save
 *   is blocked with a validation toast.
 */

import { test } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Team configuration', () => {

  test('Def_TC_044 | Verify Validation When Team is Mandatory but Not Selected', async ({ page }) => {
    // ─── Steps 1-2: (BU with mandatory Team) → Defect tab loaded ─────────────────────
    // TODO: select a Business Unit where Team is configured mandatory before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, 'Step 1-2: Defect tab loaded');

    // ─── Step 3: open the New Defect form ────────────────────────────────────────────
    await defectTabPage.openCreateDefectForm();
    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, 'Step 3: New Defect form open');

    // ─── Step 4: fill all mandatory fields EXCEPT Team ───────────────────────────────
    await createDefect.fillRequiredForSave({ summary: `Def_TC_044 ${Date.now()}`, skip: ['team'] });
    await captureScreenshot(page, 'Step 4: Required fields filled, Team left blank');

    // ─── Step 5 / Expected: save blocked with a validation toast, still on the form ───
    await createDefect.clickCreateSave();
    await createDefect.verifyValidationToast();
    await createDefect.verifyStillOnCreateForm();
    await captureScreenshot(page, 'Step 5: Save blocked — validation toast shown');
  });

});
