/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-085
 * Test Case Name: Validate Defect Count Update for a Test Step
 *
 * Description  : As a Test Engineer, I want to validate that the defect count displayed for a
 *                test step updates correctly when defects are linked, so that the number of
 *                associated defects is always accurate.
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
 *   2. Click the Run button for any test run.
 *   3. Navigate to the Test Logs section.
 *   4. Note the existing defect count for a test step.
 *   5. Click the Defect/Bug icon.
 *   6. Link a valid defect.
 *   7. Close the defect panel.
 *   8. Validate the defect count.
 *   9. Refresh or reopen the test run.
 *  10. Validate the defect count again.
 *
 * Notes (live build):
 *   • The step's defect count is shown on screen as a `bug-count-badge` over the step's bug
 *     icon (rendered only when count ≥ 1) and, in detail, as the linked-defect rows in the
 *     step's defect panel. Both are validated: the badge for the visible count, the panel list
 *     for corroboration.
 *   • Linking dedupes (an already-linked defect can't be linked again), so a not-yet-linked
 *     candidate is used to guarantee a genuine +1.
 *   • MUTATING: links a real qTest defect, asserts the count grew + persisted, then unlinks it
 *     in a finally block so the count returns to its baseline. Run serially (--workers=1).
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

  test('TC-085 | Validate Defect Count Update for a Test Step', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-3 (follows TC-047): open a run and reach the Test Logs ──────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();        // Expected 1: details page opens
    await executionPage.verifyStepsGridVisible();        // Expected 2: steps grid displayed
    await executionPage.verifyStepsLoaded();

    let linkedDefectId = '';
    let baselineCount = 0;
    try {
    await captureScreenshot(page, "Steps 1-3 (follows TC-047): open a run and reach the Test Logs");

      // ─── Step 4: note the existing defect count for the step (badge + panel) ────
      const baselineBadge = await executionPage.getStepBugBadgeCount(STEP_INDEX); // Expected 3
      await executionPage.openStepDefectPanel(STEP_INDEX);
      await executionPage.verifyStepDefectPanelOpen();
      baselineCount = await executionPage.getLinkedDefectCount();
      expect(baselineCount).toBe(baselineBadge); // badge matches the panel's linked count
      const linkedBefore = await executionPage.getLinkedDefectIds();
      await captureScreenshot(page, "Step 4: note the existing defect count for the step (badge + panel)");

      // ─── Steps 5-6: open the Bug panel (done) and link a not-yet-linked defect ─
      const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
      expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();

      await executionPage.searchDefect(candidate!);
      await executionPage.verifyDefectInSearchResults(candidate!);
      const linkEnabled = await executionPage.selectSearchedDefect(candidate!);
      expect(linkEnabled, 'LINK should enable for a not-yet-linked defect').toBe(true);
      await executionPage.confirmLink();                 // Expected 4: defect linked
      linkedDefectId = candidate!;
      await captureScreenshot(page, "Steps 5-6: open the Bug panel (done) and link a not-yet-linked defect");

      // ─── Steps 7-8: the displayed count (badge) increased; panel corroborates ──
      // Linking auto-closes the panel (Step 7), returning to the steps grid where the badge shows.
      await expect(async () => {
        expect(await executionPage.getStepBugBadgeCount(STEP_INDEX)).toBe(baselineBadge + 1);
      }).toPass({ timeout: 20000, intervals: [1000, 2000, 3000] });             // Expected 5
      await executionPage.openStepDefectPanelFresh(STEP_INDEX);
      await executionPage.verifyDefectLinked(linkedDefectId);
      expect(await executionPage.getLinkedDefectCount()).toBe(baselineCount + 1);
      await executionPage.closeDefectPanel();
      await captureScreenshot(page, "Steps 7-8: the displayed count (badge) increased; panel corroborates");

      // ─── Steps 9-10: reopen the run and validate the count persists ────────────
      await executionPage.close();
      await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);
      await executionPage.verifyTestRunId(rowRunId);

      expect(await executionPage.getStepBugBadgeCount(STEP_INDEX)).toBe(baselineBadge + 1); // Expected 6
      await executionPage.openStepDefectPanelFresh(STEP_INDEX);
      await executionPage.verifyDefectLinked(linkedDefectId);
      expect(await executionPage.getLinkedDefectCount()).toBe(baselineCount + 1);
    } finally {
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromStep(STEP_INDEX, linkedDefectId);
      }
    }
      await captureScreenshot(page, "Steps 9-10: reopen the run and validate the count persists");
  });

});
