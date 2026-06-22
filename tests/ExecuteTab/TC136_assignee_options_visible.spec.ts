/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-136
 * Test Case Name: Verify "Assigned To / Business User" Option Is Visible in Assignee Filter
 *
 * Description  : As a Test Engineer, I want to verify that the Assignee filter displays all
 *                available filtering options.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release with test runs is selected.
 *   3. User is on the Execute Test Cases page.
 *
 * Dependencies : Follows TC-008 (a first-layer cycle grid with the Assignee filter visible).
 *
 * Steps:
 *   1. Follow TC-008.
 *   2. Locate the Assignee filter section.
 *   3. Validate all available options.
 *
 * Expected:
 *   1. Assignee filter section is visible.
 *   2. The options Assigned To Me, View All, and Assigned To / Business User are displayed.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachFirstLayerCycleGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  test('TC-136 | Verify "Assigned To / Business User" Option Is Visible in Assignee Filter', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachFirstLayerCycleGrid(executeTabPage, { viewAll: false });

    // ─── Steps 2-3 / Expected 1-2: all three Assignee options are displayed ──────
    await executeTabPage.verifyAssigneeOptionsVisible();
    await captureScreenshot(page, "Steps 2-3 / Expected 1-2: all three Assignee options are displayed");
  });

});
