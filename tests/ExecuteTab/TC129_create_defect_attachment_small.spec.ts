/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-129
 * Test Case Name: Upload Attachment Less Than 10 MB in Create Defect Screen
 *
 * Description  : As a Test Engineer, I want to upload a file smaller than 10 MB while creating a
 *                defect.
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
 *   3. Select a file less than 10 MB.
 *   4. Upload the file.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. File uploads successfully.
 *   3. Uploaded file is displayed in the attachment (#drop-area) section.
 *
 * Note: the Create Defect attachment is a drop zone (`#drop-area`) with a BROWSE FILE button
 *       backed by `#defectFileInput`. No defect is created — the form is discarded.
 */

import path from 'path';
import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';

const RUN_ROW_INDEX = 0;
const SMALL_FILE = path.resolve(__dirname, '../fixtures/sample_small.pdf');

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-129 | Upload Attachment Less Than 10 MB in Create Defect Screen', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Steps 2-4 / Expected 2-3: upload a ≤10 MB file → it is listed ───────────
    await executionPage.attachDefectFile(SMALL_FILE);
    await executionPage.verifyDefectAttachmentListed('sample_small');

    await executionPage.closeCreateDefectForm();         // discard — no defect created
  });

});
