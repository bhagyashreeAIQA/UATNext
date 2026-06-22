/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Default Assignee
 * Test Case ID : TC-049
 * Test Case Name: Verify Default Filter is Set to Assigned To Me for a Selected Test Suite
 *
 * Description  : As a Test Engineer, I want to validate that the Assigned To Me radio button
 *                displays only the test runs assigned to the logged-in user, so that I can
 *                filter test runs correctly for execution.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-001 then drills Project → Release → Cycle → Nested Cycle →
 *                Test Suite, reaching the suite on its "Assigned to me" default.
 *
 * Steps:
 *   1. Follow TC-001.
 *   2. Select a project from the dropdown.
 *   3. Select a release from the list.
 *   4. Click on a Cycle under the selected Release.
 *   5. Click on the Nested Cycle.
 *   6. Click on the Test Suite.
 *   7. Validate the default filter selection.
 *   8. Verify "Assigned to me" is selected.
 *   9. Verify no test runs assigned to other users are displayed.
 *  10. Refresh the page while "Assigned to me" is selected.
 *  11. Validate grid columns.
 *
 * Note: The user has no runs in this suite, so exclusion of others' runs is proven by the
 *       "Assigned to me" total being smaller than "View All". A hard reload keeps the
 *       project but clears the release/cycle/suite, so the suite is re-selected after reload.
 */

import { test, expect } from '@playwright/test';
import { EXPECTED } from '../../utils/testData';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Default Assignee', () => {

  test('TC-049 | Verify Default Filter is Set to Assigned To Me for a Selected Test Suite', async ({ page }) => {
    test.setTimeout(360000); // includes a reload + a second depth-3 traversal

    // ─── Steps 1-6 (follows TC-001): drill to the Test Suite on its default filter ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: false });
    await captureScreenshot(page, "Steps 1-6 (follows TC-001): drill to the Test Suite on its default filter");

    // ─── Steps 7 & 8: Default filter is "Assigned to me" ─────────────────────────
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    const assignedToMeCount = await executeTabPage.getTotalEntries();
    await captureScreenshot(page, "Steps 7 & 8: Default filter is \"Assigned to me\"");

    // ─── Step 9: No test runs assigned to other users are displayed ──────────────
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    const viewAllCount = await executeTabPage.getTotalEntries();
    expect(viewAllCount).toBeGreaterThan(assignedToMeCount);

    await executeTabPage.selectAssignedToMeAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    expect(await executeTabPage.getTotalEntries()).toBe(assignedToMeCount);
    if (assignedToMeCount === 0) {
      await executeTabPage.verifyNoResultsMessageVisible();
    }
    await captureScreenshot(page, "Step 9: No test runs assigned to other users are displayed");

    // ─── Step 10: Refresh the page; default must remain "Assigned to me" ─────────
    await executeTabPage.reloadPage();
    await executeTabPage.waitForReleasesLoad();
    await reachTestSuiteGrid(executeTabPage, { viewAll: false });
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    expect(await executeTabPage.getTotalEntries()).toBe(assignedToMeCount);
    await captureScreenshot(page, "Step 10: Refresh the page; default must remain \"Assigned to me\"");

    // ─── Step 11: Validate grid columns ──────────────────────────────────────────
    await executeTabPage.verifyGridPresent();
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await captureScreenshot(page, "Step 11: Validate grid columns");
  });

});
