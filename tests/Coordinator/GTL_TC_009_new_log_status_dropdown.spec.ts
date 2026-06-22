/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_009
 * Test Name    : Verify New Log Step Status Dropdown is Editable and Defaults to Unexecuted
 *
 * Description  : Each step Status defaults to "Unexecuted" and allows updates to other statuses.
 *
 * Pre-conditions: Logged in; New Log section displayed.
 *
 * Steps:
 *   1. Follow GTL_TC_006.
 *   2. Validate the default Status for each step.
 *   3. Open a step Status dropdown and validate the options.
 *   4. Select a different Status value.
 *   5. Validate the overall New Log Status dropdown (default + editable).
 *
 * Expected:
 *   1. Each step Status defaults to "Unexecuted".
 *   2. Options available (live build): Passed, Failed, Incomplete, Blocked, Unexecuted.
 *   3. Selected status displayed.
 *   4. Overall Status dropdown defaults to "Unexecuted" and is editable.
 *
 * BUILD NOTE: the documented option list (7 incl. Retest / In Progress) is a superset; this build
 *   exposes only the five live options asserted here.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog, searchSelectAndGenerate } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_009 | Verify New Log Step Status Dropdown is Editable and Defaults to Unexecuted', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search/generate make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    await searchSelectAndGenerate(gtl, data.validTestCasePid, data.validTestRun);

    // Expected 1: every step defaults to Unexecuted
    const statuses = await gtl.getStepStatusValues('new');
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every(s => s === data.defaultStatus)).toBe(true);

    // Expected 2: dropdown options (sorted compare to be order-independent)
    const options = await gtl.getNewLogStepStatusOptions(0);
    expect([...options].sort()).toEqual([...data.newLogStatusOptions].sort());

    // Expected 3: select a different status, it is displayed
    await gtl.selectNewLogStepStatus(0, 'Passed');
    expect((await gtl.stepStatusInputs('new').first().inputValue()).trim()).toBe('Passed');

    // Expected 4: overall New Log Status defaults to Unexecuted and is editable (not read-only)
    expect((await gtl.newLogStatus.inputValue()).trim()).toBe(data.defaultStatus);
    await expect(gtl.newLogStatus).not.toHaveAttribute('readonly', /.*/);
    await captureScreenshot(page, "Final state — GTL_TC_009 | Verify New Log Step Status Dropdown is Editable and Defaults to Unexecuted");
  });

});
