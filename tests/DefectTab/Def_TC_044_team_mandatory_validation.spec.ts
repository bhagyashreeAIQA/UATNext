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
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Team configuration', () => {

  test.fixme('Def_TC_044 | Verify Validation When Team is Mandatory but Not Selected', async ({ page }) => {
    // TODO: select a Business Unit where Team is configured mandatory before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();

    // Fill all mandatory fields except Team, then attempt to save.
    await createDefect.fillRequiredForSave({ summary: `Def_TC_044 ${Date.now()}`, skip: ['team'] });
    await createDefect.clickCreateSave();

    // Expected: not saved + validation toast.
    await createDefect.verifyValidationToast();
    await createDefect.verifyStillOnCreateForm();
  });

});
