/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_037
 * Test Name    : Verify CREATE LOG Reverts to Disabled When All Selected Rows Are Deselected
 *
 * Description  : As a Test Engineer, I want to verify that the CREATE LOG button correctly reverts to
 *                disabled state when all selected rows are deselected.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *
 * Steps:
 *   1. Follow BE_TC_036 to select one eligible row.
 *   2. Verify CREATE LOG is enabled.
 *   3. Untick that row's checkbox.
 *   4. Select the eligible rows via the Master checkbox, then deselect all by unticking it.
 *
 * Expected: CREATE LOG is enabled after selection; returns to disabled when the row is unticked; and
 *   returns to disabled again once zero rows are selected (Master unticked).
 *
 * NOTE: uses the Cycle grid. The page may expose one or more eligible rows — the Master checkbox path
 *   exercises "select all eligible → deselect all" regardless of the exact count.
 *
 * Post-condition: no data is mutated (selections are not saved).
 */

import { test } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_037 | Verify CREATE LOG Reverts to Disabled When All Selected Rows Are Deselected', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    test.skip(await be.getEligibleRowCount() === 0, 'No log-eligible row on this grid page.');

    // ─── Step 1-2: select one eligible row → CREATE LOG enabled ─────────────────────
    await be.selectFirstEligibleRow();
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, "Step 1-2: Eligible row selected, CREATE LOG enabled");

    // ─── Step 3: untick that row → CREATE LOG reverts to disabled ───────────────────
    await be.deselectFirstEligibleRow();
    await be.verifyCreateLogDisabled();
    await captureScreenshot(page, "Step 3: Row deselected, CREATE LOG disabled");

    // ─── Step 4: Master select all eligible → enabled; untick Master → disabled ─────
    await be.clickMasterCheckbox();
    await be.verifyCreateLogEnabled();
    await be.uncheckMasterCheckbox();
    await be.verifyCreateLogDisabled();
    await captureScreenshot(page, "Step 4: Master deselected all, CREATE LOG disabled");
  });

});
