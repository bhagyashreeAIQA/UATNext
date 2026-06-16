/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-096
 * Test Case Name: Validate Unlink Cancellation Using No Button
 *
 * Description  : As a Test Engineer, I want to validate that clicking No on the unlink
 *                confirmation popup does not remove the defect.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND at least one defect linked
 *                 (dependency on TC-084).
 *
 * Intended steps: open linked Defect Details → Unlink → confirm popup → No → assert the popup
 *                 closes and the defect remains linked everywhere.
 *
 * Self-seeds its pre-condition: links a real qTest defect at the run level (proven TC-083 flow),
 * exercises the unlink-then-NO cancellation path, asserts the defect is still linked, then
 * unlinks it for real in a finally block. MUTATING — run serially (--workers=1 enforced locally).
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

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-096 | Validate Unlink Cancellation Using No Button', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyDefectSectionVisible();

    let linkedDefectId = '';
    try {
      // ─── Seed: link a not-yet-linked defect at the run level ─────────────────────
      await executionPage.openLinkDefectPanel();
      await executionPage.verifyDefectPanelOpen();
      const linkedBefore = await executionPage.getLinkedDefectIds();
      const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
      expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();
      await executionPage.searchDefect(candidate!);
      await executionPage.verifyDefectInSearchResults(candidate!);
      expect(await executionPage.selectSearchedDefect(candidate!),
        'LINK should enable for a not-yet-linked defect').toBe(true);
      await executionPage.confirmLink();
      linkedDefectId = candidate!;

      await executionPage.openRunDefectPanelFresh();
      await executionPage.verifyDefectLinked(linkedDefectId);

      // ─── Unlink → NO → the defect stays linked (cancellation) ────────────────────
      await executionPage.cancelUnlinkDefect(linkedDefectId);
      await executionPage.verifyDefectLinked(linkedDefectId);
      await executionPage.closeDefectPanel();
    } finally {
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromRun(linkedDefectId);
      }
    }
  });

});
