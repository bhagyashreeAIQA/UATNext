/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_038
 * Test Name    : Verify CREATE LOG Generates a Log for a Single Eligible Run (Blank Execution Date)
 *
 * Description  : As a Test Engineer, I want to verify that, under the SET Dealer CRM project, an
 *                eligible run (one with a blank Execution Date) can be located across the grid pages,
 *                selected via its checkbox, and a log created for it via CREATE LOG.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. At least one eligible run (blank Execution Date) exists somewhere in the SET Dealer CRM grid.
 *
 * Steps:
 *   1. Select the "SET Dealer CRM" project and navigate its cycle tree (Release "SET Dealer CRM" →
 *      Cycle "SET Dealer CRM" → Sales Ops) to load the Sales Ops Test Run grid.
 *   2. Search the grid pages for ONE row with a blank Execution Date (an eligible row).
 *   3. Select that single row's checkbox.
 *   4. Click CREATE LOG and wait for processing to complete.
 *   5. Re-inspect the processed row.
 *
 * Expected: a success message; the row gains a populated Execution Date, shows "Testlog exists", and
 *   its checkbox becomes disabled (no longer selectable).
 *
 * BUILD NOTE (verified 2026-06-29): CREATE LOG SUCCEEDS when the run is selected through the cycle tree
 *   (SET Dealer CRM → Cycle "SET Dealer CRM" → Sales Ops) — the success toast shows and the processed
 *   row becomes logged ("Testlog exists", disabled). On the release-scoped grid (no cycle context) the
 *   same action instead errored "Log creation failed for all selected test runs"; selecting through the
 *   Sales Ops cycle is what makes log creation work, so this case now runs (no longer test.fixme).
 *
 * ENV NOTE: under UATNext Dev the Bulk Execution Projects dropdown defaults to "SET Dealer CRM". Its
 *   tree is Release "SET Dealer CRM" → Cycle "SET Dealer CRM" → {Sales Ops, Dealer Services, Dealer
 *   Master, Distribution}. Selecting the Sales Ops cycle loads a 40-row / 4-page grid whose first two
 *   pages are already-logged rows (populated Execution Date, disabled checkbox); the blank-date
 *   eligible rows appear on pages 3-4 (verified 2026-06-29: 17 rows), so the body pages through the
 *   grid until it finds one rather than assuming an eligible row on page 1.
 *
 * Post-condition: this case (when enabled) MUTATES data — it creates a test log for the selected run.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_038 | Verify CREATE LOG Generates a Log for a Single Eligible Run (Blank Execution Date)', async ({ page }) => {
    test.slow();
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();

    // ─── Step 1: select SET Dealer CRM and drill the cycle tree down to Sales Ops ────
    // Tree: Release "SET Dealer CRM" → Cycle "SET Dealer CRM" → Sales Ops. Selecting the Sales Ops
    // cycle loads its Test Run grid.
    await be.selectProject('SET Dealer CRM');
    await be.expandRelease('SET Dealer CRM');
    await be.expandCycle('SET Dealer CRM');
    await be.selectCycle('Sales Ops');
    await be.verifyCycleActive('Sales Ops');
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, 'Step 1: Sales Ops grid loaded');

    // ─── Step 2: search the grid pages for ONE blank-Execution-Date (eligible) row ───
    const target = await be.findFirstEmptyExecutionDateRow();
    expect(target, 'expected at least one blank-Execution-Date run across the grid pages').toBeTruthy();
    await captureScreenshot(page, 'Step 2: Blank Execution Date run located');

    // ─── Step 3: select that single row → checkbox checked + CREATE LOG enabled ──────
    await be.selectRowByRunId(target);
    await expect(be.rowByRunId(target).locator('.gtl-checkbox-cell input')).toBeChecked();
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, 'Step 3: Single eligible run selected');

    // ─── Step 4: CREATE LOG → success message, no error ──────────────────────────────
    await be.clickCreateLog();
    await expect(be.notification(/success|created|log.*generated/i)).toBeVisible({ timeout: 30000 });
    await expect(be.notification(/error|fail/i)).toHaveCount(0);
    await captureScreenshot(page, 'Step 4: Log creation success message');

    // ─── Step 5: processed row now has an Execution Date + "Testlog exists" + disabled ─
    const row = be.rowByRunId(target);
    await expect(row.locator('.gtl-execution-date-cell')).not.toHaveText('');
    const cb = row.locator('.gtl-checkbox-cell input');
    await expect(cb).toBeDisabled();
    expect(await be.getDisabledCheckboxTitle(row)).toMatch(/testlog exists/i);
    await captureScreenshot(page, 'Step 5: Row logged — Testlog exists, not selectable');
  });

});
