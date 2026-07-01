/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_035
 * Test Name    : Verify Master Checkbox Selection Does NOT Carry Over to Other Pages
 *
 * Description  : As a Test Engineer, I want to verify that the Master checkbox selection is
 *                page-scoped and does not carry over selections to other pages during pagination.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. Grid has multiple pages of data.
 *
 * Steps:
 *   1. Follow BE_TC_034 to load a multi-page grid.
 *   2. Click the Master checkbox on Page 1.
 *   3. Navigate to Page 2.
 *
 * Expected: eligible rows on Page 1 are selected; Page 2 rows are NOT pre-selected; the Master
 *   checkbox on Page 2 is unchecked.
 *
 * Post-condition: no data is mutated (the selection is not saved).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_035 | Verify Master Checkbox Selection Does NOT Carry Over to Other Pages', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + master select + pagination
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    test.skip(await be.getTotalPages() < 2, 'Cycle grid is single-page in this data.');

    // ─── Step 2: click Master on Page 1 → eligible rows selected ───────────────────
    const p1 = await be.getRowSelectionStates();
    test.skip(p1.filter(s => s.eligible).length === 0, 'No log-eligible row on Page 1.');
    await be.clickMasterCheckbox();
    const p1after = await be.getRowSelectionStates();
    expect(p1after.some(s => s.checked), 'Page 1 should have selected rows').toBe(true);
    for (const s of p1after) expect(s.checked).toBe(s.eligible);
    await captureScreenshot(page, "Step 2: Page 1 eligible rows selected via Master");

    // ─── Step 3: go to Page 2 → no rows pre-selected, Master unchecked ─────────────
    await be.goToNextPage();
    expect(await be.getCurrentPage()).toBe(2);
    const p2 = await be.getRowSelectionStates();
    expect(p2.every(s => !s.checked), 'Page 2 rows must not be pre-selected').toBe(true);
    await expect(be.masterCheckbox).not.toBeChecked();
    await captureScreenshot(page, "Step 3: Page 2 has no carried-over selection");
  });

});
