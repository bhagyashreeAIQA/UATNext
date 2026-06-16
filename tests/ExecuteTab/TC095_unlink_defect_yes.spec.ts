/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-095
 * Test Case Name: Validate Unlinking a Defect Using Yes Button
 *
 * Description  : As a Test Engineer, I want to validate that clicking Yes on the unlink
 *                confirmation removes the defect from the linked defect list.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND at least one defect linked
 *                 (dependency on TC-084).
 *
 * Intended steps: open linked Defect Details → Unlink → confirm popup → Yes → assert the
 *                 defect is removed from the linked list and from the Test Run defect list.
 *
 * Self-seeds its pre-condition: links a real qTest defect at the run level (proven TC-083 flow),
 * then exercises the destructive unlink-with-YES path and asserts the defect is gone. The unlink
 * IS the cleanup, so on success no defect remains; a finally block unlinks if the test bailed
 * before completing. MUTATING — run serially (--workers=1 enforced locally).
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

  test('TC-095 | Validate Unlinking a Defect Using Yes Button', async ({ page }) => {
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

      // ─── Unlink → YES → defect removed from the linked list and run defect section ─
      await executionPage.unlinkDefect(linkedDefectId);    // clicks unlink + confirms YES
      await executionPage.openRunDefectPanelFresh();
      await executionPage.verifyDefectNotLinked(linkedDefectId);
      await executionPage.closeDefectPanel();
      expect(await executionPage.getRunDefectDisplayIds()).not.toContain(linkedDefectId);
      linkedDefectId = '';                                 // unlinked successfully — nothing to clean up
    } finally {
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromRun(linkedDefectId);
      }
    }
  });

});
