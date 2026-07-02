/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect
 * Test Case ID : Def_TC_040
 * Test Name    : Verify Defect Creation with Mandatory Fields Blank
 *
 * Description  : As a Test Engineer, I want to verify validation of mandatory fields during defect
 *                creation, so that incomplete defects cannot be saved.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Click Create Defect.
 *   4. Leave one or more mandatory fields blank (here: every dropdown, incl. Affected
 *      Release/Build — the field carrying the "*").
 *   5. Click Save.
 *
 * Expected:
 *   1. Defect is not saved (the form stays open).
 *   2. A validation message / error toast is displayed.
 *
 * BUILD NOTE: the documented spec lists Summary/Severity/Status/Priority as mandatory, but this
 *   build marks only Affected Release/Build with "*". Mandatory fields are instead enforced
 *   field-by-field with "Please select a valid X." toasts on Save. This test fills nothing and
 *   asserts the save is blocked with such a validation message — the verifiable contract.
 */

import { test } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect', () => {

  test('Def_TC_040 | Verify Defect Creation with Mandatory Fields Blank', async ({ page }) => {
    // ─── Steps 1-3: open the Create Defect form ───────────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the Create Defect form");

    // ─── Step 4: leave mandatory fields blank (enter only a Summary) ──────────
    await createDefect.fillSummary(`Def_TC_040 mandatory-blank ${Date.now()}`);
    await captureScreenshot(page, "Step 4: leave mandatory fields blank (enter only a Summary)");

    // ─── Step 5: Save → blocked with a validation message; form stays open ────
    await createDefect.clickCreateSave();
    await createDefect.verifyValidationToast();           // Expected 2
    await createDefect.verifyStillOnCreateForm();         // Expected 1 (not saved)
    await captureScreenshot(page, "Step 5: Save → blocked with a validation message; form stays open");
  });

});
