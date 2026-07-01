/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_043
 * Test Name    : Verify Add Called Test Case Popup Opens from Test Case Details Page
 *
 * Description  : As a Test Engineer, I want to validate that ADD CALLED TESTCASE opens the search popup
 *                for locating an existing test case to link.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-9): select a requirement → linked test cases → open a test case → ADD CALLED TESTCASE
 *   button visible → click → popup opens → result columns PID/Name → Search button enabled → Cancel
 *   button enabled.
 *
 * Post-condition: read-only — the popup is cancelled; no called test case is linked.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Called Test Case – Popup', () => {

  test('AT_TC_043 | Verify Add Called Test Case Popup Opens from Test Case Details Page', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-4: linked test cases → open a test case ────────────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.verifyLinkedTestCasesPresent(data.linkedTcColumns);
    await authorPage.openTestCaseDetail(0);
    await captureScreenshot(page, 'Step 1-4: Test case detail');

    // ─── Step 5-6: ADD CALLED TESTCASE visible → click → popup opens ───────────────────
    await expect(authorPage.addCalledTestCaseButton).toBeVisible();
    await authorPage.openCalledTcPopup();
    await captureScreenshot(page, 'Step 5-6: Add Called Test Case popup');

    // ─── Step 7-9: PID/Name columns + Search + Cancel ──────────────────────────────────
    await authorPage.verifyCalledTcPopup();
    await captureScreenshot(page, 'Step 7-9: Columns + Search + Cancel');

    await authorPage.closeCalledTcPopup();
  });

});
