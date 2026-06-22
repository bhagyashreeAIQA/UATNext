/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect
 * Test Case ID : Def_TC_038
 * Test Name    : Verify Close Button Functionality on Defect Creation Page
 *
 * Description  : As a Test Engineer, I want to verify the Close button when creating a defect, so
 *                that unsaved changes are handled correctly.
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
 *   4. Enter valid data and upload an attachment.
 *   5. Click Close.
 *   6. Click No on the confirmation popup.
 *   7. Click Close again.
 *   8. Click Yes on the confirmation popup.
 *
 * Expected:
 *   1. Popup: "You have unsaved changes. Are you sure you want to proceed?"
 *   2. No keeps the user on the form with entered data retained.
 *   3. Yes returns the user to the main Defect page; unsaved changes are discarded.
 *
 * NOTE: non-mutating — the defect is never saved (it is discarded via the Close confirmation).
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

const SMALL_FILE = path.resolve(__dirname, '../fixtures/sample_small.pdf');

test.describe('Feature: Defect | Sub-Feature: Create Defect', () => {

  test('Def_TC_038 | Verify Close Button Functionality on Defect Creation Page', async ({ page }) => {
    const summary = `Def_TC_038 unsaved-changes ${Date.now()}`;

    // ─── Steps 1-3: open the Create Defect form ───────────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the Create Defect form");

    // ─── Step 4: enter data + attach a file (so there are unsaved changes) ─────
    await createDefect.fillSummary(summary);
    await createDefect.attachFile(SMALL_FILE);
    await createDefect.verifyAttachmentListed(path.basename(SMALL_FILE));
    await captureScreenshot(page, "Step 4: enter data + attach a file (so there are unsaved changes)");

    // ─── Step 5-6: Close → No → stays on form with data retained ──────────────
    await createDefect.clickClose();
    await createDefect.verifyUnsavedChangesPopup();        // Expected 1
    await createDefect.confirmNo();                        // Expected 2
    await createDefect.verifyStillOnCreateForm();
    expect(await createDefect.getSummaryValue()).toBe(summary);
    await createDefect.verifyAttachmentListed(path.basename(SMALL_FILE));
    await captureScreenshot(page, "Step 5-6: Close → No → stays on form with data retained");

    // ─── Step 7-8: Close → Yes → discards and returns to the Defect grid ──────
    await createDefect.clickClose();
    await createDefect.verifyUnsavedChangesPopup();
    await createDefect.confirmYes();                       // Expected 3
    await expect(defectTabPage.createDefectButton).toBeVisible();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Step 7-8: Close → Yes → discards and returns to the Defect grid");
  });

});
