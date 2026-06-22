/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Assigned To Edit
 * Test Case ID : TC-060
 * Test Case Name: Verify Pencil Icon Enables Editing of Assigned To Field in Execute Test
 *                 Cases Grid
 *
 * Description  : As a Test Engineer, I want to validate that clicking the pencil icon enables
 *                the Assigned To dropdown, so that I can edit the assigned user directly from
 *                the grid.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has rows whose Assigned To field can
 *                be edited).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Locate the Assigned To column in the grid.
 *   3. Click on the pencil icon in the Assigned To field.
 *   4. Validate action icons.
 *
 * Note: The grid renders both an "Assigned To" and a "Business User" assignee cell; the
 *       pencil is targeted by column position (Assigned To = 4th cell). The Save (✔) action
 *       is added only after a valid assignee is chosen, so the test selects a user to reveal
 *       it, asserts both ✔ Save and ✖ Cancel, then cancels to avoid persisting the change.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Assigned To Edit', () => {

  test('TC-060 | Verify Pencil Icon Enables Editing of Assigned To Field in Execute Test Cases Grid', async ({ page }) => {
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

    // ─── Step 3: Click the pencil icon → the dropdown opens and becomes editable ─
    await executeTabPage.openAssignedToEditor(0);
    await executeTabPage.verifyAssignedToEditorOpen(0);
    await captureScreenshot(page, "Step 3: Click the pencil icon → the dropdown opens and becomes editable");

    // ─── Step 4: Validate action icons (✔ Save and ✖ Cancel) ─────────────────────
    // The Save (tick) appears once an assignee is selected; choose one to reveal it.
    await executeTabPage.selectAssigneeInEditor(0);
    await executeTabPage.verifySaveAndCancelIconsVisible(0);

    // Cancel so the change is not persisted (read-only state restored).
    await executeTabPage.cancelAssignedToEdit(0);
    await captureScreenshot(page, "Step 4: Validate action icons (✔ Save and ✖ Cancel)");
  });

});
