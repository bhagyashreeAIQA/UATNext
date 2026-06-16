/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-084
 * Test Case Name: Validate Linking a Defect to a Test Step
 *
 * Description  : As a Test Engineer, I want to validate that I can search and link a defect to a
 *                selected test step, so that step-level issues are tracked correctly.
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
 *   4. Click the Defect/Bug icon for any test step.
 *   5. Validate the defect panel.
 *   6. Enter a valid Defect ID and click Search.
 *   7. Click the Link button.
 *   8. Close the defect panel.
 *   9. Open the defect panel again for the same test step.
 *
 * Notes (live build):
 *   • The step Bug icon opens the same search/link popup as the run-level LINK DEFECT button.
 *   • A defect already linked to the step leaves LINK disabled (qTest dedupe), so the first
 *     not-yet-linked candidate is used. Committing the link re-renders the panel in place, which
 *     returns the user to the Test Execution Details page (Step 8 happens automatically).
 *   • MUTATING: links a real qTest defect to the step, then unlinks it in a finally block so the
 *     step is left unchanged and the spec stays repeatable. Run serially (--workers=1).
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';

const RUN_ROW_INDEX = 0;
const STEP_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-084 | Validate Linking a Defect to a Test Step', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();        // Expected 2: details page opens

    // ─── Step 3: Navigate to the Test Logs (test-steps) section ──────────────────
    await executionPage.verifyStepsGridVisible();        // Expected 3: steps grid displayed
    await executionPage.verifyStepsLoaded();

    let linkedDefectId = '';
    try {
      // ─── Steps 4-5: open the step Bug-icon defect panel and validate it ────────
      await executionPage.openStepDefectPanel(STEP_INDEX);
      await executionPage.verifyStepDefectPanelOpen();   // Expected 4 & 5: panel + search field

      // ─── Step 6: search a valid (not-yet-linked) Defect ID ─────────────────────
      const linkedBefore = await executionPage.getLinkedDefectIds();
      const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
      expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();

      await executionPage.searchDefect(candidate!);
      await executionPage.verifyDefectInSearchResults(candidate!); // Expected 6: match displayed

      // ─── Step 7: select the match and click Link ───────────────────────────────
      const linkEnabled = await executionPage.selectSearchedDefect(candidate!);
      expect(linkEnabled, 'LINK should enable for a not-yet-linked defect').toBe(true);
      await executionPage.confirmLink();                 // Expected 7: defect linked
      linkedDefectId = candidate!;

      // ─── Step 8: linking returns the user to the Test Execution Details page ───
      await expect(executionPage.defectPopup).toBeHidden(); // Expected 8
      await executionPage.verifyDetailsPageOpen();

      // ─── Step 9: reopen the step panel — the new defect is in the linked list ──
      await executionPage.openStepDefectPanelFresh(STEP_INDEX);
      await executionPage.verifyDefectLinked(linkedDefectId); // Expected 9
    } finally {
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromStep(STEP_INDEX, linkedDefectId);
      }
    }
  });

});
