/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details
 * Test Case ID : TC-070
 * Test Case Name: Validate Status Dropdown Functionality for a Test Run
 *
 * Description  : As a Test Engineer, I want to validate that the Status dropdown allows me to
 *                update the execution status, so that I can correctly mark the test run result.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-068 (the execution details panel is open for a known run).
 *
 * Steps:
 *   1. Follow TC-068.
 *   2. Open any test run using the Run button.
 *   3. Click the Status dropdown.
 *   4. Validate available status values.
 *   5. Select a different status (e.g., Failed, Blocked, Passed).
 *   6. Click Save.
 *   7. Refresh or reopen the same test run.
 *
 * Note: the documented statuses are Passed, Failed, Retest, Blocked, In Progress and
 *       Incomplete; the live app renders "InProgress" without a space (see EXPECTED
 *       .executionStatusOptions). Persistence is verified by closing the panel, searching the
 *       grid for the run's Test Run ID and reopening it. The grid's own status cell is not
 *       refreshed live after a save, but reopening the run re-fetches it from qTest and shows
 *       the saved value — the meaningful "persists after refresh/reopen" check.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
  reopenTestRun,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details', () => {

  test('TC-070 | Validate Status Dropdown Functionality for a Test Run', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1-2 (follows TC-068): reach the grid and open a run ───────────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    const rowRunId = await executeTabPage.getRowTestRunId(0);
    await executeTabPage.clickRunButton(0);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.verifyTestRunId(rowRunId);

    // ─── Steps 3-4: open the Status dropdown and validate available values ───────
    await executionPage.openStatusDropdown();
    await executionPage.verifyStatusOptions(EXPECTED.executionStatusOptions);

    // ─── Step 5: select a status different from the current one ──────────────────
    const currentStatus = await executionPage.getStatusValue();
    const newStatus = await executionPage.selectDifferentStatus(
      currentStatus,
      EXPECTED.executionStatusOptions,
    );

    // ─── Step 6: click Save ──────────────────────────────────────────────────────
    await executionPage.save();

    // ─── Step 7: reopen the same run and confirm the status persisted ────────────
    // Close back to the grid (same filtered view) and reopen the same row. The TR-id assertion
    // guards that we reopened the run we just saved; the reopened panel re-fetches the status
    // from qTest (the grid's own status cell is not live-updated).
    await executionPage.close();
    await reopenTestRun(executeTabPage, executionPage, 0);

    await executionPage.verifyTestRunId(rowRunId);
    await executionPage.verifyStatusValuePersisted(newStatus);
  });

});
