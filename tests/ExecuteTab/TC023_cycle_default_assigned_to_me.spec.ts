/**
 * Feature      : Execute Test Case
 * Sub-Feature  : First-Layer Cycle – Default Assignee
 * Test Case ID : TC-023
 * Test Case Name: Verify Default Filter is Set to Assigned To Me for a Selected First
 *                 Layer of Cycle
 *
 * Description  : As a Test Engineer, I want to validate that the Assigned To Me radio
 *                button displays only the test runs assigned to the logged-in user.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-021 (first-layer cycle selected), reached on its default
 *                "Assigned to me" filter.
 *
 * Steps:
 *   1. Follow TC-021.
 *   2. Validate the default filter selection.
 *   3. Verify "Assigned to me" is selected.
 *   4. Verify no test runs assigned to other users are displayed.
 *   5. Refresh the page.
 *   6. Validate grid columns.
 *
 * Note: The user has no runs in this cycle, so exclusion of others' runs is proven by the
 *       "Assigned to me" total being smaller than "View All". A hard reload keeps the
 *       project but clears the release/cycle, so the cycle is re-selected after refresh.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: First-Layer Cycle – Default Assignee', () => {

  test('TC-023 | Verify Default Filter is Set to Assigned To Me for a Selected First Layer of Cycle', async ({ page }) => {
    test.setTimeout(240000); // includes a reload + a second cycle selection

    // ─── Step 1 (follows TC-021): reach the cycle grid (default Assignee intact) ──
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });
    await captureScreenshot(page, "Step 1 (follows TC-021): reach the cycle grid (default Assignee intact)");

    // ─── Steps 2 & 3: Default filter is "Assigned to me" ─────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeCount = await executeTabPage.getTotalEntries();
    await captureScreenshot(page, "Steps 2 & 3: Default filter is \"Assigned to me\"");

    // ─── Step 4: No test runs assigned to other users are displayed ──────────────
    // Switching to View All reveals the larger population, proving others' runs were
    // excluded under "Assigned to me".
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    const viewAllCount = await executeTabPage.getTotalEntries();
    expect(viewAllCount).toBeGreaterThan(assignedToMeCount);

    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getTotalEntries()).toBe(assignedToMeCount);
    if (assignedToMeCount === 0) {
      await executeTabPage.verifyNoResultsMessageVisible();
    }
    await captureScreenshot(page, "Step 4: No test runs assigned to other users are displayed");

    // ─── Step 5: Refresh the page; default must remain "Assigned to me" ──────────
    await executeTabPage.reloadPage();
    await executeTabPage.waitForReleasesLoad();
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    expect(await executeTabPage.getTotalEntries()).toBe(assignedToMeCount);
    await captureScreenshot(page, "Step 5: Refresh the page; default must remain \"Assigned to me\"");

    // ─── Step 6: Validate grid columns ───────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await captureScreenshot(page, "Step 6: Validate grid columns");
  });

});
