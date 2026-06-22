/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Assigned To Edit
 * Test Case ID : TC-067
 * Test Case Name: Verify User Cannot Clear Assigned To Value
 *
 * Description  : As a Test Engineer, I want to validate that values cannot be cleared from the
 *                UI, so that data integrity is maintained.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has rows to inspect).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Locate the Assigned To column.
 *   3. Click the pencil icon in the Assigned To field.
 *   4. Attempt to remove the selected value.
 *
 * Expected: the grid is populated, the Assigned To column is visible, the dropdown opens, and
 *           no clear/remove option is available — the editor offers only a searchable user
 *           list and the Cancel (✖) action, so a value can be replaced but never cleared.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Assigned To Edit', () => {

  test('TC-067 | Verify User Cannot Clear Assigned To Value', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach a populated suite grid (View All) ────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 1 (follows TC-047): reach a populated suite grid (View All)");

    // ─── Step 2: Locate the Assigned To column ───────────────────────────────────
    await executeTabPage.verifyAssignedToColumnVisible();
    await captureScreenshot(page, "Step 2: Locate the Assigned To column");

    // ─── Step 3: Click the pencil icon → the dropdown opens ──────────────────────
    await executeTabPage.openAssignedToEditor(0);
    await executeTabPage.verifyAssignedToEditorOpen(0);
    await captureScreenshot(page, "Step 3: Click the pencil icon → the dropdown opens");

    // ─── Step 4: Attempt to remove the value → no clear/remove option exists ─────
    await executeTabPage.verifyNoClearOptionInAssignedToEditor(0);

    // Cancel so no change is persisted (read-only state restored).
    await executeTabPage.cancelAssignedToEdit(0);
    await captureScreenshot(page, "Step 4: Attempt to remove the value → no clear/remove option exists");
  });

});
