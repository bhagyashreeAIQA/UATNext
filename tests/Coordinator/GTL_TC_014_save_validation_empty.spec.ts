/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_014
 * Test Name    : Verify Validation When Saving with Required Fields Left Empty
 *
 * Description  : The system should prevent saving a New Log when mandatory fields are empty.
 *
 * Pre-conditions: Logged in; on Generate Test Log; valid Test Case + Test Run selected; GENERATE
 *                 enabled.
 *
 * Steps:
 *   1. Follow GTL_TC_006.
 *   2. Leave required New Log fields empty.
 *   3. Click SAVE.
 *
 * Expected (documented): the log is not saved and a validation message names the required fields.
 *
 * BLOCKED (test.fixme): this build has NO save-blocking validation on the New Log. A freshly
 *   generated New Log (every step Status defaulting to "Unexecuted", all Actual Results empty) saves
 *   successfully and shows "Test log created successfully" — i.e. "all Unexecuted / empty" is a valid
 *   saved state, so the documented validation does not exist to assert against. This test is parked
 *   until such validation is introduced (it would otherwise have to assert the opposite of the spec).
 *   NOTE: when enabled it would be MUTATING (a successful save creates a real test log).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog, searchSelectAndGenerate } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test.fixme('GTL_TC_014 | Verify Validation When Saving with Required Fields Left Empty', async ({ page }) => {
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    await searchSelectAndGenerate(gtl, data.validTestCasePid, data.validTestRun);

    // Leave everything at defaults (empty actual results, all Unexecuted) and Save.
    await gtl.clickSave();

    // Documented expectation (not met by the current build): a validation message blocks the save.
    await expect(page.getByText(/required|please|validation|cannot|mandatory/i).first()).toBeVisible();
  });

});
