/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_025
 * Test Name    : Verify Unlink Action When Only One Test Case Is Present
 *
 * Description  : As a Test Engineer, I want to validate that unlinking the only linked test case shows
 *                an empty state.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-9): EPIC_A → Feature_A → select a requirement with exactly one linked test case → click
 *   Unlink → confirm → grid empty → "Total 0 Entries" → ADD TEST CASE remains visible + enabled.
 *
 * MUTATING + DATA — fixme (re-verified live 2026-06-30): UNSAFE to enable, and NOT self-cleanable:
 *   (1) Confirming the unlink (YES) permanently removes a real test-case ↔ requirement link in qTest.
 *       The ADD TEST CASE button opens a "Create Test Cases" authoring grid (Name/Priority/… + ADD ROW
 *       /SAVE) that CREATES BRAND-NEW test cases — there is NO "link an existing test case" option. So
 *       an unlinked test case CANNOT be restored: re-adding only makes a different (new) TC and pollutes
 *       qTest. Self-cleanup is therefore impossible with this build; a run irreversibly mutates data.
 *   (2) No requirement with exactly ONE linked test case is reachable: scanning EPIC_A/Feature_A (3
 *       pages, ~30 reqs) found ZERO linked test cases — RQ-8438 (the row-0 req EXPECTED.author calls
 *       "carries linked test cases") is now at 0, its TCs consumed by AT_TC_024's unlink runs.
 *       `data.reqWithoutTestCases` below is a PLACEHOLDER only.
 *   This stays test.fixme; it can only be enabled if the app adds a "link existing test case" flow (so
 *   the unlink can be restored) AND a single-test-case requirement is seeded. (AT_TC_024, the sibling
 *   unlink case, has the same irreversibility and should likewise be test.fixme.)
 *
 * Post-condition: this case (when enabled) MUTATES data — it unlinks the requirement's only test case.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Management – Unlink (Single Entry)', () => {

  // BLOCKED: destructive unlink with no automated re-link restore, and no single-TC requirement
  // pinned (page-1 EPIC_A/Feature_A reqs all have 0 linked TCs). See header note (verified 2026-06-30).
  test('AT_TC_025 | Verify Unlink Action When Only One Test Case Is Present', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-4: EPIC_A + Feature_A → select a requirement with exactly one test case ─
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);
    // PLACEHOLDER: replace with a requirement that has exactly ONE linked test case once one is pinned
    // in EXPECTED.author (reqWithoutTestCases has zero TCs, so this fails the toBe(1) assertion if run —
    // which is why the case is test.fixme until a single-TC requirement is identified).
    await authorPage.selectRequirementById(data.reqWithoutTestCases /* TODO: single-TC requirement */);
    await page.waitForTimeout(10000); // Waits for 10 seconds
    expect(await authorPage.getLinkedTcCount(), 'exactly one linked test case').toBe(1);
    await captureScreenshot(page, 'Step 2-4: Requirement with one linked test case');

    // ─── Step 5-6: click Unlink → confirm (MUTATING) ───────────────────────────────────
    await authorPage.clickUnlink(0);
    await expect(authorPage.unlinkConfirmYes).toBeVisible();
    await authorPage.confirmUnlink();
    await captureScreenshot(page, 'Step 5-6: Confirmed unlink');

    // ─── Step 7-9: grid empty + Total 0 Entries + ADD TEST CASE still enabled ──────────
    await authorPage.verifyNoLinkedTestCases();
    await authorPage.verifyAddTestCaseEnabled();
    await expect(page.getByText('There is no test-case linked')).toBeVisible();
    await captureScreenshot(page, 'Step 7-9: Empty state after unlinking the only test case');
  });

});
