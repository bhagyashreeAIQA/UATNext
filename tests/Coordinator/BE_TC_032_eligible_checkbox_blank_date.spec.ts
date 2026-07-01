/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_032
 * Test Name    : Verify Only Rows with Blank Execution Date Have an Enabled Checkbox
 *
 * Description  : As a Test Engineer, I want to verify that only Test Runs without existing logs (blank
 *                Execution Date) are selectable via checkbox, and runs with existing logs are not.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. Grid contains a mix of rows with blank and populated Execution Dates.
 *
 * Steps:
 *   1. Follow BE_TC_011/016 to load a grid with a mix of rows (Cycle grid — the Release grid in this
 *      data has no log-eligible rows).
 *   2. Tick the checkbox of a row with a BLANK Execution Date.
 *   3. Attempt to tick the checkbox of a row with a POPULATED Execution Date.
 *
 * Expected: the blank-date row's checkbox toggles ON (row selected); the populated-date row's checkbox
 *   is disabled / non-interactive and stays unchecked.
 *
 * Post-condition: no data is mutated (the selection is not saved).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_032 | Verify Only Rows with Blank Execution Date Have an Enabled Checkbox', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);

    // ─── Step 1: both row types are visible ────────────────────────────────────────
    const states = await be.getRowSelectionStates();
    const eligible = states.filter(s => s.eligible);
    const ineligible = states.filter(s => !s.eligible);
    test.skip(eligible.length === 0, 'No log-eligible (blank Execution Date) row on this grid page.');
    expect(ineligible.length, 'expected at least one populated-date row').toBeGreaterThan(0);
    // Eligibility correlates exactly with a blank Execution Date.
    for (const s of states) expect(s.eligible, `row ${s.runId} eligibility vs date "${s.date}"`).toBe(s.date === '');
    await captureScreenshot(page, "Step 1: Mixed blank/populated rows visible");

    // ─── Step 2: blank-date row checkbox toggles ON ────────────────────────────────
    const eligibleRow = be.firstEligibleRow();
    const eligibleCb = eligibleRow.locator('.gtl-checkbox-cell input');
    await eligibleCb.check();
    await expect(eligibleCb).toBeChecked();
    await captureScreenshot(page, "Step 2: Blank-date row selected");

    // ─── Step 3: populated-date row checkbox is disabled and stays unchecked ────────
    const ineligibleCb = be.firstTestlogExistsRow().locator('.gtl-checkbox-cell input');
    await expect(ineligibleCb).toBeDisabled();
    await expect(ineligibleCb).not.toBeChecked();
    await captureScreenshot(page, "Step 3: Populated-date row not selectable");
  });

});
