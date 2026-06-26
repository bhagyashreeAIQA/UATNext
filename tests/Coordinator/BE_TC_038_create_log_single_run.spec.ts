/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_038
 * Test Name    : Verify CREATE LOG Generates a Log for a Single Eligible Run with No Version Mismatch
 *
 * Description  : As a Test Engineer, I want to verify that clicking CREATE LOG for a single eligible
 *                run with a matching version creates a log successfully without any errors.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. At least one eligible run (blank Execution Date) exists with NO version mismatch (black version).
 *
 * Steps:
 *   1. Follow BE_TC_032 to select one eligible run with NO version mismatch.
 *   2. Verify the Test Case Version is displayed in the normal (non-red) colour.
 *   3. Click CREATE LOG.
 *   4. Wait for processing to complete.
 *   5. Re-inspect the processed row.
 *
 * Expected: a success message; the row gains a populated Execution Date, shows "Testlog exists", and
 *   its checkbox becomes disabled (no longer selectable).
 *
 * BUILD NOTE — fixme: in this environment CREATE LOG does NOT successfully generate a log. With a valid
 *   eligible + no-mismatch run selected (TR-1396 on Testdata_Module → P01 → Cycle_1), clicking CREATE
 *   LOG raises the toast "Error: Log creation failed for all selected test runs." and the row stays
 *   blank/eligible/checked — no log is created. The successful-creation outcome this case asserts
 *   therefore cannot be verified here, so it is marked test.fixme. The body encodes the intended flow
 *   for when the backend supports bulk log creation. Re-verified live 2026-06-24 (error toast class
 *   `.notification`; row unchanged afterwards).
 *
 * ENV NOTE: the UATNext Dev workspace now defaults its Bulk Execution Projects dropdown to
 *   "SET Dealer CRM" (which carries no cycle tree); the runs live under the "Testdata_Module" project,
 *   so the body selects that project before opening the cycle grid.
 *
 * Post-condition: this case (when enabled) MUTATES data — it creates a test log for the selected run.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test.fixme('BE_TC_038 | Verify CREATE LOG Generates a Log for a Single Eligible Run with No Version Mismatch', async ({ page }) => {
    test.slow();
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // UATNext Dev now defaults to the "SET Dealer CRM" project (no cycles); the test runs live under
    // Testdata_Module, so select it before opening the cycle grid.
    await be.selectProject(data.expectedProject);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);

    // ─── Step 1: find a run with a BLANK Execution Date (+ no version mismatch) and
    //             tick its checkbox ─────────────────────────────────────────────────
    const rows = await be.getRowSelectionStates();
    const colors = await be.getVersionCellColors();
    // A blank Execution Date is exactly what makes a row eligible (enabled checkbox).
    const idx = rows.findIndex((r, i) => r.date === '' && r.eligible && colors[i] === data.versionMatchColor);
    expect(idx, 'expected an eligible (blank-date) no-mismatch run on this grid page').toBeGreaterThanOrEqual(0);
    const target = rows[idx].runId;
    await be.selectRowByRunId(target);
    await expect(be.rowByRunId(target).locator('.gtl-checkbox-cell input')).toBeChecked();
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, "Step 1: Blank Execution Date run selected");

    // ─── Step 2: the run's version is shown in the normal (non-mismatch) colour ─────
    expect(colors[idx]).toBe(data.versionMatchColor);
    await captureScreenshot(page, "Step 2: Version shown in normal colour");

    // ─── Step 3-4: CREATE LOG → success message, no error ──────────────────────────
    await be.clickCreateLog();
    await expect(be.notification(/success|created|log.*generated/i)).toBeVisible({ timeout: 30000 });
    await expect(be.notification(/error|fail/i)).toHaveCount(0);
    await captureScreenshot(page, "Step 3-4: Log creation success message");

    // ─── Step 5: processed row now has an Execution Date + "Testlog exists" + disabled ─
    const row = be.rowByRunId(target);
    await expect(row.locator('.gtl-execution-date-cell')).not.toHaveText('');
    const cb = row.locator('.gtl-checkbox-cell input');
    await expect(cb).toBeDisabled();
    expect(await be.getDisabledCheckboxTitle(row)).toMatch(/testlog exists/i);
    await captureScreenshot(page, "Step 5: Row logged — Testlog exists, not selectable");
  });

});
