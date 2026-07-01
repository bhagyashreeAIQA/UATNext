/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_030
 * Test Name    : Verify Mandatory Field Validation for Name and Priority
 *
 * Description  : As a Test Engineer, I want to validate that the Add Test Case popup enforces the Name
 *                and Priority mandatory fields with proper error messages, then saves valid data.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-8): open popup → blank Save → "Name is required" → Name only → Save → "Priority is
 *   required" → Priority only → Save → "Name is required" → valid Name + Priority → Save → created.
 *
 * Live note (2026-06-30): blank save → toast "Error: Name is required for all test cases." Steps 1-6
 *   are non-mutating (validation only); step 8 creates a REAL test case (Name + Priority valid).
 *
 * Post-condition: MUTATES data — the final valid save creates a test case.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Creation – Validation', () => {

  test('AT_TC_030 | Verify Mandatory Field Validation for Name and Priority', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openAddTestCasePopup();

    // ─── Step 4: all blank → Save → "Name is required" ─────────────────────────────────
    await authorPage.clickCreateSave();
    await expect(authorPage.createNotification(/name is required/i)).toBeVisible({ timeout: 10000 });
    await captureScreenshot(page, 'Step 4: Name required');

    // ─── Step 5: Name only, blank Priority → Save → "Priority is required" ──────────────
    await authorPage.fillCreateTestCase({ name: `Auto TC ${Date.now()}` });
    await authorPage.clickCreateSave();
    await expect(authorPage.createNotification(/priority is required/i)).toBeVisible({ timeout: 10000 });
    await captureScreenshot(page, 'Step 5: Priority required');

    // ─── Step 6: Priority only, blank Name → Save → "Name is required" ──────────────────
    await authorPage.fillCreateTestCase({ name: '' });
    await authorPage.selectCreatePriority();
    await authorPage.clickCreateSave();
    await expect(authorPage.createNotification(/name is required/i)).toBeVisible({ timeout: 10000 });
    await captureScreenshot(page, 'Step 6: Name required again');

    // ─── Step 7-8: valid Name + Priority → Save → created ──────────────────────────────
    const tcName = `Auto TC ${Date.now()}`;
    await authorPage.fillCreateTestCase({ name: tcName });
    await authorPage.clickCreateSave();
    await expect(authorPage.createNotification(/name is required|priority is required/i)).toHaveCount(0);
    if (await authorPage.createPopup.isVisible().catch(() => false)) {
      await authorPage.closeAddTestCasePopup();
    }
    await expect.poll(() => authorPage.linkedTcContainsName(tcName), { timeout: 20000 }).toBe(true);
    await captureScreenshot(page, 'Step 7-8: Valid test case created');
  });

});
