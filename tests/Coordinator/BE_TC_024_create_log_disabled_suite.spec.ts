/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_024
 * Test Name    : Verify CREATE LOG Button is Visible and Disabled by Default at Test Suite Level
 *
 * Description  : As a Test Engineer, I want to verify that the CREATE LOG button is visible and
 *                correctly disabled by default at the Test Suite level.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_021 → click a Test Suite.
 *   2. Check above the Test Run table.
 *   3. Verify the initial CREATE LOG state before selecting any row.
 *
 * Expected: CREATE LOG is visible above the grid and DISABLED (greyed out) with no row selected.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_024 | Verify CREATE LOG Button is Visible and Disabled by Default at Test Suite Level', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + deep tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution, expand to the Test Suite and click it ─────────
    await be.openBulkExecution();
    await be.expandRelease(data.releaseWithCycles);
    await be.expandCycle(data.cycleWithRuns);
    await be.expandCycle(data.subCycleWithSuite);
    await be.selectSuite(data.suiteWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 1: Test Suite grid loaded");

    // ─── Step 2-3: CREATE LOG visible above the table and disabled (no selection) ───
    await be.verifyCreateLogVisibleAndDisabled();
    await captureScreenshot(page, "Step 2-3: CREATE LOG visible and disabled by default");
  });

});
