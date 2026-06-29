/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-097
 * Test Case Name: Validate Opening Attachments in Defect Details
 *
 * Description  : As a Test Engineer, I want to validate that attachments linked to a defect
 *                can be opened from the Defect Details page.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND a linked defect that contains at
 *                 least one attachment.
 *
 * Steps: open a run with a linked defect → click the linked Defect ID to open Defect Details →
 *        go to the Attachment section → open (download) an attachment → it opens successfully.
 *
 * LIVE NOTES (verified 2026-06-26):
 *   Clicking a linked-defect chip (`#defect button.test-run-div-wrapper`) opens the defect's
 *   details (the defect form, rendered in place; breadcrumb `.defect-breadcrumbs`). Its Attachment
 *   section is the `#drop-area`, where each file is a `li.file-item` with a Download (⬇) button.
 *   "Opening" an attachment triggers a browser download (not a new tab), so the test asserts a
 *   download event with the expected file name. Step 2 opens DF-232, which carries an uploaded
 *   attachment (bug1.png) and is already linked to the row-0 run (Dealer Master / TR-1367).
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

// A defect already linked to the row-0 run that carries an uploaded attachment (bug1.png).
const RICH_DEFECT_ID = 'DF-232';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-097 | Validate Opening Attachments in Defect Details', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1: select Testdata_Module, navigate the suite tree, open run row 0 ──────
    // Project: Testdata_Module (sidebar). Path: Testdata_Release_P01 → Testdata_Cycle_1 →
    // Dealer Master (the depth-2 module that carries test runs). View All so the grid is
    // populated regardless of the logged-in user's assignments.
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await executeTabPage.selectSidebarProject('Testdata_Module');
    await executeTabPage.expandReleaseByName('Testdata_Release_P01');
    await executeTabPage.expandCycleByName('Testdata_Cycle_1');
    await executeTabPage.clickModuleByName('Dealer Master');
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyDefectSectionVisible();
    await executionPage.verifyStepsLoaded();
    await captureScreenshot(page, 'Step 1: Test run execution details open');

    // ─── Step 2: a linked defect with an attachment is present at run level ───────────
    const runDefectIds = await executionPage.getRunDefectDisplayIds();
    expect(runDefectIds, `${RICH_DEFECT_ID} must be linked to this run to open its attachment`)
      .toContain(RICH_DEFECT_ID);
    await captureScreenshot(page, 'Step 2: Linked defect present at run level');

    // ─── Step 3: click the linked Defect ID → Defect Details opens with its Attachment ─
    await executionPage.openLinkedDefectDetails(RICH_DEFECT_ID);
    await executionPage.verifyDefectDetailsOpen(RICH_DEFECT_ID);
    await executionPage.verifyDefectAttachmentShown();
    const attachmentName = await executionPage.getFirstDefectAttachmentName();
    expect(attachmentName, 'the defect must contain at least one attachment').not.toBe('');
    await captureScreenshot(page, 'Step 3: Defect Details open with attachment listed');

    // ─── Step 4: open (download) the attachment → it opens successfully ────────────────
    const downloadedName = await executionPage.openFirstDefectAttachment();
    expect(downloadedName, 'the attachment should download with a file name').toBeTruthy();
    expect(downloadedName).toBe(attachmentName);
    await captureScreenshot(page, 'Step 4: Attachment opened (downloaded) from Defect Details');
  });

});
