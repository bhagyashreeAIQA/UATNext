/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_046
 * Test Name    : Verify Navigation to Called Test Case Details from Hyperlink
 *
 * Description  : As a Test Engineer, I want to validate that clicking a called test case hyperlink
 *                opens the referenced Test Case Details page.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module";
 *                 a called test case has been added (produced by AT_TC_045).
 *
 * Steps (1-5): open a test case containing a called test case → the "Call <name>" hyperlink is
 *   visible/enabled → click it → the referenced Test Case Details open → details displayed.
 *
 * Implementation notes: the "Call <name>" hyperlink is a readonly, pointer-cursor `input.called-tc`
 *   inside the step's `#stepDescription .call-tc-container` (its value is the referenced test case
 *   name) — not an `<a>`. Clicking it opens the referenced test case read-only: the caller's SAVE
 *   button is replaced by a CLOSE-only header and a new (distinct) TC-id breadcrumb is shown. Depends
 *   on the called-step data created by AT_TC_045, which runs first in a full suite run and whose
 *   result persists in the app.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Called Test Case – Navigation', () => {

  test('AT_TC_046 | Verify Navigation to Called Test Case Details from Hyperlink', async ({ page }) => {
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
    const fromTcId = await authorPage.openTestCaseDetail(0);
    const calledLink = authorPage.calledTcStepLink.first();
    await expect(calledLink, 'a "Call <name>" step hyperlink').toBeVisible();
    await expect(calledLink, 'the "Call <name>" hyperlink is enabled').toBeEnabled();
    await captureScreenshot(page, 'Step 1-3: Called test case hyperlink');

    // ─── Step 4-5: click the hyperlink → referenced Test Case Details open ─────────────
    const referencedName = await authorPage.openReferencedTestCase(fromTcId);
    await authorPage.verifyReferencedTestCaseDetails(referencedName);
    await captureScreenshot(page, 'Step 4-5: Referenced test case details');
  });

});
