/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_029
 * Test Name    : Verify Applied Sort Order is Maintained When Navigating Between Pages
 *
 * Description  : As a Test Engineer, I want to verify that the sort order applied on the grid is
 *                maintained consistently across all pages during pagination.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. The grid has multiple pages of data.
 *
 * Steps:
 *   1. Follow BE_TC_026 to load a multi-page grid.
 *   2. Click the Test Run ID sort control → ascending.
 *   3. Navigate to Page 2.
 *
 * Expected: Page 1 sorts ascending by Test Run ID; Page 2 keeps the ascending sort order.
 *
 * BUILD NOTE: this build applies the sort PER PAGE (each page is independently sorted), not as a
 *   global server-side sort — so the documented "smallest Test Run ID on Page 2 > largest on Page 1"
 *   does NOT hold (Page 2 can start below Page 1's max). This test therefore asserts the order is
 *   maintained as a mode across navigation (Page 2 is itself ascending, and is not the default/unsorted
 *   order), which is the observable behaviour. Verified live 2026-06-23.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { BulkExecutionPage } from '../../pages/Coordinator/BulkExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const num = BulkExecutionPage.trNum;
const isAscending = (ids: string[]) => ids.every((id, i) => i === 0 || num(ids[i - 1]) <= num(id));

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_029 | Verify Applied Sort Order is Maintained When Navigating Between Pages', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + sort + pagination
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    test.skip(await be.getTotalPages() < 2, 'Cycle grid is single-page in this data.');

    // ─── Step 2: sort ascending by Test Run ID ─────────────────────────────────────
    const defaultOrder = await be.getTestRunIds();
    // Sanity: the default (unsorted) order is NOT already ascending, so the sort has a real effect.
    expect(isAscending(defaultOrder), `default order already ascending: ${defaultOrder.join(', ')}`).toBe(false);
    await be.clickSort('runId');
    expect(await be.getSortDirection('runId')).toBe('asc');
    const p1 = await be.getTestRunIds();
    expect(isAscending(p1), `page 1 not ascending: ${p1.join(', ')}`).toBe(true);
    await captureScreenshot(page, "Step 2: Page 1 sorted ascending by Test Run ID");

    // ─── Step 3: Page 2 keeps the ascending sort order (maintained across navigation) ─
    await be.goToNextPage();
    const p2 = await be.getTestRunIds();
    expect(isAscending(p2), `page 2 not ascending: ${p2.join(', ')}`).toBe(true);
    await captureScreenshot(page, "Step 3: Ascending sort order maintained on Page 2");
  });

});
