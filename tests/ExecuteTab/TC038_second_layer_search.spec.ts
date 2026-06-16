/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Second-Layer Cycle – Search
 * Test Case ID : TC-038
 * Test Case Name: Verify Search and Filter Test Runs Functionality for a Selected Second
 *                 Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to verify that the search box and filters
 *                correctly display test runs matching the criteria, so that I can quickly
 *                locate and execute relevant test runs.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-034 (View All so the grid is populated and an existing
 *                Test Case ID can be read from it to search for).
 *
 * Steps:
 *   1. Follow TC-034.
 *   2. Enter a Test Run ID or Test Case ID in the Search box and click Search.
 *   3. Validate grid columns.
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachSecondLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Second-Layer Cycle – Search', () => {

  test('TC-038 | Verify Search and Filter Test Runs Functionality for a Selected Second Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000);

    // ─── Step 1 (follows TC-034): reach a populated grid under View All ──────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachSecondLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Step 2: Search for an existing Test Case ID and click Search ────────────
    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);

    // ─── Step 3: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
  });

});
