/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Assigned To Edit
 * Test Case ID : TC-063
 * Test Case Name: Verify Cross (✖) Icon Discards Changes in Assigned To Field
 *
 * Description  : As a Test Engineer, I want to validate that clicking the cross icon cancels
 *                the changes made to Assigned To, so that incorrect updates are not saved.
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
 *   3. Click the ✖ (Cross) icon.
 *
 * Expected: the dropdown is available, the newly selected value is shown before cancelling,
 *           and clicking ✖ discards the change so the original value remains unchanged.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Assigned To Edit', () => {

  test('TC-063 | Verify Cross (✖) Icon Discards Changes in Assigned To Field', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-061): reach the grid; capture the original value ──────
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.verifyAssignedToColumnVisible();
    const originalValue = await executeTabPage.getAssignedToDisplay(0);

    await executeTabPage.openAssignedToEditor(0);
    await executeTabPage.verifyAssignedToEditorOpen(0); // dropdown available
    await captureScreenshot(page, "Step 1 (follows TC-061): reach the grid; capture the original value");

    // ─── Step 2: select a user different from the current value ──────────────────
    const newUser = await executeTabPage.selectDifferentAssigneeInEditor(0, originalValue);
    expect(newUser).not.toBe(originalValue); // new value shown before saving
    await executeTabPage.verifySaveAndCancelIconsVisible(0);
    await captureScreenshot(page, "Step 2: select a user different from the current value");

    // ─── Step 3: click the ✖ (Cross) icon → the change is discarded ──────────────
    await executeTabPage.cancelAssignedToEdit(0);

    // The original value remains unchanged (the new selection was not persisted).
    await executeTabPage.verifyAssignedToDisplay(originalValue, 0);
    await captureScreenshot(page, "Step 3: click the ✖ (Cross) icon → the change is discarded");
  });

});
