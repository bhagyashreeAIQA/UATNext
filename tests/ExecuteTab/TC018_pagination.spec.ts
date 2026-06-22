/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Grid Pagination
 * Test Case ID : TC-018
 * Test Case Name: Verify Test Run Grid Pagination
 *
 * Description  : As a Test Engineer, I want to validate that pagination in the test run
 *                grid works correctly, so that I can navigate through large sets of test
 *                runs easily.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-006 (View All so the grid spans multiple pages).
 *
 * Steps:
 *   1. Follow TC-006.
 *   2. Validate pagination controls at the bottom.
 *   3. Click on Next Page.
 *   4. Click on Last Page.
 *   5. Click on Previous Page.
 *   6. Click on First Page.
 *
 * Note: The grid paginates at 10 rows per page. The cycle holds well over a page of runs
 *       under View All, so multiple pages exist to navigate.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Grid Pagination', () => {

  test('TC-018 | Verify Test Run Grid Pagination', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-006): reach a multi-page grid under View All ─────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });

    // Guard: pagination is only meaningful when more than one page of runs exists.
    expect(await executeTabPage.getTotalEntries()).toBeGreaterThan(10);
    await captureScreenshot(page, "Step 1 (follows TC-006): reach a multi-page grid under View All");

    // ─── Step 2: Validate pagination controls at the bottom ──────────────────────
    // Expected: Pagination controls should be visible

    await executeTabPage.verifyPaginationControlsVisible();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Step 2: Validate pagination controls at the bottom");

    // ─── Step 3: Click Next Page ─────────────────────────────────────────────────
    // Expected: Grid refreshes and displays the next set of test runs

    await executeTabPage.goToNextPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(2);
    await captureScreenshot(page, "Step 3: Click Next Page");

    // ─── Step 4: Click Last Page ─────────────────────────────────────────────────
    // Expected: Grid refreshes and displays the last set of test runs

    await executeTabPage.goToLastPage();
    const lastPage = await executeTabPage.getCurrentPageNumber();
    expect(lastPage).toBeGreaterThan(2);
    await captureScreenshot(page, "Step 4: Click Last Page");

    // ─── Step 5: Click Previous Page ─────────────────────────────────────────────
    // Expected: Grid refreshes and displays the previous set of test runs

    await executeTabPage.goToPreviousPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(lastPage - 1);
    await captureScreenshot(page, "Step 5: Click Previous Page");

    // ─── Step 6: Click First Page ────────────────────────────────────────────────
    // Expected: Grid refreshes and displays the first set of test runs

    await executeTabPage.goToFirstPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(1);
    await captureScreenshot(page, "Step 6: Click First Page");
  });

});
