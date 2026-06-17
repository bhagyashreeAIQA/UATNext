/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Team configuration
 * Test Case ID : Def_TC_045
 * Test Name    : Verify Successful Save When Team is Mandatory and Selected
 *
 * Description  : As a Test Engineer, I want to verify successful defect creation when Team is
 *                mandatory and provided.
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
 *   4. Enter valid values in all required fields including Team.
 *   5. Click Save.
 *
 * Expected:
 *   1. Defect is saved successfully.
 *   2. The new defect appears in the defect list.
 *
 * BLOCKED (test.fixme): requires a Business Unit configured with Team as mandatory (see Def_TC_043).
 *   Enable once such a BU is available. MUTATING when enabled (creates a REAL qTest defect).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Team configuration', () => {

  test.fixme('Def_TC_045 | Verify Successful Save When Team is Mandatory and Selected', async ({ page }) => {
    test.setTimeout(480000);
    const summary = `Automated defect Def_TC_045 ${Date.now()}`;

    // TODO: select a Business Unit where Team is configured mandatory before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();

    // Enter valid values in ALL required fields including Team.
    await createDefect.fillRequiredForSave({ summary });
    expect(await createDefect.getDropdownValue(CreateDefectPage.PLACEHOLDER.team)).not.toBe('');

    await createDefect.clickCreateSave();
    await expect(createDefect.toast(EXPECTED.createDefectPage.createdSuccessMessage)).toBeVisible({ timeout: 20000 });

    await defectTabPage.waitForResults();
    const newId = await defectTabPage.searchAndGetDefectIdBySummary(summary);
    await defectTabPage.verifyDefectVisible(newId);
  });

});
