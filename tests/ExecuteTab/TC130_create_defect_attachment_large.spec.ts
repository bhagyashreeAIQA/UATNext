/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-130
 * Test Case Name: Upload Attachment Greater Than 10 MB in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to verify that files larger than 10 MB cannot be
 *                uploaded while creating a defect.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-098 (open a run → LINK DEFECT → NEW → Create Defect form).
 *
 * Steps:
 *   1. Follow TC-098.
 *   2. Click Upload File (BROWSE FILE).
 *   3. Select a file larger than 10 MB.
 *   4. Attempt to upload the file.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. File upload is blocked.
 *   3. A validation message is displayed ("...exceeds the 10MB limit.").
 *
 * Note: No defect is created — the form is discarded.
 */

import path from 'path';
import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const LARGE_FILE = path.resolve(__dirname, '../fixtures/large_over_10mb.pdf');

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-130 | Upload Attachment Greater Than 10 MB in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Steps 2-4 / Expected 2-3: oversized file blocked with a validation message ─
    // The build renders "File '<name>' exceeds the 10MB limit." inside #drop-area and does NOT
    // add an attachment item — the rejection message is the signal that the upload was blocked.
    await executionPage.attachDefectFile(LARGE_FILE);
    await executionPage.verifyDefectFileTooLargeMessage();

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Steps 2-4 / Expected 2-3: oversized file blocked with a validation message");
  });

});
