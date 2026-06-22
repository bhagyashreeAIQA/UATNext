/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_011
 * Test Name    : Verify Save Functionality for New Log
 *
 * Description  : Clicking SAVE stores the entered execution details and updates the Last Log section.
 *
 * Pre-conditions: Logged in; New Log contains entered status/actual-result values.
 *
 * Steps:
 *   1. Follow GTL_TC_006 and set a step Status.
 *   2. Click SAVE.
 *   3. Validate the success message.
 *   4. Regenerate the log for the same Test Run.
 *   5. Validate the saved data appears in the Last Log section.
 *
 * Expected:
 *   1. Save completes; "Test log created successfully" is shown.
 *   2. The saved status persists into the Last Log on regenerate.
 *
 * MUTATING: writes a REAL test log for the run (no automated revert). Persistence is verified via the
 *   step Status (robust) rather than the rich-text Actual Result (TinyMCE-backed; see GTL_TC_008).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog, searchSelectAndGenerate } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_011 | Verify Save Functionality for New Log', async ({ page }) => {
    test.setTimeout(180000);
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;
    const SAVED_STATUS = 'Passed';

    // Step 1: generate + set a step Status
    await searchSelectAndGenerate(gtl, data.validTestCasePid, data.validTestRun);
    await gtl.selectNewLogStepStatus(0, SAVED_STATUS);
    await captureScreenshot(page, "Step 1: generate + set a step Status");

    // Step 2-3: Save → success message
    await gtl.clickSave();
    await gtl.verifySaveSuccessMessage(data.saveSuccessMessage);
    await captureScreenshot(page, "Step 2-3: Save → success message");

    // Step 4: regenerate the log for the same run
    await searchSelectAndGenerate(gtl, data.validTestCasePid, data.validTestRun);

    // Expected 2: the saved status now appears in the Last Log section
    await expect.poll(() => gtl.getStepStatusValues('last'), { timeout: 20000 })
      .toContain(SAVED_STATUS);
    await captureScreenshot(page, "Step 4: regenerate the log for the same run");
  });

});
