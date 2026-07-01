/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_034
 * Test Name    : Verify Master (Header) Checkbox Selects Only Eligible Rows on the Current Page
 *
 * Description  : As a Test Engineer, I want to verify that the Master (header) checkbox selects only
 *                eligible rows (blank Execution Date) on the current page and does not select
 *                non-eligible rows.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. Current page contains both eligible and non-eligible rows.
 *
 * Steps:
 *   1. Follow BE_TC_011/016 to load a page containing both eligible and "Testlog exists" rows.
 *   2. Click the Master (header) checkbox.
 *   3. Verify the CREATE LOG button state.
 *
 * Expected: all eligible (blank-date) rows on the page are checked, "Testlog exists" rows stay
 *   unchecked, and CREATE LOG becomes enabled.
 *
 * Post-condition: no data is mutated (the selection is not saved).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_034 | Verify Master (Header) Checkbox Selects Only Eligible Rows on the Current Page', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);

    // ─── Step 1: page has both eligible and non-eligible rows; CREATE LOG disabled ──
    const before = await be.getRowSelectionStates();
    const eligibleCount = before.filter(s => s.eligible).length;
    test.skip(eligibleCount === 0, 'No log-eligible row on this grid page.');
    expect(before.filter(s => !s.eligible).length, 'expected non-eligible rows too').toBeGreaterThan(0);
    expect(await be.isMasterCheckboxEnabled()).toBe(true);
    await be.verifyCreateLogVisibleAndDisabled();
    await captureScreenshot(page, "Step 1: Mixed rows, CREATE LOG disabled");

    // ─── Step 2: click Master → only eligible rows checked ─────────────────────────
    await be.clickMasterCheckbox();
    const after = await be.getRowSelectionStates();
    for (const s of after) {
      expect(s.checked, `row ${s.runId} (eligible=${s.eligible}) checked state`).toBe(s.eligible);
    }
    expect(after.filter(s => s.checked).length).toBe(eligibleCount);
    await captureScreenshot(page, "Step 2: Only eligible rows selected by Master checkbox");

    // ─── Step 3: CREATE LOG becomes enabled ────────────────────────────────────────
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, "Step 3: CREATE LOG enabled");
  });

});
