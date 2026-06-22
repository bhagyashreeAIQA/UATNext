/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_010
 * Test Name    : Verify Last Log Section is Blank When No Previous Execution Exists
 *
 * Description  : When a selected Test Run has never been executed, the Last Log section stays blank
 *                while the New Log shows all steps defaulting to Unexecuted.
 *
 * Pre-conditions: Logged in; a Test Case with a Test Run that has NEVER been executed.
 *
 * Steps:
 *   1. Follow GTL_TC_001.
 *   2. Search a valid Test Case PID with a never-executed Test Run.
 *   3. Select that run; click GENERATE TEST LOG.
 *   4-6. Validate the Last Log is blank and the New Log shows all steps as Unexecuted.
 *
 * BLOCKED (test.fixme): this needs a Test Run that has never been executed. The available seeded
 *   runs all carry a previous execution (a non-empty Last Log), and creating a guaranteed-virgin run
 *   under this account is not reliably possible. Enable once a never-executed run is provisioned and
 *   set it in testData (e.g. generateTestLog.neverExecutedRun); the body then asserts the Last Log
 *   step rows / statuses are empty while the New Log is fully populated with Unexecuted steps.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog, searchSelectAndGenerate } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test.fixme('GTL_TC_010 | Verify Last Log Section is Blank When No Previous Execution Exists', async ({ page }) => {
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // TODO: replace with a Test Case + never-executed run once such data exists.
    await searchSelectAndGenerate(gtl, data.validTestCasePid, data.validTestRun);

    // Last Log present but with no execution data.
    expect(await gtl.getStepCount('last')).toBe(0);

    // New Log fully populated, all Unexecuted.
    const newStatuses = await gtl.getStepStatusValues('new');
    expect(newStatuses.length).toBeGreaterThan(0);
    expect(newStatuses.every(s => s === data.defaultStatus)).toBe(true);
  });

});
