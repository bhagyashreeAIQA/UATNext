/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Empty State
 * Test Case ID : TC-052
 * Test Case Name: Validate "No Matching Results Found" Message When No Data Exists for a
 *                 Selected Test Suite
 *
 * Description  : As a Test Engineer, I want to validate that the system displays the message
 *                "No Matching Results Found" when no test runs match the selected filters or
 *                search criteria, so that I clearly understand when no data is available for
 *                execution.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-001 (workspace auto-fill) then reaches a Test Suite whose grid
 *                holds no runs for the user.
 *
 * Steps:
 *   1. Follow TC-001.
 *   2. Navigate to the Execute Test Cases tab.
 *   3. Select a Release, Cycle, Nested Cycle, and Test Suite combination with no test runs
 *      (the default "Assigned to me" view returns no runs for this user).
 *   4. Validate the test run grid.
 *   5. Enter a search keyword that does not match any test run.
 *
 * Note: Two independent empty-state paths are exercised — the default "Assigned to me"
 *       filter (0 runs for this user) and a validly-formatted non-existent Test Run ID
 *       search. Both render "No matching results found".
 */

import { test } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Empty State', () => {

  test('TC-052 | Validate "No Matching Results Found" Message When No Data Exists for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Steps 1 & 2 (follows TC-001): login + Execute tab + workspace auto-fill ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await captureScreenshot(page, "Steps 1 & 2 (follows TC-001): login + Execute tab + workspace auto-fill");

    // ─── Step 3: Select a Release + cycle + nested cycle + Test Suite with no runs ─
    // Reached on the suite's default "Assigned to me" filter (no runs for this user).
    await reachTestSuiteGrid(executeTabPage, { viewAll: false });
    await captureScreenshot(page, "Step 3: Select a Release + cycle + nested cycle + Test Suite with no runs");

    // ─── Step 4: Validate the test run grid ──────────────────────────────────────
    await executeTabPage.verifyNoResultsMessageVisible();
    await captureScreenshot(page, "Step 4: Validate the test run grid");

    // ─── Step 5: Enter a non-matching search keyword ─────────────────────────────
    await executeTabPage.searchTestRun(EXPECTED.nonMatchingSearchId);
    await executeTabPage.verifyNoResultsMessageVisible();
    await captureScreenshot(page, "Step 5: Enter a non-matching search keyword");
  });

});
