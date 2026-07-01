/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_025
 * Test Name    : Verify Switching Between Test Suites Correctly Refreshes the Grid
 *
 * Description  : As a Test Engineer, I want to verify that switching between Test Suites correctly
 *                refreshes the grid without stale data from the previous suite.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_021 and click Suite A.
 *   2. Note the Test Run IDs displayed in the grid.
 *   3. Click Suite B (a different Test Suite).
 *   4. Verify the grid content after refresh.
 *
 * Expected: Suite A shows its runs; selecting Suite B refreshes the grid so that no Suite A runs
 *   remain, only Suite B runs are shown, and the Total Entries count updates to Suite B's count.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_025 | Verify Switching Between Test Suites Correctly Refreshes the Grid', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + deep tree expansion + two grid loads
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: expand to reveal both Test Suites, click Suite A ───────────────────
    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.expandRelease(data.releaseWithCycles);
    await be.expandCycle(data.cycleWithRuns);
    await be.expandCycle(data.subCycleWithSuite);   // reveals Suite A
    await be.expandCycle(data.secondSubCycle);      // reveals Suite B
    await be.selectSuite(data.suiteWithRuns);
    await be.verifySuiteActive(data.suiteWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 1: Suite A selected, grid loaded");

    // ─── Step 2: note Suite A's Test Run IDs + count ───────────────────────────────
    const suiteAIds = await be.getTestRunIds();
    const suiteATotal = await be.getTotalEntriesCount();
    expect(suiteAIds.length).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2: Suite A run IDs noted");

    // ─── Step 3: click Suite B → grid refreshes ────────────────────────────────────
    await be.selectSuite(data.secondSuite);
    await be.verifySuiteActive(data.secondSuite);
    // The previous suite's rows linger until Suite B streams in — wait for the actual refresh.
    await be.waitForRunIdsChangedFrom(suiteAIds);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 3: Suite B selected, grid refreshed");

    // ─── Step 4: only Suite B runs shown (no stale Suite A data), count updated ─────
    const suiteBIds = await be.getTestRunIds();
    expect(suiteBIds.length).toBeGreaterThan(0);
    // No Suite A run remains visible.
    for (const id of suiteAIds) expect(suiteBIds, `stale Suite A run "${id}" still shown`).not.toContain(id);
    // The grid is a different run set and the Total Entries count reflects Suite B.
    expect(suiteBIds).not.toEqual(suiteAIds);
    await expect.poll(() => be.getTotalEntriesCount(), { timeout: 20000 }).not.toBe(suiteATotal);
    await captureScreenshot(page, "Step 4: Grid scoped to Suite B, count updated");
  });

});
