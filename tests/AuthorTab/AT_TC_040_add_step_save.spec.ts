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
 * Post-condition: this case MUTATES data — it adds a test step to the test case.
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
    //await authorPage.waitForTotalEntries(data.epicACount);
    await authorPage.selectFeature(data.featureA);
    //await authorPage.waitForTotalEntries(data.epicACount);

    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    const stepsBefore = await authorPage.getStepRowCount();

    // ─── Step 4-10: add step → UAT Category → Step Description + Expected Result ────────
    // (the new step's default UAT Category is asserted by AT_TC_039; this case only needs a category
    //  set, and since this test mutates by appending steps the default would inherit a prior run's value)
    await authorPage.addTestStep();
    await authorPage.selectUatCategory('Technical'); // re-issues until the value sticks
    await authorPage.enterStepDescription('Automated step description');
    await authorPage.enterStepExpected('Automated expected result');
    await captureScreenshot(page, 'Step 4-10: New step details entered');

    // ─── Step 11-12: Save → success → new step appears ─────────────────────────────────
    await authorPage.saveTcDetail();
    await expect.poll(() => authorPage.getStepRowCount(), { timeout: 15000 })
      .toBeGreaterThan(stepsBefore);
    await captureScreenshot(page, 'Step 11-12: Test step added');
  });

});
