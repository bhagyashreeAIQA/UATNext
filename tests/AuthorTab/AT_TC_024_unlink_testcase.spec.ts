/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_024
 * Test Name    : Verify Unlink Test Case Functionality in Existing Test Cases Section
 *
 * Description  : As a Test Engineer, I want to validate that a linked test case can be unlinked from
 *                the Existing Test Cases section, so it is removed from the selected requirement.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): follow AT_TC_021 (a requirement with linked test cases) → a linked test case is shown →
 *   the Action column shows an Unlink icon → click Unlink → confirmation popup → confirm → the test
 *   case is removed and the total count updates.
 *
 * MUTATING — fixme: confirming the unlink (YES) permanently removes a real test-case ↔ requirement link
 *   in qTest, and there is no safe self-restore here (re-linking requires the ADD TEST CASE / link
 *   flow, which is not yet automated). To avoid corrupting shared test data this case is left
 *   `test.fixme`. The body codes the full intended flow up to (and including) the confirm; enable it
 *   only once a re-link cleanup step is added so it restores the link it removes. The non-destructive
 *   parts (linked TC present, Unlink icon present, confirmation popup appears) are exercised by the
 *   body before the mutating confirm.
 *
 * Post-condition: this case (when enabled) MUTATES data — it unlinks a test case from a requirement.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Management – Unlink', () => {

  // BLOCKED (test.fixme): confirming the unlink permanently removes a real test-case ↔ requirement
  // link in qTest with no automated re-link restore — see header note (re-confirmed 2026-07-01).
  test.fixme('AT_TC_024 | Verify Unlink Test Case Functionality in Existing Test Cases Section', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 1: follow AT_TC_021 — open a requirement with linked test cases ───────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);
    await authorPage.selectRequirementAndOpenDetail(0);
    await authorPage.verifyLinkedTestCasesPresent(data.linkedTcColumns);

    // ─── Step 2-3: a linked test case + its Unlink icon are visible ────────────────────
    const before = await authorPage.getLinkedTcIds();
    expect(before.length, 'a linked test case to unlink').toBeGreaterThan(0);
    await expect(authorPage.unlinkIcons.first()).toBeVisible();
    await captureScreenshot(page, 'Step 2-3: Linked test case + Unlink icon');

    // ─── Step 4: click Unlink → confirmation popup ─────────────────────────────────────
    await authorPage.clickUnlink(0);
    await expect(authorPage.unlinkConfirmYes).toBeVisible();
    await expect(authorPage.unlinkConfirmNo).toBeVisible();
    await captureScreenshot(page, 'Step 4: Unlink confirmation popup');

    // ─── Step 5-7: confirm → test case removed + count updated (MUTATING) ──────────────
    await authorPage.confirmUnlink();
    await expect.poll(() => authorPage.getLinkedTcCount(), { timeout: 15000 }).toBe(before.length - 1);
    const after = await authorPage.getLinkedTcIds();
    expect(after, 'unlinked test case no longer displayed').not.toContain(before[0]);
    await captureScreenshot(page, 'Step 5-7: Test case unlinked, count updated');
  });

});
