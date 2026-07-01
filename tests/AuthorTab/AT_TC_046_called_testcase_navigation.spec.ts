/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_046
 * Test Name    : Verify Navigation to Called Test Case Details from Hyperlink
 *
 * Description  : As a Test Engineer, I want to validate that clicking a called test case hyperlink
 *                opens the referenced Test Case Details page.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module";
 *                 a called test case has been added (follow AT_TC_045).
 *
 * Steps (1-5): open a test case containing a called test case → the "Call <name>" hyperlink is
 *   visible/enabled → click it → the referenced Test Case Details open → details displayed.
 *
 * BLOCKED (test.fixme): this depends on a called test case ("Call <name>" step) already existing on a
 *   test case, which is produced by AT_TC_045 — itself `test.fixme` (the Add Called Test Case
 *   result-selection/save flow is not yet automated). No test case with a called-test-case hyperlink is
 *   reliably available. Enable once AT_TC_045 can add a called test case. The body encodes the intended
 *   navigation flow.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Called Test Case – Navigation', () => {

  test.fixme('AT_TC_046 | Verify Navigation to Called Test Case Details from Hyperlink', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-3: open a test case containing a called test case hyperlink ────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    const calledLink = page.getByRole('link', { name: /^Call / }).first();
    await expect(calledLink, 'a "Call <name>" hyperlink').toBeVisible();
    await captureScreenshot(page, 'Step 1-3: Called test case hyperlink');

    // ─── Step 4-5: click the hyperlink → referenced Test Case Details open ─────────────
    await calledLink.click();
    await authorPage.verifyTestCaseDetails(/* referenced tc */ '', /* req */ '');
    await captureScreenshot(page, 'Step 4-5: Referenced test case details');
  });

});
