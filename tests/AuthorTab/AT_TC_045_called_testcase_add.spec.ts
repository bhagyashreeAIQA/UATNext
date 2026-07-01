/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_045
 * Test Name    : Verify User Can Select and Add a Called Test Case
 *
 * Description  : As a Test Engineer, I want to validate that searching, selecting and adding an
 *                existing test case as a called test case creates a "Call <name>" step.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open a test case → ADD CALLED TESTCASE → search → select a result → Save → popup
 *   closes → a new "Call <Test Case Name>" step (clickable hyperlink) is created.
 *
 * BLOCKED (test.fixme): the Add Called Test Case popup's result selection + add/save mechanism (how a
 *   search result is chosen and committed to create the "Call <name>" step) is not yet captured, and
 *   confirming the add MUTATES the test case (adds a called step linking another test case). The body
 *   encodes the intended flow (search → select → save → "Call <name>" step); enable once the
 *   result-selection/save controls are pinned down. The popup open + search are covered by AT_TC_043/044.
 *
 * Post-condition: this case (when enabled) MUTATES data — it adds a called test case step.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Called Test Case – Add as Step', () => {

  test('AT_TC_045 | Verify User Can Select and Add a Called Test Case', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-5: open a test case → ADD CALLED TESTCASE → search ─────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    const tcIds = await authorPage.getLinkedTcIds();
    await authorPage.openTestCaseDetail(0);
    await authorPage.openCalledTcPopup();
    await authorPage.searchCalledTc(tcIds[1]);

    // ─── Step 6-7: select a result + Save → "Call <name>" step (MUTATING) ──────────────
    // TODO: pin the result-row selection + add/save controls in #addCalledTestCaseModal.
    await authorPage.calledTcResultRows.first().click();
    await page.getByRole('button', { name: /^(SAVE|ADD)$/i }).first().click();
    await expect(authorPage.calledTcModal).toBeHidden({ timeout: 15000 });
    await expect(page.getByText(/^Call /i).first(), 'a "Call <name>" step is created').toBeVisible({ timeout: 15000 });
    await captureScreenshot(page, 'Step 6-7: Called test case added as a step');
  });

});
