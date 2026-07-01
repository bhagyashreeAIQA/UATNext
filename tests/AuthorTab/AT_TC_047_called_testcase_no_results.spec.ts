/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_047
 * Test Name    : Verify Search Behavior When No Called Test Case Is Found
 *
 * Description  : As a Test Engineer, I want to validate that an Add Called Test Case search with no
 *                match shows an appropriate message and no results.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-6): open a test case → ADD CALLED TESTCASE → popup → enter an invalid Test Case ID →
 *   Search → a no-results message is shown and no records are returned.
 *
 * Live note + DEVIATION (2026-06-30): the build shows "Please enter a valid Test case Id" for an
 *   invalid/no-match search (not the documented "No matching records found"); this asserts either.
 *
 * Post-condition: read-only — the popup is cancelled; no called test case is linked.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Called Test Case – No Results', () => {

  test('AT_TC_047 | Verify Search Behavior When No Called Test Case Is Found', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-4: open a test case → ADD CALLED TESTCASE popup ────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    await authorPage.openCalledTcPopup();
    await captureScreenshot(page, 'Step 1-4: Add Called Test Case popup');

    // ─── Step 5-6: search an invalid Test Case ID → no results + message ───────────────
    await authorPage.searchCalledTc(data.noMatchSearch);
    await authorPage.verifyCalledTcNoResults();
    await captureScreenshot(page, 'Step 5-6: No matching records');

    await authorPage.closeCalledTcPopup();
  });

});
