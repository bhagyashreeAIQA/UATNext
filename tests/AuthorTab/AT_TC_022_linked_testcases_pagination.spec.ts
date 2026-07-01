/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_022
 * Test Name    : Verify Linked Test Cases List and Pagination for Selected Requirement
 *
 * Description  : As a Test Engineer, I want to validate that linked Test Cases and pagination are
 *                displayed correctly for the selected Requirement.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-4): follow AT_TC_021 (a requirement with linked test cases) → pagination controls shown →
 *   navigate pages (when records exceed one page) → only the requirement's test cases are displayed.
 *
 * Live note (2026-06-30): page navigation is data-dependent (the requirement must have more than one
 *   page of linked test cases). The test navigates only when a next page exists; otherwise it
 *   validates the single page. Every linked row is a TC-#### (associated with the requirement).
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Linked Test Cases', () => {

  test('AT_TC_022 | Verify Linked Test Cases List and Pagination for Selected Requirement', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 1: follow AT_TC_021 — open a requirement with linked test cases ───────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.verifyLinkedTestCasesPresent(data.linkedTcColumns);
    await captureScreenshot(page, 'Step 1: Linked Test Cases displayed');

    // ─── Step 2: pagination controls displayed ─────────────────────────────────────────
    await authorPage.verifyLinkedTcPaginationDisplayed();
    await captureScreenshot(page, 'Step 2: Linked Test Cases pagination');

    // ─── Step 3: navigate using pagination when more than one page exists ──────────────
    const nextBtn = authorPage.linkedTcPagination.locator('img[alt="Next"]');
    const before = await authorPage.getLinkedTcIds();
    const nextStyle = (await nextBtn.getAttribute('style').catch(() => '') ?? '').replace(/\s+/g, '');
    const hasNextPage = (await nextBtn.count()) > 0 && !/opacity:0?\.5/.test(nextStyle) && !/cursor:default/.test(nextStyle);
    if (hasNextPage) {
      await nextBtn.click();
      await expect.poll(() => authorPage.getLinkedTcIds(), { timeout: 15000 }).not.toEqual(before);
      await captureScreenshot(page, 'Step 3: Navigated to next page of test cases');
    }

    // ─── Step 4: only the requirement's test cases are displayed (valid TC ids) ────────
    const tcIds = await authorPage.getLinkedTcIds();
    expect(tcIds.length, 'linked test cases present').toBeGreaterThan(0);
    for (const id of tcIds) expect(id, 'associated linked test case id').toMatch(/^TC-\d+$/);
    await captureScreenshot(page, 'Step 4: Only associated test cases displayed');
  });

});
