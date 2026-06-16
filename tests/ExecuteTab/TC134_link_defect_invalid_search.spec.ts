/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Defects
 * Test Case ID : TC-134
 * Test Case Name: Validate Behavior When Searching with an Invalid Defect ID
 *
 * Description  : As a Test Engineer, I want to validate the system behavior when an invalid Defect
 *                ID is entered, so that incorrect inputs are handled gracefully.
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
 *   2. Open any Test Run using the Run button.
 *   3. Navigate to the Test Logs section.
 *   4. Click the Link Defect button.
 *   5. Validate the Link button state.
 *   6. Enter an invalid Defect ID.
 *   7. Click the Search icon.
 *   8. Validate the system response.
 *   9. Validate the Link button state.
 *
 * Expected:
 *   1. Link Defect search panel opens.
 *   2. Link button is disabled initially (list mode shows only NEW/CLOSE — no LINK control).
 *   3. Search field accepts input.
 *   4. System validates the entered Defect ID.
 *   5. "No matching records found." is displayed.
 *   6. Link button remains disabled.
 *
 * Note: no defect is linked — the panel is closed.
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

  test('TC-134 | Validate Behavior When Searching with an Invalid Defect ID', async ({ page }) => {
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

    // ─── Steps 6-9 / Expected 4-6: invalid ID → no match + LINK disabled ─────────
    await executionPage.searchDefect(EXPECTED.invalidDefectId);   // Expected 3: field accepts input
    await executionPage.verifyDefectSearchNoResults();            // Expected 5
    await executionPage.verifyDefectLinkButtonDisabled();         // Expected 6

    await executionPage.closeDefectPanelAnyMode();                // no defect linked
  });

});
