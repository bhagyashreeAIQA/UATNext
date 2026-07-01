/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_011
 * Test Name    : Verify Clicking a Release Populates the Right Grid with All Required Columns, Valid Data, and Correct Status Values
 *
 * Description  : As a Test Engineer, I want to verify that selecting a Release loads all associated
 *                Test Runs with the required column details and valid status values so that users can
 *                review and manage Test Runs correctly.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_006 to open Bulk Execution with a project selected.
 *   2. Click a Release node → grid loads.
 *   3. Inspect the Test Run table headers (all required columns).
 *   4. Verify each row's data maps to the correct column.
 *   5. Review the Status column across rows.
 *
 * Expected: grid loads with Checkbox + the 8 required columns; row data maps correctly to its column;
 *   Status column shows only valid values (no blank/corrupt).
 *
 * BUILD NOTE: the build's Status values are Unexecuted / Failed / Blocked / InProgress / Passed (the
 *   spec's "In Progress" renders as "InProgress"). Status assertions use this valid set.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_011 | Verify Clicking a Release Populates the Right Grid with All Required Columns, Valid Data, and Correct Status Values', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + grid load exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1-2: open Bulk Execution and click a Release → grid loads ─────────────
    await be.openBulkExecution();
    await be.selectProject(data.expectedProject);
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 1-2: Release selected, grid loaded");

    // ─── Step 3: grid headers include the Checkbox + all required columns ───────────
    await be.verifyGridColumns(data.gridColumns);
    await captureScreenshot(page, "Step 3: Required columns present");

    // ─── Step 4: each row's data maps correctly to its column ──────────────────────
    await be.verifyRowDataMapping(data.statusValues);
    await captureScreenshot(page, "Step 4: Row data maps to correct columns");

    // ─── Step 5: Status column shows only valid values (no blank/corrupt) ───────────
    await be.verifyStatusValuesValid(data.statusValues);
    await captureScreenshot(page, "Step 5: Status values valid");
  });

});
