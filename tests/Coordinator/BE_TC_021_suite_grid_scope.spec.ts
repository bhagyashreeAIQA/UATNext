/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_021
 * Test Name    : Verify Clicking a Test Suite Populates Only That Suite's Test Runs with All Required Columns in the Right Grid
 *
 * Description  : As a Test Engineer, I want to verify that selecting a Test Suite loads only that
 *                suite's test runs with all required columns in the grid so that the scope is
 *                correctly filtered.
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
 *   2. Expand a Test Cycle to reveal Test Suites.
 *   3. Click a Test Suite.
 *   4. Observe the right-side grid after loading.
 *   5. Inspect the grid column headers.
 *
 * Expected: the Suite is highlighted; the grid shows ONLY that suite's runs with all required columns.
 *
 * TREE NOTE: the suite leaf (.test-suite-row) sits under a second-level cycle — the path is
 *   Release(P01) → Cycle(Testdata_Cycle_1) → sub-cycle(Sales Ops) → suite(Sales Ops). Verified live.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_021 | Verify Clicking a Test Suite Populates Only That Suite\'s Test Runs with All Required Columns in the Right Grid', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + deep tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution, expand a Release to reveal Cycles ─────────────
    await be.openBulkExecution();
    await be.expandRelease(data.releaseWithCycles);
    await captureScreenshot(page, "Step 1: Release expanded, Cycles shown");

    // ─── Step 2: expand the Cycle → sub-cycle → reveal the Test Suite ───────────────
    await be.expandCycle(data.cycleWithRuns);
    await be.expandCycle(data.subCycleWithSuite);
    await captureScreenshot(page, "Step 2: Cycle expanded, Test Suite revealed");

    // ─── Step 3: click a Test Suite → grid loads, suite highlighted ────────────────
    await be.selectSuite(data.suiteWithRuns);
    await be.verifySuiteActive(data.suiteWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 3: Test Suite selected, grid loaded");

    // ─── Step 4: grid shows the suite's runs, data mapped to columns ────────────────
    await be.verifyRowDataMapping(data.statusValues);
    await captureScreenshot(page, "Step 4: Suite-scoped runs displayed");

    // ─── Step 5: grid headers include the Checkbox + all required columns ───────────
    await be.verifyGridColumns(data.gridColumns);
    await captureScreenshot(page, "Step 5: Required columns present");
  });

});
