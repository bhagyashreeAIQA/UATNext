/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Attachments
 * Test Case ID : TC-090
 * Test Case Name: Validate Uploading Multiple Files at Test Run Level
 *
 * Description  : As a Test Engineer, I want to upload multiple files (≤10 MB each) at the Test
 *                Run level so that all related documents can be linked at once.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has a runnable test run).
 *
 * Steps: open a run → select multiple ≤10 MB files → Save → validate all are listed.
 *
 * BLOCKED (test.fixme): the Test Run attachment field is a Blazor `InputFile` that does not
 *       register files set via Playwright (see TC-088/TC-089). The body is complete and runs
 *       once a working upload path exists.
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
const FILE_A = path.resolve(__dirname, '../fixtures/sample_small.pdf');
const FILE_B = path.resolve(__dirname, '../fixtures/sample_small2.pdf');

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Attachments', () => {

  // BLOCKED: Blazor InputFile does not accept Playwright-set files (see TC-088).
  test('TC-090 | Validate Uploading Multiple Files at Test Run Level', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    try {
      // select multiple files at once → both appear in the attachment panel
      await executionPage.attachFiles([FILE_A, FILE_B]);
      await executionPage.verifyAttachmentListed('sample_small');
      await executionPage.verifyAttachmentListed('sample_small2');

      // Save → both remain listed
      await executionPage.clickSave();
      await executionPage.verifySaveSuccessMessage(EXPECTED.saveSuccessMessage);
      await executionPage.verifyAttachmentListed('sample_small');
      await executionPage.verifyAttachmentListed('sample_small2');
    } finally {
      // Leave the run clean so the mutating attachment specs do not accumulate files.
      await executionPage.deleteAllAttachments().catch(() => undefined);
      await executionPage.clickSave().catch(() => undefined);
    }
  });

});
