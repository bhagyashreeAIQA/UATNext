/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_030
 * Test Name    : Verify Grid Can Be Sorted by Test Run ID and Execution Date in Ascending and Descending Order
 *
 * Description  : As a Test Engineer, I want to verify that the grid supports sorting by Test Run ID
 *                and Execution Date columns in both ascending and descending order.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *
 * Steps:
 *   1. Follow BE_TC_011/016 to load the grid with multiple runs (Cycle grid — it carries both blank
 *      and populated Execution Dates, which the Release grid in this data does not).
 *   2. Click the Test Run ID sort control → ascending.
 *   3. Click it again → descending.
 *   4. Click the Execution Date sort control.
 *
 * Expected: Test Run ID sorts ascending then descending (icon reflects direction; the descending first
 *   row is the global max); Execution Date sort groups blank dates together and orders populated dates
 *   chronologically.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { BulkExecutionPage } from '../../pages/Coordinator/BulkExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const num = BulkExecutionPage.trNum;
const isAsc  = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] <= v);
const isDesc = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] >= v);

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_030 | Verify Grid Can Be Sorted by Test Run ID and Execution Date in Ascending and Descending Order', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + multiple sorts
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);

    // ─── Step 2: sort ascending by Test Run ID ─────────────────────────────────────
    await be.clickSort('runId');
    expect(await be.getSortDirection('runId')).toBe('asc');
    const asc = (await be.getTestRunIds()).map(num);
    expect(isAsc(asc), `not ascending: ${asc.join(', ')}`).toBe(true);
    await captureScreenshot(page, "Step 2: Sorted ascending by Test Run ID");

    // ─── Step 3: sort descending by Test Run ID ────────────────────────────────────
    await be.clickSort('runId');
    expect(await be.getSortDirection('runId')).toBe('desc');
    const desc = (await be.getTestRunIds()).map(num);
    expect(isDesc(desc), `not descending: ${desc.join(', ')}`).toBe(true);
    // Descending puts the largest Test Run ID first (was last under ascending).
    expect(desc[0]).toBeGreaterThan(asc[0]);
    await captureScreenshot(page, "Step 3: Sorted descending by Test Run ID");

    // ─── Step 4: sort by Execution Date — blanks grouped, populated chronological ───
    await be.clickSort('date');
    const rows = await be.getRows();
    const dates = rows.map(r => r.date);
    // Blank Execution Dates group together (a contiguous run — here at the top).
    const firstNonBlank = dates.findIndex(d => d !== '');
    const blanks = dates.filter(d => d === '').length;
    if (blanks > 0) {
      expect(dates.slice(0, blanks).every(d => d === ''), `blank dates not grouped: ${dates.join(' | ')}`).toBe(true);
    }
    // Populated dates are in chronological (ascending) order.
    const times = dates.slice(firstNonBlank === -1 ? dates.length : firstNonBlank)
      .filter(d => d !== '').map(d => new Date(d).getTime());
    expect(times.every((t, i) => i === 0 || times[i - 1] <= t), `dates not chronological: ${dates.join(' | ')}`).toBe(true);
    await captureScreenshot(page, "Step 4: Sorted by Execution Date (blanks grouped, chronological)");
  });

});
