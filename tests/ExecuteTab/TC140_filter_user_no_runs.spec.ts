/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-140
 * Test Case Name: Verify "No Matching Results Found" for User Without Test Runs
 *
 * Description  : As a Test Engineer, I want to verify that the application displays an appropriate
 *                message when no test runs exist for the selected user.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release is selected.
 *   3. Assigned To / Business User option is selected.
 *
 * Dependencies : Follows TC-137.
 *
 * Steps:
 *   1. Follow TC-137.
 *   2. Select a user with no test runs.
 *   3. Validate the test run grid.
 *
 * Expected:
 *   1. User is selected successfully.
 *   2. Grid displays the message "No Matching Results Found".
 *
 * BLOCKED (test.fixme) — test data: this needs a user who IS selectable in the project's "Select
 *   user" typeahead but has NO test runs in the reachable cycle. The logged-in user (Bhagyashree)
 *   is NOT in the project's Select User list (verified 2026-06-15 — the typeahead returns no
 *   match), and every selectable user's run-presence varies and is paginated across the 95-entry
 *   grid, so a guaranteed "no runs" user cannot be derived from the data. Enable once a known
 *   no-run user is seeded (set NO_RUN_USER below). The flow itself is proven by TC-138/139.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

const NO_RUN_USER = 'Bhagyashree';   // replace with a seeded user who has no runs in the cycle

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  // BLOCKED: no reliably-derivable user with zero runs in the reachable cycle (see header note).
  test.fixme('TC-140 | Verify "No Matching Results Found" for User Without Test Runs', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // ─── Steps 1-2 / Expected 1: select Others → pick a user with no runs ────────
    await executeTabPage.selectAssignedToBusinessUser();
    const options = await executeTabPage.getSelectUserOptions(NO_RUN_USER);
    const chosen = options.find(o => o.includes(NO_RUN_USER)) ?? options[0];
    expect(chosen, `Select User should list a "${NO_RUN_USER}" user with no runs`).toBeTruthy();
    await executeTabPage.selectUserAndWaitForRefresh(NO_RUN_USER, chosen);

    // ─── Step 3 / Expected 2: the grid shows "No Matching Results Found" ─────────
    await executeTabPage.verifyNoResultsMessageVisible();
  });

});
