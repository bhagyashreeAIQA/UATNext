/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_033
 * Test Name    : Verify 'Testlog Exists' Label or Indicator is Shown for Non-Selectable Rows
 *
 * Description  : As a Test Engineer, I want to verify that non-selectable rows clearly indicate why
 *                they cannot be selected through a "Testlog exists" label or tooltip.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. Grid contains rows with populated Execution Date (existing logs).
 *
 * Steps:
 *   1. Follow BE_TC_011/016 to load the grid.
 *   2. Identify a row with a populated Execution Date.
 *   3. Inspect the checkbox area of the non-selectable row.
 *
 * Expected: the row has a populated Execution Date; a "Testlog exists" indicator (the checkbox title /
 *   tooltip) is present; the checkbox is disabled / greyed out.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_033 | Verify Testlog Exists Indicator is Shown for Non-Selectable Rows', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    await captureScreenshot(page, "Step 1: Cycle grid loaded");

    // ─── Step 2: a non-selectable row has a populated Execution Date ───────────────
    const row = be.firstTestlogExistsRow();
    const date = (await row.locator('.gtl-execution-date-cell').innerText()).trim();
    expect(date, 'non-selectable row should have a populated Execution Date').not.toBe('');
    await captureScreenshot(page, "Step 2: Populated-date (non-selectable) row identified");

    // ─── Step 3: "Testlog exists" indicator + disabled checkbox ────────────────────
    const cb = row.locator('.gtl-checkbox-cell input');
    await expect(cb).toBeDisabled();
    expect(await be.getDisabledCheckboxTitle(row)).toMatch(/testlog exists/i);
    await captureScreenshot(page, "Step 3: Testlog exists indicator shown, checkbox disabled");
  });

});
