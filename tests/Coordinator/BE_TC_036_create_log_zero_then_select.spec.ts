/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_036
 * Test Name    : Verify CREATE LOG is Disabled with Zero Selection and Enabled After Selecting an Eligible Row
 *
 * Description  : As a Test Engineer, I want to verify that the CREATE LOG button state correctly
 *                reflects whether eligible rows are selected or not.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *
 * Steps:
 *   1. Follow BE_TC_011/016 to open the grid with no rows selected.
 *   2. Attempt to click the CREATE LOG button while it is disabled.
 *   3. Tick the checkbox of one eligible (blank Execution Date) row.
 *
 * Expected: CREATE LOG is disabled with no selection; clicking it does nothing (no error); it becomes
 *   enabled after an eligible row is selected.
 *
 * NOTE: CREATE LOG is a real disabled <button> when no row is selected, so it is inherently
 *   non-interactive — asserting its disabled state proves "nothing happens / no API call / no error".
 *   Uses the Cycle grid (the Release grid in this data has no log-eligible rows).
 *
 * Post-condition: no data is mutated (the selection is not saved).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_036 | Verify CREATE LOG is Disabled with Zero Selection and Enabled After Selecting an Eligible Row', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    test.skip(await be.getEligibleRowCount() === 0, 'No log-eligible row on this grid page.');

    // ─── Step 1-2: CREATE LOG disabled with zero selection; clicking is a no-op ─────
    await be.verifyCreateLogVisibleAndDisabled();
    await expect(be.createLogButton).toBeDisabled(); // disabled button → click does nothing, no error
    await expect(be.notification(/error|fail/i)).toHaveCount(0);
    await captureScreenshot(page, "Step 1-2: CREATE LOG disabled, not clickable");

    // ─── Step 3: select one eligible row → CREATE LOG becomes enabled ───────────────
    await be.selectFirstEligibleRow();
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, "Step 3: Eligible row selected, CREATE LOG enabled");
  });

});
