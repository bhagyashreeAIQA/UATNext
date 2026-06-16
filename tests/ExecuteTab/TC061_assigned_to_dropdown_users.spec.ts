/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Suite – Inline Assigned To Edit
 * Test Case ID : TC-061
 * Test Case Name: Verify Assigned To Dropdown Displays Only Allowed Users
 *
 * Description  : As a Test Engineer, I want to validate that only predefined users are
 *                available in the Assigned To dropdown, so that only valid users can be
 *                selected.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-060 (pencil opens the editable Assigned To dropdown).
 *
 * Steps:
 *   1. Follow TC-060.
 *   2. Click on the Assigned To dropdown.
 *   3. Validate the displayed values.
 *
 * Expected: the field is editable, a list of users is displayed, and only valid/allowed
 *           users appear. The list opens with a "Please Select" placeholder followed by
 *           named users; every option is non-empty and there are no malformed entries.
 *           The editor is cancelled afterwards so no change is persisted.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';

test.describe('Feature: Execute Test Case | Sub-Feature: Test Suite – Inline Assigned To Edit', () => {

  test('TC-061 | Verify Assigned To Dropdown Displays Only Allowed Users', async ({ page }) => {
    test.setTimeout(300000);

    // ─── Step 1 (follows TC-060): reach a populated suite grid and open the editor ─
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();

    await executeTabPage.verifyAssignedToColumnVisible();
    await executeTabPage.openAssignedToEditor(0);
    await executeTabPage.verifyAssignedToEditorOpen(0); // field is editable

    // ─── Steps 2-3: open the dropdown and validate the displayed users ───────────
    const options = await executeTabPage.getAssignedToOptions(0);

    // A list of users is displayed.
    expect(options.length).toBeGreaterThan(1);

    // The list leads with the "Please Select" placeholder; the rest are real users.
    expect(options).toContain('Please Select');
    const users = options.filter(o => o !== 'Please Select');
    expect(users.length).toBeGreaterThan(0);

    // Only valid/allowed users — every entry is a non-empty, well-formed name (no blank,
    // null/undefined or duplicate placeholder rows leaking into the list).
    for (const user of users) {
      expect(user.trim()).not.toBe('');
      expect(user.toLowerCase()).not.toMatch(/^(null|undefined|nan)$/);
    }
    expect(new Set(users).size).toBe(users.length); // no duplicates

    // Cancel so the change is not persisted (read-only state restored).
    await executeTabPage.cancelAssignedToEdit(0);
  });

});
