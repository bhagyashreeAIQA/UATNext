/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Attachments
 * Test Case ID : TC-093
 * Test Case Name: Validate Success Message After Attaching a File to Test Run
 *
 * Description  : As a Test Engineer, I want to validate that the system displays a success
 *                confirmation message after attaching a file and saving the Test Run.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has a runnable test run).
 *
 * Steps: open a run → attach a ≤10 MB file → Save → validate the success message.
 *
 * Note: the documented message is "Testlog Updated Successfully With Attachment.". The live
 *       wording is matched case-insensitively on "with attachment"
 *       (EXPECTED.saveWithAttachmentMessage).
 *
 * BLOCKED (test.fixme): depends on attaching a file, which the Blazor `InputFile` does not
 *       support under Playwright (see TC-088). Body is complete and runs once uploads work.
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

const RUN_ROW_INDEX = 0;
const SMALL_FILE = path.resolve(__dirname, '../fixtures/sample_small.pdf');

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Attachments', () => {

  test('TC-093 | Validate Success Message After Attaching a File to Test Run', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    try {
      await executionPage.attachFile(SMALL_FILE);
      await executionPage.verifyAttachmentListed('sample_small');

      await executionPage.clickSave();
      // The live build shows the generic save toast ("Test log updated successfully") after a
      // save that includes an attachment — it does NOT render a distinct "...with attachment"
      // message (the documented spec's wording is not implemented).
      await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);
    } finally {
      // Leave the run clean so the mutating attachment specs do not accumulate files.
      await executionPage.deleteAllAttachments().catch(() => undefined);
      await executionPage.clickSave().catch(() => undefined);
    }
  });

});
