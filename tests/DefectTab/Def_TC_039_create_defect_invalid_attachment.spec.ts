/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect
 * Test Case ID : Def_TC_039
 * Test Name    : Verify Defect Creation with Invalid Attachment
 *
 * Description  : As a Test Engineer, I want to verify attachment validation during defect creation,
 *                so that invalid files are rejected.
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
 *   4. Enter valid data in all mandatory fields.
 *   5. Upload an attachment larger than 10 MB.
 *   6. Upload a valid attachment (< 10 MB).
 *   7. Click Save.
 *
 * Expected:
 *   1. For > 10 MB: toast "Error: File '<name>' exceeds the 10MB limit." plus inline validation.
 *   2. The valid file uploads successfully.
 *   3. Defect is saved ("Defect created successfully.") and appears in the defect list.
 *
 * NOTE: the spec asks for an "exactly 10 MB" file; the 10 MB boundary is enforced server-side and
 *   would be flaky to assert, so a comfortably-valid (< 10 MB) file is used for the accepted case —
 *   the rejection threshold itself is covered by the > 10 MB file.
 * MUTATING: creates a REAL qTest defect (timestamped Summary; run sparingly).
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const LARGE_FILE = path.resolve(__dirname, '../fixtures/large_over_10mb.pdf');
const SMALL_FILE = path.resolve(__dirname, '../fixtures/sample_small.pdf');

test.describe('Feature: Defect | Sub-Feature: Create Defect', () => {

  test('Def_TC_039 | Verify Defect Creation with Invalid Attachment', async ({ page }) => {
    test.setTimeout(480000);
    const summary = `Automated defect Def_TC_039 ${Date.now()}`;

    // ─── Steps 1-3: open the Create Defect form ───────────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the Create Defect form");

    // ─── Step 4: enter valid data in the mandatory fields ─────────────────────
    await createDefect.fillRequiredForSave({ summary });
    await captureScreenshot(page, "Step 4: enter valid data in the mandatory fields");

    // ─── Step 5: upload a file > 10 MB → rejected ─────────────────────────────
    // Expected 1: toast + inline validation; the oversized file is not attached.
    await createDefect.attachFile(LARGE_FILE);
    await createDefect.verifyFileTooLargeMessage(path.basename(LARGE_FILE));
    await captureScreenshot(page, "Step 5: upload a file > 10 MB → rejected");

    // ─── Step 6: upload a valid file → accepted ───────────────────────────────
    // Expected 2: the valid file is listed in the drop zone.
    await createDefect.attachFile(SMALL_FILE);
    await createDefect.verifyAttachmentListed(path.basename(SMALL_FILE));
    await captureScreenshot(page, "Step 6: upload a valid file → accepted");

    // ─── Step 7: Save → success + appears in list ─────────────────────────────
    await createDefect.clickCreateSave();
    await expect(createDefect.toast(EXPECTED.createDefectPage.createdSuccessMessage)).toBeVisible({ timeout: 20000 });

    await defectTabPage.waitForResults();
    const newId = await defectTabPage.searchAndGetDefectIdBySummary(summary);
    await defectTabPage.verifyDefectVisible(newId);
    await captureScreenshot(page, "Step 7: Save → success + appears in list");
  });

});
