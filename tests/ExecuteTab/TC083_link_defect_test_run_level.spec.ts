/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-083
 * Test Case Name: Validate Link Defect Button Functionality at Test Run Level
 *
 * Description  : As a Test Engineer, I want to validate that I can link a defect to a test run,
 *                so that overall execution issues are tracked correctly.
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
 *   3. Click the Link Defect button at the Test Run level.
 *   4. Enter a valid Defect ID and click Search.
 *   5. Click the Link button for the displayed defect.
 *   6. Validate the Test Run page.
 *   7. Refresh the page or reopen the same Test Run.
 *   8. Validate linked defect information.
 *
 * Notes (live build):
 *   • A defect already linked to the run leaves the LINK button disabled (qTest dedupe), so the
 *     test links the first candidate that is NOT already linked.
 *   • Committing the link tears down and re-renders the execution panel in place, so the linked
 *     list is read by reopening the Link Defect panel fresh.
 *   • MUTATING: the test links a real qTest defect, then unlinks it again in a finally block so
 *     the run is left exactly as it was and the spec stays repeatable. Run serially (--workers=1).
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

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-083 | Validate Link Defect Button Functionality at Test Run Level', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-047): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(RUN_ROW_INDEX);
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();        // Expected 2: details page opens
    await executionPage.verifyDefectSectionVisible();

    let linkedDefectId = '';
    try {
    await captureScreenshot(page, "Steps 1-2 (follows TC-047): reach the grid and open a run");

      // ─── Step 3: open the run-level Link Defect panel ──────────────────────────
      await executionPage.openLinkDefectPanel();
      await executionPage.verifyDefectPanelOpen();        // Expected 3: search panel opens
      await captureScreenshot(page, "Step 3: open the run-level Link Defect panel");

      // ─── Step 4: search a valid (not-yet-linked) Defect ID ─────────────────────
      const linkedBefore = await executionPage.getLinkedDefectIds();
      const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
      expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();

      await executionPage.searchDefect(candidate!);
      await executionPage.verifyDefectInSearchResults(candidate!); // Expected 4: match displayed
      await captureScreenshot(page, "Step 4: search a valid (not-yet-linked) Defect ID");

      // ─── Step 5: select the match and click Link ───────────────────────────────
      const linkEnabled = await executionPage.selectSearchedDefect(candidate!);
      expect(linkEnabled, 'LINK should enable for a not-yet-linked defect').toBe(true);
      await executionPage.confirmLink();                  // Expected 5: defect linked
      linkedDefectId = candidate!;
      await captureScreenshot(page, "Step 5: select the match and click Link");

      // ─── Step 6: the linked defect appears above the Link Defect button ────────
      await executionPage.openRunDefectPanelFresh();
      await executionPage.verifyDefectLinked(linkedDefectId); // Expected 6
      await executionPage.closeDefectPanel();
      await captureScreenshot(page, "Step 6: the linked defect appears above the Link Defect button");

      // ─── Steps 7-8: reopen the run and confirm the link persisted ──────────────
      await executionPage.close();
      await reopenTestRun(executeTabPage, executionPage, RUN_ROW_INDEX);
      await executionPage.verifyTestRunId(rowRunId);      // Expected 7: same run reopened

      await executionPage.openRunDefectPanelFresh();
      await executionPage.verifyDefectLinked(linkedDefectId); // Expected 8: persists
    } finally {
      // Restore state so the suite is repeatable (does not accumulate links).
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromRun(linkedDefectId);
      }
    }
      await captureScreenshot(page, "Steps 7-8: reopen the run and confirm the link persisted");
  });

});
