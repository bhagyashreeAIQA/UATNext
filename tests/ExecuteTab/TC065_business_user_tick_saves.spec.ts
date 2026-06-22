/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Business User Edit
 * Test Case ID : TC-065
 * Test Case Name: Verify Tick (✔) Icon Saves Business User Value
 *
 * Description  : As a Test Engineer, I want to validate that clicking the tick icon saves the
 *                Business User value, so that updates are reflected correctly.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-064 (the editable Business User dropdown is open with users).
 *
 * Steps:
 *   1. Follow TC-064.
 *   2. Select a Business User.
 *   3. Click the ✔ (Tick) icon.
 *
 * Expected: the dropdown is available, the selected Business User is displayed, and the
 *           updated value is saved successfully.
 */

import { test } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Business User Edit', () => {

  test('TC-065 | Verify Tick (✔) Icon Saves Business User Value', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-064): reach the grid and open the Business User editor ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.verifyBusinessUserColumnVisible();
    await executeTabPage.openBusinessUserEditor(0);
    await executeTabPage.verifyBusinessUserEditorOpen(0); // dropdown available
    await captureScreenshot(page, "Step 1 (follows TC-064): reach the grid and open the Business User editor");

    // ─── Step 2: select a Business User ──────────────────────────────────────────
    const selectedUser = await executeTabPage.selectBusinessUserInEditor(0);
    await executeTabPage.verifyBusinessUserSaveAndCancelIconsVisible(0);
    await captureScreenshot(page, "Step 2: select a Business User");

    // ─── Step 3: click the ✔ (Tick) icon → the value is saved ────────────────────
    await executeTabPage.saveBusinessUserEdit(0);

    // Selected Business User is displayed and the update is persisted.
    await executeTabPage.verifyBusinessUserDisplay(selectedUser, 0);
    await captureScreenshot(page, "Step 3: click the ✔ (Tick) icon → the value is saved");
  });

});
