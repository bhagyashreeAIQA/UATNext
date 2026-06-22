/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Business User Edit
 * Test Case ID : TC-064
 * Test Case Name: Verify Pencil Icon Enables Dropdown for Business User Field
 *
 * Description  : As a Test Engineer, I want to validate that clicking the pencil icon enables
 *                the Business User dropdown, so that I can edit the Business User value.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-047 (View All so the grid has rows whose Business User can edit).
 *
 * Steps:
 *   1. Follow TC-047.
 *   2. Locate the Business User column.
 *   3. Click the pencil icon for the Business User field.
 *   4. Validate action icons.
 *
 * Note: the grid renders both an "Assigned To" (4th cell) and a separate "Business User"
 *       (5th cell); both reuse the same `.assign-cell` markup, so the Business User pencil is
 *       targeted by column position. The Save (✔) action appears only after a valid user is
 *       chosen, so the test selects one to reveal it, asserts ✔ Save and ✖ Cancel, then
 *       cancels to avoid persisting the change.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Business User Edit', () => {

  test('TC-064 | Verify Pencil Icon Enables Dropdown for Business User Field', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-047): reach a populated suite grid (View All) ────────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await captureScreenshot(page, "Step 1 (follows TC-047): reach a populated suite grid (View All)");

    // ─── Step 2: Locate the Business User column ─────────────────────────────────
    await executeTabPage.verifyBusinessUserColumnVisible();
    await captureScreenshot(page, "Step 2: Locate the Business User column");

    // ─── Step 3: Click the pencil icon → the dropdown opens and becomes editable ─
    await executeTabPage.openBusinessUserEditor(0);
    await executeTabPage.verifyBusinessUserEditorOpen(0);
    await captureScreenshot(page, "Step 3: Click the pencil icon → the dropdown opens and becomes editable");

    // ─── Step 4: Validate action icons (✔ Save and ✖ Cancel) ─────────────────────
    // The Save (tick) appears once a user is selected; choose one to reveal it.
    await executeTabPage.selectBusinessUserInEditor(0);
    await executeTabPage.verifyBusinessUserSaveAndCancelIconsVisible(0);

    // Cancel so the change is not persisted (read-only state restored).
    await executeTabPage.cancelBusinessUserEdit(0);
    await captureScreenshot(page, "Step 4: Validate action icons (✔ Save and ✖ Cancel)");
  });

});
