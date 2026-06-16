/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Pagination
 * Test Case ID : TC-031
 * Test Case Name: Verify Test Run Grid Pagination for the First Layer of Cycle
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
 * Dependencies : Follows TC-021 (View All so the grid spans multiple pages).
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Validate pagination controls at the bottom.
 *   3. Click on Next Page.
 *   4. Click on Last Page.
 *   5. Click on Previous Page.
 *   6. Click on First Page.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Pagination', () => {

  test('TC-031 | Verify Test Run Grid Pagination for the First Layer of Cycle', async ({ page }) => {
    test.setTimeout(180000);

    // ─── Step 1 (follows TC-021): reach a multi-page grid under View All ─────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    expect(await executeTabPage.getTotalEntries()).toBeGreaterThan(10);

    // ─── Step 2: Validate pagination controls at the bottom ──────────────────────
    await executeTabPage.verifyPaginationControlsVisible();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(1);

    // ─── Step 3: Click Next Page ─────────────────────────────────────────────────
    await executeTabPage.goToNextPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(2);

    // ─── Step 4: Click Last Page ─────────────────────────────────────────────────
    await executeTabPage.goToLastPage();
    const lastPage = await executeTabPage.getCurrentPageNumber();
    expect(lastPage).toBeGreaterThan(2);

    // ─── Step 5: Click Previous Page ─────────────────────────────────────────────
    await executeTabPage.goToPreviousPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(lastPage - 1);

    // ─── Step 6: Click First Page ────────────────────────────────────────────────
    await executeTabPage.goToFirstPage();
    expect(await executeTabPage.getCurrentPageNumber()).toBe(1);
  });

});
