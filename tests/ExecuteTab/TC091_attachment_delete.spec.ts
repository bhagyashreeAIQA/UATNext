/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Attachments
 * Test Case ID : TC-091
 * Test Case Name: Validate Deleting an Uploaded Attachment
 *
 * Description  : As a Test Engineer, I want to remove an attachment from the Test Run so that
 *                outdated or incorrect files can be unlinked.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *   4. At least one attachment is already linked.
 *
 * Dependencies : Follows TC-090 (an attachment exists to delete).
 *
 * Steps: attach a file → delete it via its Delete icon → Save → validate it is removed.
 *
 * BLOCKED (test.fixme): depends on attaching a file first, which the Blazor `InputFile` does
 *       not support under Playwright (see TC-088). The delete-icon selector is best-effort and
 *       should be confirmed once uploads work.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { uniqueFixture, cleanupFixture } from './attachmentFixtures';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

// Runs on its own grid row (the first-layer cycle grid has many runs) so its delete-all/empty
// assertion is not disturbed by the other attachment specs mutating a shared run in parallel.
const RUN_ROW_INDEX = 2;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Attachments', () => {

  test('TC-091 | Validate Deleting an Uploaded Attachment', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // Pre-condition: attach a uniquely-named file so the upload is never a duplicate.
    const file = uniqueFixture('sample_small.pdf', 'tc091');
    try {
      await executionPage.attachFile(file.filePath);
      await executionPage.verifyAttachmentListed(file.fileName);

      // Delete every attachment (each via its "Remove attachment" ✕) and save. Removing all also
      // leaves the run clean, so this spec does not accumulate files over runs.
      await executionPage.deleteAllAttachments();
      await executionPage.clickSave();

      // The attachments are gone — the panel shows "No Attachment".
      await executionPage.verifyNoAttachments();
    } finally {
      await executionPage.deleteAllAttachments().catch(() => undefined);
      await executionPage.clickSave().catch(() => undefined);
      cleanupFixture(file.filePath);
    }
    await captureScreenshot(page, "Final state — TC-091 | Validate Deleting an Uploaded Attachment");
  });

});
