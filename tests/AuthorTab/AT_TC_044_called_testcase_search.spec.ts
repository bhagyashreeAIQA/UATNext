/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_044
 * Test Name    : Verify User Can Search Test Cases in Add Called Test Case Popup
 *
 * Description  : As a Test Engineer, I want to validate that the search field in the Add Called Test
 *                Case popup returns matching test cases.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open a test case → ADD CALLED TESTCASE → popup → enter a valid Test Case ID → Search →
 *   matching test case(s) displayed with Test Case ID and Name.
 *
 * Post-condition: read-only — the popup is cancelled; no called test case is linked.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Called Test Case – Search', () => {

  test('AT_TC_044 | Verify User Can Search Test Cases in Add Called Test Case Popup', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-3: open a test case; capture a valid TC id to search ───────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    const tcIds = await authorPage.getLinkedTcIds();
    expect(tcIds.length, 'a test case id to search').toBeGreaterThan(0);
    const searchId = tcIds[0];
    await authorPage.openTestCaseDetail(0);

    // ─── Step 4-5: open the Add Called Test Case popup ─────────────────────────────────
    await authorPage.openCalledTcPopup();
    await captureScreenshot(page, 'Step 4-5: Called test case popup');

    // ─── Step 6-7: search a valid Test Case ID → matching result(s) shown ──────────────
    await authorPage.searchCalledTc(searchId);
    await expect(authorPage.calledTcModal.getByText(searchId).first(),
      'searched test case appears in results').toBeVisible({ timeout: 15000 });
    await captureScreenshot(page, 'Step 6-7: Search results');

    await authorPage.closeCalledTcPopup();
  });

});
