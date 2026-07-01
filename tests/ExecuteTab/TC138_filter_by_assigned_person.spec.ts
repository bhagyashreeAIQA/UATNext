/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-138
 * Test Case Name: Verify Filtering Test Runs by Assigned Person Name
 *
 * Description  : As a Test Engineer, I want to filter test runs by selecting an assigned person's
 *                name.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release containing test runs assigned to multiple users is selected.
 *   3. Assigned To / Business User option is selected.
 *
 * Dependencies : Follows TC-137 (Select User enabled). A real assignee is derived from the View All
 *                grid so the test does not depend on hard-coded user data.
 *
 * Steps:
 *   1. Follow TC-137.
 *   2. Open the Select User dropdown.
 *   3. Search for a valid user name.
 *   4. Select the user.
 *   5. Validate the test run grid.
 *   6. Validate grid columns.
 *
 * Expected:
 *   1. Matching users are displayed.
 *   2. Selected user appears in the filter.
 *   3. Grid displays only test runs where the user is the Assigned To or Business User.
 *   4. Grid columns display correct data.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  test('TC-138 | Verify Filtering Test Runs by Assigned Person Name', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    // Derive a real assignee (a user who has runs) from the populated grid.
    const i=0;
    const assignee = (await executeTabPage.getAssignedToDisplay(i)).trim();
    if(assignee.length === 0) {
      const assignee = (await executeTabPage.getBusinessUserDisplay(i+1)).trim();
      expect(assignee.length, 'a business user should be present to filter by').toBeGreaterThan(0);
    }else {
    expect(assignee.length, 'an assignee should be present to filter by').toBeGreaterThan(0);}

    // ─── Steps 1-4: select Others → search + pick that user ──────────────────────
    await executeTabPage.selectAssignedToBusinessUser();
    const options = await executeTabPage.getSelectUserOptions(assignee.split(/\s+/)[0]); // Expected 1
    expect(options.some(o => o.includes(assignee)), `options should include "${assignee}"`).toBe(true);
    const chosen = await executeTabPage.selectUserAndWaitForRefresh(assignee.split(/\s+/)[0], assignee); // Expected 2
    await captureScreenshot(page, "Steps 1-4: select Others → search + pick that user");

    // ─── Steps 5-6 / Expected 3-4: grid shows only that user's runs; columns ok ──
    await executeTabPage.verifyAllRowsMatchUser(chosen);
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await captureScreenshot(page, "Steps 5-6 / Expected 3-4: grid shows only that user's runs; columns ok");
  });

});
