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
 *                 least one attachment (dependency on TC-084).
 *
 * Intended steps: open a linked Defect with attachments → Attachment section → click an
 *                 attachment → it opens successfully.
 *
 * BLOCKED (test.fixme): doubly blocked — (1) no linked defect exists to open (TC-084 absent),
 *       and (2) seeding a defect WITH an attachment is not possible because the Blazor
 *       `InputFile` upload is not automatable in this environment (see TC-088). Enable once a
 *       defect with attachments is available.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  // BLOCKED: needs a linked defect that contains an attachment (TC-084 + working uploads).
  test.fixme('TC-097 | Validate Opening Attachments in Defect Details', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1: reach the test suite grid ───────────────────────────────────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await captureScreenshot(page, 'Step 1: Test suite grid reached');

    // ─── Step 2: open a run / its execution details ──────────────────────────────────
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, 'Step 2: Test run execution details open');

    // TODO (needs a linked defect with an attachment): open the Defect Details, go to the
    // Attachment section, click an attachment, and assert it opens successfully.
  });

});
