/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-137
 * Test Case Name: Verify "Assigned To / Business User" Option Enables Select User Dropdown
 *
 * Description  : As a Test Engineer, I want to verify that selecting the Assigned To / Business
 *                User option enables user selection.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release with test runs is selected.
 *   3. Assignee filter options are visible.
 *
 * Dependencies : Follows TC-136 (Assignee filter visible on a first-layer cycle grid).
 *
 * Steps:
 *   1. Follow TC-136.
 *   2. Select "Assigned To / Business User".
 *   3. Validate Select User dropdown state.
 *   4. Click the Select User dropdown.
 *
 * Expected:
 *   1. Assigned To / Business User option is selected.
 *   2. Select User dropdown is enabled.
 *   3. Dropdown opens successfully.
 *   4. Search field is displayed (the Select User input is the typeahead search field).
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  test('TC-137 | Verify "Assigned To / Business User" Option Enables Select User Dropdown', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });
    await executeTabPage.verifyAssigneeOptionsVisible();

    // ─── Steps 2-3 / Expected 1-2: select Others → Select User becomes enabled ───
    await executeTabPage.selectAssignedToBusinessUser();
    await executeTabPage.verifySelectUserEnabled();
    await captureScreenshot(page, "Steps 2-3 / Expected 1-2: select Others → Select User becomes enabled");

    // ─── Step 4 / Expected 3-4: the typeahead search field opens ─────────────────
    await executeTabPage.openSelectUserDropdown();
    expect(await executeTabPage.isSelectUserEnabled(), 'Select User search field should be usable').toBe(true);
    await captureScreenshot(page, "Step 4 / Expected 3-4: the typeahead search field opens");
  });

});
