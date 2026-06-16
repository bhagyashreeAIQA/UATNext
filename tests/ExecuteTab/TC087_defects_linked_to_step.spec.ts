/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-087
 * Test Case Name: Validate "Defects Linked to Step" Section Displays Previously Linked Defects
 *
 * Description  : As a Test Engineer, I want to validate that the "Defects Linked to Step"
 *                section displays all previously linked defects for the selected test step.
 *
 * Pre-conditions: valid login; logged in; qTest access; AND at least one defect linked to the
 *                 test step (dependency on TC-085).
 *
 * Intended steps: open a run → Test Logs → click the step Bug icon → validate the "Defects
 *                 Linked to Step" section lists the previously linked defects.
 *
 * Self-seeds its pre-condition: links a real qTest defect to the step (the proven TC-084/085
 * flow), validates the "Defects Linked to Step" list reflects it, then unlinks it in a finally
 * block so the step is left unchanged. MUTATING — run serially (--workers=1 enforced locally).
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

  test('TC-087 | Validate "Defects Linked to Step" Section Displays Previously Linked Defects', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyStepsLoaded();

    let linkedDefectId = '';
    try {
      // ─── Seed: link a not-yet-linked defect to the step (proven TC-084/085 path) ─
      await executionPage.openStepDefectPanel(STEP_INDEX);
      await executionPage.verifyStepDefectPanelOpen();
      const baselineCount = await executionPage.getLinkedDefectCount();
      const linkedBefore = await executionPage.getLinkedDefectIds();
      const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
      expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();
      await executionPage.searchDefect(candidate!);
      await executionPage.verifyDefectInSearchResults(candidate!);
      expect(await executionPage.selectSearchedDefect(candidate!),
        'LINK should enable for a not-yet-linked defect').toBe(true);
      await executionPage.confirmLink();
      linkedDefectId = candidate!;

      // Linking auto-closes the popup, returning to the steps grid — the badge now corroborates
      // the new count before we reopen the panel to read the list.
      await expect(async () => {
        expect(await executionPage.getStepBugBadgeCount(STEP_INDEX)).toBe(baselineCount + 1);
      }).toPass({ timeout: 20000, intervals: [1000, 2000, 3000] });

      // ─── Validate: the "Defects Linked to Step" section lists the linked defect ──
      await executionPage.openStepDefectPanelFresh(STEP_INDEX);
      await executionPage.verifyStepDefectPanelOpen();
      await executionPage.verifyDefectLinked(linkedDefectId);
      expect(await executionPage.getLinkedDefectCount()).toBe(baselineCount + 1);
    } finally {
      if (linkedDefectId) {
        await executionPage.cleanupUnlinkFromStep(STEP_INDEX, linkedDefectId);
      }
    }
  });

});
