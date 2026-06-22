/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Attachments
 * Test Case ID : TC-089
 * Test Case Name: Validate Uploading a File Greater Than 10 MB is Not Allowed
 *
 * Description  : As a Test Engineer, I want to ensure that files larger than 10 MB cannot be
 *                uploaded to the Test Run.
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
 *   3. Select a file greater than 10 MB via the attachment input.
 *   4. Validate the error message.
 *
 * Note: uses an 11 MB fixture (tests/fixtures/large_over_10mb.pdf). The rejection message is
 *       matched loosely (the documented text is "File too large. 10 MB max."). No file is
 *       uploaded, so no qTest data is created.
 *
 * BLOCKED (test.fixme): the Test Run attachment field is a Blazor `InputFile` (hidden
 *       `#testlogFileInput`) that does NOT register files set via Playwright — verified with
 *       `setInputFiles`, a forced input.click()+filechooser, the LINK ATTACHMENT
 *       button-triggered chooser, and the CLI `upload` command: the panel stays "No
 *       Attachment" and no size/validation message fires. The test body is complete and will
 *       run once a working upload path (e.g. a real OS-gesture or a JS-interop shim) is
 *       available; until then it is skipped so it does not fail the suite.
 */

import path from 'path';
import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const LARGE_FILE = path.resolve(__dirname, '../fixtures/large_over_10mb.pdf');

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Attachments', () => {

  test('TC-089 | Validate Uploading a File Greater Than 10 MB is Not Allowed', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

    // ─── Steps 3-4: select an oversized file → rejection message, no upload ──────
    await executionPage.attachFile(LARGE_FILE);
    await executionPage.verifyFileTooLargeMessage();   // "...exceeds the 10MB limit."

    // The oversized file must not have been added (other attachments may pre-exist on the run).
    await executionPage.verifyAttachmentNotListed('large_over_10mb');
    await captureScreenshot(page, "Steps 3-4: select an oversized file → rejection message, no upload");
  });

});
