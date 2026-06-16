/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Pagination
 * Test Case ID : TC-057
 * Test Case Name: Verify Test Run Grid Pagination for a Selected Test Suite
 *
 * Description  : As a Test Engineer, I want to validate that pagination in the test run grid
 *                works correctly, so that I can navigate through large sets of test runs
 *                easily.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid spans multiple pages).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Validate pagination controls at the bottom.
 *   3. Click Next Page.
 *   4. Click Last Page.
 *   5. Click Previous Page.
 *   6. Click First Page.
 *
 * Note: A single Test Suite spans fewer runs than a full release (the grid paginates at 10
 *       rows/page), so the last page can be as low as 2. The assertions therefore require a
 *       multi-page grid (> 10 entries) and a last page ≥ 2 rather than hard-coding a count.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Pagination', () => {

  test('TC-057 | Verify Test Run Grid Pagination for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach a multi-page suite grid (View All) ───────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    expect(await executeTabPage.getTotalEntries()).toBeGreaterThan(10); // spans 2+ pages

    // ─── Step 2: Validate pagination controls at the bottom ──────────────────────
    await executeTabPage.verifyPaginationControlsVisible();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(1);

    // ─── Step 3: Click Next Page ─────────────────────────────────────────────────
    await executeTabPage.goToNextPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(2);

    // ─── Step 4: Click Last Page ─────────────────────────────────────────────────
    await executeTabPage.goToLastPage();
    const lastPage = await executeTabPage.getCurrentPageNumber();
    expect(lastPage).toBeGreaterThanOrEqual(2);

    // ─── Step 5: Click Previous Page ─────────────────────────────────────────────
    await executeTabPage.goToPreviousPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(lastPage - 1);

    // ─── Step 6: Click First Page ────────────────────────────────────────────────
    await executeTabPage.goToFirstPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(1);
  });

});
