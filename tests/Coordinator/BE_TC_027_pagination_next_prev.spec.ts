/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_027
 * Test Name    : Verify Navigating to the Next Page and Previous Page Shows Correct Records
 *
 * Description  : As a Test Engineer, I want to verify that pagination navigation works correctly
 *                showing the right set of records on each page.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026)
 *   6. The selected node has more runs than fit on one page.
 *
 * Steps:
 *   1. Follow BE_TC_026 to select a node with more runs than one page.
 *   2. Observe page 1 content.
 *   3. Click Next Page → page 2.
 *   4. Continue to page 3.
 *   5. Click Previous Page to return.
 *
 * Expected: page indicator updates (1 → 2 → 3 → 2); each page shows a distinct set of records with no
 *   duplicates carried over from the previous pages.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_027 | Verify Navigating to the Next Page and Previous Page Shows Correct Records', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + multi-page navigation
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.openCycleGrid(data.releaseWithCycles, data.cycleWithRuns);
    test.skip(await be.getTotalPages() < 3, 'Cycle does not span at least 3 pages in this data.');

    // ─── Step 2: page 1 — indicator shows 1, Previous/First disabled ───────────────
    expect(await be.getCurrentPage()).toBe(1);
    expect(await be.isNavDisabled('Previous')).toBe(true);
    const p1 = await be.getTestRunIds();
    expect(p1.length).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2: Page 1 records");

    // ─── Step 3: Next → page 2, distinct records (no Page 1 duplicates) ─────────────
    await be.goToNextPage();
    expect(await be.getCurrentPage()).toBe(2);
    const p2 = await be.getTestRunIds();
    for (const id of p2) expect(p1, `duplicate ${id} from page 1`).not.toContain(id);
    await captureScreenshot(page, "Step 3: Page 2 records");

    // ─── Step 4: Next → page 3, distinct from pages 1 and 2 ────────────────────────
    await be.goToNextPage();
    expect(await be.getCurrentPage()).toBe(3);
    const p3 = await be.getTestRunIds();
    for (const id of p3) expect([...p1, ...p2], `duplicate ${id} from earlier page`).not.toContain(id);
    await captureScreenshot(page, "Step 4: Page 3 records");

    // ─── Step 5: Previous → back to page 2 with its records ────────────────────────
    await be.goToPreviousPage();
    expect(await be.getCurrentPage()).toBe(2);
    expect(await be.getTestRunIds()).toEqual(p2);
    await captureScreenshot(page, "Step 5: Back to Page 2");
  });

});
