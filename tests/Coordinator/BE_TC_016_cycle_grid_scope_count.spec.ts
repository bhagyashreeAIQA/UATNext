/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_016
 * Test Name    : Verify Grid is Scoped to the Selected Test Cycle with Correct Columns and Entry Count
 *
 * Description  : As a Test Engineer, I want to verify that the Test Run grid displays only runs
 *                belonging to the selected Test Cycle with all required columns and the total count
 *                updates correctly.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_011 → expand a Release that carries Cycles.
 *   2. Click a Test Cycle node → grid loads.
 *   3. Validate the grid headers (all required columns).
 *   4. Observe the grid data + Total Entries count after loading.
 *   5. Select a different node and re-select the cycle → count updates / no stale data.
 *
 * Expected: grid refreshes with the required columns, scoped to the selected Cycle; the entry count
 *   changes between nodes and is restored when the cycle is re-selected (no stale data).
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_016 | Verify Grid is Scoped to the Selected Test Cycle with Correct Columns and Entry Count', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + multiple grid loads
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution and expand a Release with Cycles ───────────────
    await be.openBulkExecution();
    // The panel defaults to another project ("SET Dealer CRM"); select Testdata_Module and wait for
    // its Release tree before expanding.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.expandRelease(data.releaseWithCycles);
    await expect.poll(() => be.getCycleNames(), { timeout: 20000 }).toContain(data.cycleWithRuns);
    await captureScreenshot(page, "Step 1: Release expanded, Cycles shown");

    // ─── Step 2: click the Test Cycle → grid loads, cycle highlighted ──────────────
    await be.selectCycle(data.cycleWithRuns);
    await be.verifyTestRunGridLoaded();
    await be.verifyCycleActive(data.cycleWithRuns);
    const cycleTotal = await be.getTotalEntriesCount();
    await captureScreenshot(page, "Step 2: Cycle selected, grid loaded");

    // ─── Step 3: grid headers include the Checkbox + all required columns ───────────
    await be.verifyGridColumns(data.gridColumns);
    await be.verifyRowDataMapping(data.statusValues);
    await captureScreenshot(page, "Step 3: Required columns present, data scoped to cycle");

    // ─── Step 4: Total Entries count is shown ──────────────────────────────────────
    expect(await be.getTotalEntriesText()).toMatch(/Total\s+\d+/i);
    await captureScreenshot(page, "Step 4: Total Entries count displayed");

    // ─── Step 5: switch to another node then re-select the cycle → count updates ────
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    // Count updates per node selection (the total refreshes asynchronously after the rows render).
    await expect.poll(() => be.getTotalEntriesCount(), { timeout: 20000 }).not.toBe(cycleTotal);
    await be.selectCycle(data.cycleWithRuns);
    await be.verifyTestRunGridLoaded();
    await expect.poll(() => be.getTotalEntriesCount(), { timeout: 20000 }).toBe(cycleTotal); // restored, no stale data
    await captureScreenshot(page, "Step 5: Count updates per node and restores on re-select");
  });

});
