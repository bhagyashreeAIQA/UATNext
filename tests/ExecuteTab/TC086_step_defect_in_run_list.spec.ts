/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-086
 * Test Case Name: Validate Step-Level Linked Defects Appear in Test Run Defect List
 *
 * Description  : As a Test Engineer, I want to validate that defects linked to a test step are
 *                also displayed in the overall test run defect list.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND at least one defect linked to a
 *                 test step (the documented dependency on TC-085).
 *
 * Intended steps: open a run → link a defect to a step → open the Test-Run-level defect
 *                 section → confirm the step's defect appears there → reopen the run → confirm
 *                 it persists.
 *
 * Self-seeds its pre-condition: links a real qTest defect to a step (proven TC-084/085 flow),
 * confirms it surfaces in the run-level `#defect` section and persists across a run reopen, then
 * unlinks it in a finally block. MUTATING — run serially (--workers=1 enforced locally).
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
  reopenTestRun,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const STEP_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-086 | Validate Step-Level Linked Defects Appear in Test Run Defect List', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyDefectSectionVisible();
    await executionPage.verifyStepsLoaded();

    let linkedDefectId = '';
    try {
      // ─── Seed: link a not-yet-linked defect to the step ──────────────────────────
      await executionPage.openStepDefectPanel(STEP_INDEX);
      await executionPage.verifyStepDefectPanelOpen();
      const linkedBefore = await executionPage.getLinkedDefectIds();
      const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
      expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();
      await executionPage.searchDefect(candidate!);
      await executionPage.verifyDefectInSearchResults(candidate!);
      expect(await executionPage.selectSearchedDefect(candidate!),
        'LINK should enable for a not-yet-linked defect').toBe(true);
      await executionPage.confirmLink();
      linkedDefectId = candidate!;
      await captureScreenshot(page, "Seed: link a not-yet-linked defect to the step");

      // ─── The step's defect appears in the run-level (test run) defect list ───────
      // The "test run defect list" is the run-level LINK DEFECT popup's linked list, which
      // aggregates step-linked defects (the `#defect` header button itself only toggles it).
      await executionPage.openRunDefectPanelFresh();
      await executionPage.verifyDefectLinked(linkedDefectId);
      await executionPage.closeDefectPanel();
      await captureScreenshot(page, "The step's defect appears in the run-level (test run) defect list");

      // ─── Reopen the run → the defect still appears (persists) ────────────────────
      await executionPage.close();
      await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);
      await executionPage.verifyTestRunId(rowRunId);
      await executionPage.openRunDefectPanelFresh();
      await executionPage.verifyDefectLinked(linkedDefectId);
      await executionPage.closeDefectPanel();
    } finally {
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromStep(STEP_INDEX, linkedDefectId);
      }
    }
      await captureScreenshot(page, "Reopen the run → the defect still appears (persists)");
  });

});
