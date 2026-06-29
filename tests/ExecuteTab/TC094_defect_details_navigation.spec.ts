/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-094
 * Test Case Name: Validate Navigation to Defect Details by Clicking a Linked Defect
 *
 * Description  : As a Test Engineer, I want to validate that clicking a linked defect opens
 *                the Defect Details page.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND at least one defect linked.
 *
 * Steps:
 *   1. Follow TC-084 (link a defect at step level) — the newly linked defect should appear in
 *      the "Defects Linked to Step" list.
 *   2. Click on any linked Defect ID — the Defect Details page should open.
 *   3. Validate the defect header — the Defect Details breadcrumb shows the Defect ID.
 *   4. Validate the defect information fields — Affected Release/Build, Severity, Fixed
 *      Release/Build, Root Cause, Priority, Module, Assigned To, Status, Type, Target
 *      Release/Build, Reason, Category, Environment, Team.
 *   5. Validate the additional sections — Submitted Date, Description, Attachment, Linked Test
 *      Runs, Comments.
 *   6. Validate the attachment and linked test run sections — associated Test Run IDs and an
 *      uploaded attachment should be displayed.
 *   7. Navigate back to the test run — the Test Execution Details page should be displayed.
 *
 * LIVE NOTES (verified 2026-06-26):
 *   Clicking a linked-defect chip (`#defect button.test-run-div-wrapper`) now DOES open the
 *   defect's details — the defect form populated and rendered in place (URL stays at root). Its
 *   breadcrumb (`.defect-breadcrumbs`) carries the TR + DF ids; SAVE is `#updateDefect`, CLOSE is
 *   `#closeButton` (→ back to the run panel). The earlier blocker (navigating to `/` with no view)
 *   is resolved. Spec deviations: the form does NOT render the documented "Target Date", "Link ID"
 *   or "Non QA User" fields, and there is no literal "Defect Details" heading — the DF id in the
 *   breadcrumb is the header. Step 2 opens DF-232, a defect carrying an uploaded attachment
 *   (bug1.png) and linked test runs, so steps 4-6 assert against real data.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;
const STEP_INDEX = 0;

// Step 2 — a defect that carries an uploaded attachment + linked test runs, so steps 4-6 have
// real data to assert against. It is already linked to the row-0 run (Dealer Master / TR-1367).
const RICH_DEFECT_ID = 'DF-232';

// Step 4 — defect information fields the live Defect Details form renders. The documented
// "Target Date", "Link ID" and "Non QA User" are omitted: the current build does not render them.
const DEFECT_INFO_FIELDS = [
  'Affected Release/Build', 'Severity', 'Fixed Release/Build', 'Root Cause', 'Priority',
  'Module', 'Assigned To', 'Status', 'Type', 'Target Release/Build', 'Reason', 'Category',
  'Environment', 'Team',
];

// Step 5 — additional sections expected on the Defect Details page.
const DEFECT_SECTIONS = ['Submitted Date', 'Description', 'Attachment', 'Linked Test Runs', 'Comments'];

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-094 | Validate Navigation to Defect Details by Clicking a Linked Defect', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Setup: reach a test run and open its execution details ──────────────────────
    // Project: Testdata_Module (sidebar). Path: Testdata_Release_P01 → Testdata_Cycle_1 →
    // Dealer Master (the depth-2 module that carries test runs), View All for a populated grid.
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await executeTabPage.selectSidebarProject('Testdata_Module');
    await executeTabPage.expandReleaseByName('Testdata_Release_P01');
    await executeTabPage.expandCycleByName('Testdata_Cycle_1');
    await executeTabPage.clickModuleByName('Dealer Master');
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyDefectSectionVisible();
    await executionPage.verifyStepsLoaded();

    let seededDefectId = '';
    try {
      // ─── Step 1: Follow TC-084 — link a defect at step level ───────────────────────
      // Expected: the newly linked defect appears in the "Defects Linked to Step" list.
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
      seededDefectId = candidate!;
      // Reopen the step's defect panel and confirm the defect is now in the linked list.
      await executionPage.openStepDefectPanelFresh(STEP_INDEX);
      await executionPage.verifyDefectLinked(seededDefectId);
      await executionPage.closeDefectPanelAnyMode();
      await captureScreenshot(page, 'Step 1: Defect linked in "Defects Linked to Step" list');

      // Step 2 opens DF-232 (carries an attachment + linked runs); confirm it is linked to this run.
      const runDefectIds = await executionPage.getRunDefectDisplayIds();
      expect(runDefectIds, `${RICH_DEFECT_ID} must be linked to this run to open its details`)
        .toContain(RICH_DEFECT_ID);

      // ─── Step 2: click a linked Defect ID → Defect Details page opens ──────────────
      await executionPage.openLinkedDefectDetails(RICH_DEFECT_ID);
      await captureScreenshot(page, 'Step 2: Defect Details page open');

      // ─── Step 3: validate the defect header ────────────────────────────────────────
      // Expected: the Defect Details breadcrumb shows the Defect ID (no literal "Defect Details" heading).
      await executionPage.verifyDefectDetailsOpen(RICH_DEFECT_ID);
      await captureScreenshot(page, 'Step 3: Defect header displayed');

      // ─── Step 4: validate the defect information fields ────────────────────────────
      for (const field of DEFECT_INFO_FIELDS) {
        await executionPage.verifyDefectDetailLabelVisible(field);
      }
      await captureScreenshot(page, 'Step 4: Defect information fields displayed');

      // ─── Step 5: validate the additional sections ──────────────────────────────────
      for (const section of DEFECT_SECTIONS) {
        await executionPage.verifyDefectDetailLabelVisible(section);
      }
      await captureScreenshot(page, 'Step 5: Additional sections displayed');

      // ─── Step 6: validate the attachment and linked test run sections ──────────────
      // Expected: associated Test Run IDs and an uploaded attachment are displayed.
      await executionPage.verifyDefectLinkedTestRuns();
      await executionPage.verifyDefectAttachmentShown();
      await captureScreenshot(page, 'Step 6: Attachment and linked test run sections displayed');

      // ─── Step 7: navigate back to the test run ─────────────────────────────────────
      // Expected: the Test Execution Details page is displayed again.
      await executionPage.closeDefectDetails();
      await executionPage.verifyDetailsPageOpen();
      expect(await executionPage.isOpen(), 'should return to the Test Run execution details').toBe(true);
      await captureScreenshot(page, 'Step 7: Back on the Test Run execution details');
    } finally {
      // Self-clean only what this test seeded; pre-existing run defects are left untouched.
      if (seededDefectId && await executionPage.isOpen()) {
        await executionPage.cleanupUnlinkFromStep(STEP_INDEX, seededDefectId).catch(() => undefined);
      }
    }
  });

});
