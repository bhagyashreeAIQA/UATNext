/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect
 * Test Case ID : Def_TC_037
 * Test Name    : Verify Defect Creation with Valid Data
 *
 * Description  : As a Test Engineer, I want to verify defect creation using valid data, so that a
 *                new defect can be successfully created.
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
 *   4. Enter valid data in all fields.
 *   5. Upload an attachment smaller than 10 MB.
 *   6. Click Save.
 *
 * Expected:
 *   1. Create Defect form opens, entered values visible.
 *   2. Attachment uploads successfully.
 *   3. "Defect created successfully." and the new defect appears in the defect list.
 *
 * MUTATING: creates a REAL qTest defect (no automated deletion here). The Summary is timestamped so
 *   created defects are identifiable; run sparingly. On the DEFECT tab nothing is pre-populated, so
 *   the helper fills every dropdown that loads options (validation is enforced field-by-field).
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const SMALL_FILE = path.resolve(__dirname, '../fixtures/sample_small.pdf');

test.describe('Feature: Defect | Sub-Feature: Create Defect', () => {

  test('Def_TC_037 | Verify Defect Creation with Valid Data', async ({ page }) => {
    test.setTimeout(480000);
    const summary = `Automated defect Def_TC_037 ${Date.now()}`;

    // ─── Steps 1-3: open the Create Defect form ───────────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the Create Defect form");

    // ─── Step 4: enter valid data in the fields ───────────────────────────────
    // Expected: entered values are visible/retained in their fields.
    const selected = await createDefect.fillRequiredForSave({ summary });
    expect(await createDefect.getSummaryValue()).toBe(summary);
    expect(await createDefect.getDropdownValue(CreateDefectPage.PLACEHOLDER.affectedRelease)).not.toBe('');
    expect(selected.reason, 'Reason value selected').toBeTruthy();
    await captureScreenshot(page, "Step 4: enter valid data in the fields");

    // ─── Step 5: upload an attachment < 10 MB ─────────────────────────────────
    // Expected: attachment uploads successfully (file name listed in the drop zone).
    await createDefect.attachFile(SMALL_FILE);
    await createDefect.verifyAttachmentListed(path.basename(SMALL_FILE));
    await captureScreenshot(page, "Step 5: upload an attachment < 10 MB");

    // ─── Step 6: Save ─────────────────────────────────────────────────────────
    // Expected: "Defect created successfully." then the new defect appears in the list.
    await createDefect.clickCreateSave();
    await expect(createDefect.toast(EXPECTED.createDefectPage.createdSuccessMessage)).toBeVisible({ timeout: 20000 });

    await defectTabPage.waitForResults();
    const newId = await defectTabPage.searchAndGetDefectIdBySummary(summary);
    await defectTabPage.verifyDefectVisible(newId);
    await captureScreenshot(page, "Step 6: Save");
  });

});
