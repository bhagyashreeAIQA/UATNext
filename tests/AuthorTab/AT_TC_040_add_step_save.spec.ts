/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_040
 * Test Name    : Verify User Can Add a Test Step Using Save Button
 *
 * Description  : As a Test Engineer, I want to validate that a test step is added when valid step
 *                details are entered and Save is clicked.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-12): open a test case → "+" → UAT Category (Business/Technical/N/A) → select category →
 *   enter Step Description + Expected Result → Save → "Test Case updated successfully" → the new step
 *   appears in the Existing Test Steps table.
 *
 * Note: the Step Description and Expected Result cells are TinyMCE editors whose editable area lives
 *   inside an `iframe[title="Rich Text Area"]`. Filling the iframe body (scoped to the `#stepDescription`
 *   / `#stepExpected` cell) commits the text reliably — see `enterStepDescription`/`enterStepExpected`.
 *
 * 2026-08-14: re-enabled (was `test.fixme`). Both original blockers are resolved:
 *   - the TinyMCE programmatic-commit concern is already handled by `enterTinyMceCell`'s
 *     re-click-until-the-iframe-appears polling, and proven live by AT_TC_051/AT_TC_052, which
 *     already add+save a step via this exact editor on every run;
 *   - the "permanent mutation" concern is resolved the same way those two cases resolve it: add →
 *     validate the save → delete the step in the same run, so the net data change is zero and the
 *     case is safe to leave enabled. See `addAndSaveTestStep`/`deleteStepAt`.
 *
 * Post-condition: MUTATES data during the run — a test step is added then deleted (net unchanged).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Add Step (Save)', () => {

  test('AT_TC_040 | Verify User Can Add a Test Step Using Save Button', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    const stepsBefore = await authorPage.getTestStepCount();

    // ─── Step 4-10: add step → UAT Category "Technical" → Step Description + Expected Result ──
    await authorPage.addTestStep();
    await authorPage.selectUatCategory('Technical'); // re-issues until the value sticks
    await authorPage.enterStepDescription('AT_TC_040 automated step description');
    await authorPage.enterStepExpected('AT_TC_040 automated expected result');
    await captureScreenshot(page, 'Step 4-10: New step details entered');

    // ─── Step 11-12: Save → "Test Case updated successfully" → new step appears ────────
    await authorPage.saveTcDetail(); // clicks SAVE and waits for the "updated successfully" toast
    expect(await authorPage.getTestStepCount(), 'step added').toBe(stepsBefore + 1);
    await captureScreenshot(page, 'Step 11-12: Test step added');

    // ─── Cleanup: delete the step just added, restoring the test case to its prior state ──
    // The just-added step is the LAST saved step, so target the last delete icon (index off the
    // per-step delete-icon count, not getStepRowCount(), which counts an extra trailing add-new
    // row with no delete icon).
    await expect(authorPage.stepDeleteIcons.last()).toBeVisible();
    await authorPage.deleteStepAt((await authorPage.stepDeleteIcons.count()) - 1);
    await authorPage.saveTcDetail();
    await expect.poll(() => authorPage.getTestStepCount(), { timeout: 15000 }).toBe(stepsBefore);
    await captureScreenshot(page, 'Cleanup: added step deleted, net unchanged');
  });

});
