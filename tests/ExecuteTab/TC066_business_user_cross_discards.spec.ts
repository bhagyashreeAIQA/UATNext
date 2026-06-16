/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Business User Edit
 * Test Case ID : TC-066
 * Test Case Name: Verify Cross (✖) Icon Discards Business User Changes
 *
 * Description  : As a Test Engineer, I want to validate that clicking the cross icon cancels
 *                the changes made to the Business User field.
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
 *   2. Change the Business User value.
 *   3. Click the ✖ (Cross) icon.
 *
 * Expected: the dropdown is available, the new value is displayed before saving, and clicking
 *           ✖ discards the change so the original Business User remains unchanged.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Business User Edit', () => {

  test('TC-066 | Verify Cross (✖) Icon Discards Business User Changes', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-064): reach the grid; capture the original value ──────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.verifyBusinessUserColumnVisible();
    const originalValue = await executeTabPage.getBusinessUserDisplay(0);

    await executeTabPage.openBusinessUserEditor(0);
    await executeTabPage.verifyBusinessUserEditorOpen(0); // dropdown available

    // ─── Step 2: change the Business User to a different value ───────────────────
    const newUser = await executeTabPage.selectDifferentBusinessUserInEditor(0, originalValue);
    expect(newUser).not.toBe(originalValue); // new value shown before saving
    await executeTabPage.verifyBusinessUserSaveAndCancelIconsVisible(0);

    // ─── Step 3: click the ✖ (Cross) icon → the change is discarded ──────────────
    await executeTabPage.cancelBusinessUserEdit(0);

    // The original Business User remains unchanged (the new selection was not persisted).
    await executeTabPage.verifyBusinessUserDisplay(originalValue, 0);
  });

});
