/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-135
 * Test Case Name: Validate Link Defect Button Is Enabled Only After Valid Search
 *
 * Description  : As a Test Engineer, I want to validate that the Link button remains disabled until
 *                a valid defect is found.
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
 *   2. Open any executed Test Run.
 *   3. Navigate to the Test Logs section.
 *   4. Click the Link Defect button.
 *   5. Validate Link button state.
 *   6. Enter a valid Defect ID.
 *   7. Click Search.
 *   8. Validate Link button state.
 *
 * Expected:
 *   1. Link Defect panel opens.
 *   2. Link button is disabled by default (list mode shows only NEW/CLOSE — no LINK control).
 *   3. Matching defect details are displayed after search.
 *   4. Link button becomes enabled (once the matching, not-yet-linked defect is selected).
 *
 * Note: a not-yet-linked candidate defect is used so LINK can enable (qTest leaves LINK disabled
 *       for an already-linked defect). No defect is linked — the panel is closed.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Defects', () => {

  test('TC-135 | Validate Link Defect Button Is Enabled Only After Valid Search', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();

    // ─── Steps 4-5 / Expected 1-2: panel opens; no LINK control in list mode ─────
    await executionPage.openLinkDefectPanel();
    await executionPage.verifyDefectPanelOpen();
    expect(await executionPage.isDefectLinkButtonPresent(),
      'LINK should not be available before a search (list mode)').toBe(false);
    await captureScreenshot(page, "Steps 4-5 / Expected 1-2: panel opens; no LINK control in list mode");

    // ─── Steps 6-7 / Expected 3: valid search shows the matching defect ──────────
    const linkedBefore = await executionPage.getLinkedDefectIds();
    const candidate = EXPECTED.linkDefectCandidates.find(id => !linkedBefore.includes(id));
    expect(candidate, 'an unlinked candidate defect must be available').toBeTruthy();
    await executionPage.searchDefect(candidate!);
    await executionPage.verifyDefectInSearchResults(candidate!);
    await captureScreenshot(page, "Steps 6-7 / Expected 3: valid search shows the matching defect");

    // ─── Step 8 / Expected 4: selecting the valid result enables LINK ────────────
    expect(await executionPage.selectSearchedDefect(candidate!),
      'LINK should become enabled for a valid not-yet-linked defect').toBe(true);

    await executionPage.closeDefectPanelAnyMode();                // no defect linked
    await captureScreenshot(page, "Step 8 / Expected 4: selecting the valid result enables LINK");
  });

});
