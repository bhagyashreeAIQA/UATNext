/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Attachments
 * Test Case ID : TC-088
 * Test Case Name: Validate Uploading a File ≤ 10 MB via Link Attachment in Test Run
 *
 * Description  : As a Test Engineer, I want to attach files of size ≤10 MB at the Test Run
 *                level, so that supporting documents can be linked to the execution record.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has a runnable test run).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Open any test run using the Run button.
 *   3. Select a file ≤ 10 MB via the attachment input.
 *   4. Click Save.
 *   5. Validate the uploaded attachment.
 *
 * Note: creates a real attachment on the dev test run (uses tests/fixtures/sample_small.pdf).
 *
 * ENABLED (2026-06-15): the Blazor `InputFile` (hidden `#testlogFileInput`) DOES register files
 *       when the file chooser is raised via the real LINK ATTACHMENT button and `chooser.setFiles`
 *       is used (`chooseFiles` Technique B) — `#attachment-display` then lists the file. (Setting
 *       files directly on the hidden input via `setInputFiles` still does NOT trigger Blazor's
 *       interop — that was the original blocker.)
 */

import path from 'path';
import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const SMALL_FILE = path.resolve(__dirname, '../fixtures/sample_small.pdf');

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Attachments', () => {

  test('TC-088 | Validate Uploading a File ≤ 10 MB via Link Attachment in Test Run', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    try {
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

      // ─── Step 3: select a ≤10 MB file → it appears in the attachment panel ─────
      await executionPage.attachFile(SMALL_FILE);
      await executionPage.verifyAttachmentListed('sample_small');
      await captureScreenshot(page, "Step 3: select a ≤10 MB file → it appears in the attachment panel");

      // ─── Steps 4-5: Save → success + the attachment remains listed ─────────────
      await executionPage.clickSave();
      await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);
      await executionPage.verifyAttachmentListed('sample_small');
    } finally {
      // Leave the run clean so the mutating attachment specs do not accumulate files.
      await executionPage.deleteAllAttachments().catch(() => undefined);
      await executionPage.clickSave().catch(() => undefined);
    }
      await captureScreenshot(page, "Steps 4-5: Save → success + the attachment remains listed");
  });

});
