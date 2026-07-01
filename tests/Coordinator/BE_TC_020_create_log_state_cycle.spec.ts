/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_020
 * Test Name    : Verify CREATE LOG Button is Visible and State is Correct at Cycle Level
 *
 * Description  : As a Test Engineer, I want to verify that the CREATE LOG button state correctly
 *                reflects the row selection status at the Test Cycle level.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_011 → expand a Release and reveal its Test Cycles.
 *   2. Click a Test Cycle.
 *   3. Observe CREATE LOG before any row selection.
 *   4. Select one eligible row (enabled checkbox / blank Execution Date) by ticking its checkbox.
 *   5. Deselect the row.
 *
 * Expected: CREATE LOG is disabled with no selection, becomes enabled when an eligible row is ticked,
 *   and returns to disabled when the row is unticked.
 *
 * DATA NOTE: an "eligible" row is one without an existing test log (its checkbox is enabled; rows that
 *   already have a log are disabled with title "Testlog exists"). This test SKIPS at runtime if the
 *   cycle grid has no eligible row. Testdata_Cycle_1 currently exposes one.
 *
 * Post-condition: no data is mutated — the row is deselected and no log is created.
 */

import { test } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_020 | Verify CREATE LOG Button is Visible and State is Correct at Cycle Level', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution and expand a Release to reveal Cycles ──────────
    await be.openBulkExecution();
    // The panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.expandRelease(data.releaseWithCycles);
    await captureScreenshot(page, "Step 1: Release expanded, Cycles shown");

    // ─── Step 2: click a Test Cycle → grid loads ───────────────────────────────────
    await be.selectCycle(data.cycleWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 2: Cycle grid loaded");

    // ─── Step 3: CREATE LOG disabled before any selection ──────────────────────────
    await be.verifyCreateLogVisibleAndDisabled();
    await captureScreenshot(page, "Step 3: CREATE LOG disabled (no selection)");

    test.skip(await be.getEligibleRowCount() === 0, 'No log-eligible row in this cycle grid to select.');

    // ─── Step 4: tick an eligible row → CREATE LOG becomes enabled ──────────────────
    await be.selectFirstEligibleRow();
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, "Step 4: Eligible row selected, CREATE LOG enabled");

    // ─── Step 5: untick the row → CREATE LOG returns to disabled ────────────────────
    await be.deselectFirstEligibleRow();
    await be.verifyCreateLogDisabled();
    await captureScreenshot(page, "Step 5: Row deselected, CREATE LOG disabled again");
  });

});
