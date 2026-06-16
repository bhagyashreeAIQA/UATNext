/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Assigned To Edit
 * Test Case ID : TC-062
 * Test Case Name: Verify Tick (✔) Icon Saves Updated Assigned To Value
 *
 * Description  : As a Test Engineer, I want to validate that clicking the tick icon saves
 *                the updated Assigned To value, so that changes are persisted.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-061 (the editable Assigned To dropdown is open with users).
 *
 * Steps:
 *   1. Follow TC-061.
 *   2. Select a user from the dropdown.
 *   3. Click the ✔ (Tick) icon.
 *
 * Expected: the dropdown is available, the selected user is displayed, and the updated value
 *           is saved successfully (the cell returns to read-only showing the chosen user).
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Assigned To Edit', () => {

  test('TC-062 | Verify Tick (✔) Icon Saves Updated Assigned To Value', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-061): reach the grid and open the Assigned To editor ──
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.verifyAssignedToColumnVisible();
    await executeTabPage.openAssignedToEditor(0);
    await executeTabPage.verifyAssignedToEditorOpen(0); // dropdown available

    // ─── Step 2: select a user from the dropdown ─────────────────────────────────
    const selectedUser = await executeTabPage.selectAssigneeInEditor(0);
    await executeTabPage.verifySaveAndCancelIconsVisible(0);

    // ─── Step 3: click the ✔ (Tick) icon → the value is saved ────────────────────
    await executeTabPage.saveAssignedToEdit(0);

    // Selected user is displayed and the update is persisted (read-only state restored).
    await executeTabPage.verifyAssignedToDisplay(selectedUser, 0);
  });

});
