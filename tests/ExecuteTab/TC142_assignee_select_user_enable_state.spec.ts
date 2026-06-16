/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-142
 * Test Case Name: Verify Select User Dropdown Is Disabled for Assigned To Me and View All
 *
 * Description  : As a Test Engineer, I want to verify that the Select User dropdown is enabled only
 *                when Assigned To / Business User is selected.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release with test runs is selected.
 *
 * Dependencies : Follows TC-008 (a first-layer cycle grid with the Assignee filter visible).
 *
 * Steps:
 *   1. Follow TC-008.
 *   2. Validate default Assignee filter selection.
 *   3. Validate Select User dropdown state.
 *   4. Select View All.
 *   5. Validate Select User dropdown state.
 *   6. Select Assigned To / Business User.
 *   7. Validate Select User dropdown state.
 *
 * Expected:
 *   1. Assigned To Me is selected by default.
 *   2. Select User dropdown is disabled when Assigned To Me is selected.
 *   3. Select User dropdown remains disabled when View All is selected.
 *   4. Select User dropdown becomes enabled when Assigned To / Business User is selected.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  test('TC-142 | Verify Select User Dropdown Is Disabled for Assigned To Me and View All', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });

    // ─── Steps 2-3 / Expected 1-2: default Assigned To Me → Select User disabled ─
    await executeTabPage.verifyAssignedToMeSelectedByDefault();
    await executeTabPage.verifySelectUserDisabled();

    // ─── Steps 4-5 / Expected 3: View All → Select User stays disabled ───────────
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifySelectUserDisabled();

    // ─── Steps 6-7 / Expected 4: Others → Select User becomes enabled ────────────
    await executeTabPage.selectAssignedToBusinessUser();
    await executeTabPage.verifySelectUserEnabled();
  });

});
