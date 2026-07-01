/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_013
 * Test Name    : Verify CREATE LOG Button is Visible Above the Test Run Table and Disabled Before Any Selection
 *
 * Description  : As a Test Engineer, I want to verify that the CREATE LOG button is visible and
 *                correctly disabled by default when no rows are selected.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_011 → click a Release and wait for the grid to load.
 *   2. Observe the area above the Test Run table.
 *   3. Verify CREATE LOG state before selecting any row.
 *
 * Expected: CREATE LOG is present/visible above the grid and DISABLED (greyed out) with no row selected.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_013 | Verify CREATE LOG Button is Visible Above the Test Run Table and Disabled Before Any Selection', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + grid load exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution and click a Release → grid loads ───────────────
    await be.openBulkExecution();
    await be.selectProject(data.expectedProject);
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 1: Release grid loaded");

    // ─── Step 2-3: CREATE LOG visible above the table and disabled (no selection) ───
    await be.verifyCreateLogVisibleAndDisabled();
    await captureScreenshot(page, "Step 2-3: CREATE LOG visible and disabled by default");
  });

});
