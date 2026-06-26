/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-094
 * Test Case Name: Validate Navigation to Defect Details by Clicking a Linked Defect
 *
 * Description  : As a Test Engineer, I want to validate that clicking a linked defect opens
 *                the Defect Details page.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND at least one defect linked
 *                 (dependency on TC-084).
 *
 * Intended steps: open a run with a linked defect → click the linked Defect ID → validate the
 *                 Defect Details page (ID/header, fields, Description/Attachments/Comments/
 *                 Linked Test Runs) → navigate back to the Test Run.
 *
 * Intended steps: open a run with a linked defect → click the linked Defect ID → validate the
 *                 Defect Details page → navigate back to the Test Run.
 *
 * BLOCKED (test.fixme) — app behaviour, not seeding: a linked defect now CAN be seeded (the
 *       TC-083/086 self-seed flow works) and the run-level defect section (`#defect.test-run-frame-9`)
 *       renders each linked defect as a `button.test-run-div-wrapper` (`.test-run-text-wrapper-5`
 *       = the DF-id). However, clicking that button does NOT open a Defect Details page in the
 *       current build — it navigates to the home route (`/`) with no defect-details view rendered
 *       (verified 2026-06-15). There is no Defect Details screen to assert against, so this stays
 *       skipped. Enable once clicking a linked defect opens a Defect Details view.
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

  // BLOCKED: clicking a linked defect navigates home rather than opening a Defect Details page.
  test.fixme('TC-094 | Validate Navigation to Defect Details by Clicking a Linked Defect', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1: reach the test suite grid ───────────────────────────────────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await captureScreenshot(page, 'Step 1: Test suite grid reached');

    // ─── Step 2: open a run with a linked defect ─────────────────────────────────────
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);
    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await captureScreenshot(page, 'Step 2: Test run execution details open');

    // ─── Step 3: the linked-defect section is visible ────────────────────────────────
    await executionPage.verifyDefectSectionVisible();
    await captureScreenshot(page, 'Step 3: Linked-defect section visible');

    // Seed a linked defect (works), then click it — but the build navigates home instead of
    // opening a Defect Details page, so there is nothing to validate. See header note.
  });

});
