/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Search
 * Test Case ID : TC-051
 * Test Case Name: Verify Search and Filter Test Runs Functionality for a Selected Test Suite
 *
 * Description  : As a Test Engineer, I want to verify that the search box and filters
 *                (Project, Release, Cycle, Test Suite, Assigned To Me/View All) correctly
 *                display test runs matching the criteria, so that I can quickly locate and
 *                execute relevant test runs.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid is populated and an existing Test Case
 *                ID can be read from it to search for).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Enter a Test Run ID or Test Case ID in the Search box and click the Search button.
 *   3. Validate grid columns.
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Search', () => {

  test('TC-051 | Verify Search and Filter Test Runs Functionality for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach a populated grid under View All ──────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 1 (follows TC-047): reach a populated grid under View All");

    // ─── Step 2: Search for an existing Test Case ID and click Search ────────────
    const searchTerm = await executeTabPage.getFirstRowTestCaseId();
    await executeTabPage.searchTestRun(searchTerm);
    await executeTabPage.verifySearchResultsMatch(searchTerm);
    await captureScreenshot(page, "Step 2: Search for an existing Test Case ID and click Search");

    // ─── Step 3: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await executeTabPage.verifyEachRowHasReadableData();
    await captureScreenshot(page, "Step 3: Validate grid columns");
  });

});
