/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_026
 * Test Name    : Verify Total Entry Count is Displayed in the Grid
 *
 * Description  : As a Test Engineer, I want to verify that the total entry count is accurately
 *                displayed in the grid pagination area.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_016 to select a node (Cycle) that returns many runs.
 *   2. Observe the grid footer / pagination area.
 *
 * Expected: grid loads with data; a Total record count is shown and reflects the selected scope.
 *
 * NOTE: the count is asserted against the per-page rows × pages math — the displayed total must be at
 *   least the rows on a full first page (multi-page node) and equal the sum across pages (see BE_TC_028).
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_026 | Verify Total Entry Count is Displayed in the Grid', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open the Cycle grid (many runs) ───────────────────────────────────
    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    await captureScreenshot(page, "Step 1: Cycle grid loaded with many runs");

    // ─── Step 2: Total entry count is displayed and reflects the scope ─────────────
    expect(await be.getTotalEntriesText()).toMatch(/Total\s+\d+\s+Entries/i);
    const total = await be.getTotalEntriesCount();
    expect(total).toBeGreaterThan(0);
    // Multi-page scope: total must be at least the rows shown on the (full) first page.
    expect(total).toBeGreaterThanOrEqual(await be.getDataRowCount());
    await captureScreenshot(page, "Step 2: Total entry count displayed");
  });

});
