/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_028
 * Test Name    : Verify No Data Duplication or Missing Records Across All Pages
 *
 * Description  : As a Test Engineer, I want to verify that the total records across all pages match
 *                the displayed Total Entries count with no duplicates or missing records.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. A node with a known total count is selected (spanning multiple pages).
 *
 * Steps:
 *   1. Follow BE_TC_026 to select a node with a known total.
 *   2. Observe Page 1.
 *   3. Navigate through ALL pages via Next.
 *   4. Collect the records on each page.
 *
 * Expected: the sum of records across all pages equals the Total Entries count; no Test Run ID appears
 *   on more than one page; no records missing.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_028 | Verify No Data Duplication or Missing Records Across All Pages', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + walking every page
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);

    const total = await be.getTotalEntriesCount();
    const pages = await be.getTotalPages();
    await captureScreenshot(page, "Step 1-2: Page 1 of a known total");

    // ─── Step 3-4: walk every page, collecting all Test Run IDs ────────────────────
    const allIds: string[] = [];
    for (let p = 1; p <= pages; p++) {
      if (p > 1) await be.goToNextPage();
      expect(await be.getCurrentPage()).toBe(p);
      allIds.push(...await be.getTestRunIds());
    }
    await captureScreenshot(page, "Step 3-4: All pages traversed");

    // Sum of records across all pages equals the Total Entries count.
    expect(allIds.length).toBe(total);
    // No Test Run ID appears on more than one page (no duplicates → no missing).
    expect(new Set(allIds).size).toBe(total);
  });

});
