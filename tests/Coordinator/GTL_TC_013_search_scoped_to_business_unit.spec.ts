/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_013
 * Test Name    : Verify Test Case Search is Scoped to Current Business Unit
 *
 * Description  : Only Test Cases belonging to the currently selected Business Unit are accessible.
 *
 * Pre-conditions: Logged in; a Test Case exists in a DIFFERENT Business Unit.
 *
 * Steps:
 *   1. Follow GTL_TC_001.
 *   2. Enter a Test Case PID belonging to another Business Unit and search.
 *   3-6. Validate Version, Test Runs and the GENERATE TEST LOG button.
 *
 * Expected:
 *   1. The test case is not found; Version stays empty; Test Runs stays default; GENERATE disabled.
 *
 * BLOCKED (test.fixme): this needs a Test Case PID that exists in another BU but NOT in the current
 *   one. The UATNext Dev BU has no executable test data and no other-BU PID is reliably known to be
 *   absent from the current BU, so a true "different BU" negative cannot be distinguished from a
 *   plain invalid PID (covered by GTL_TC_004). Enable once a cross-BU PID is available in testData
 *   (e.g. generateTestLog.otherBuTestCasePid); the body then asserts the same not-found behaviour.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test.fixme('GTL_TC_013 | Verify Test Case Search is Scoped to Current Business Unit', async ({ page }) => {
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // TODO: use a PID that exists only in another BU once such data is available.
    await gtl.searchTestCase(data.invalidTestCasePid);

    expect(await gtl.getVersionValue()).toBe('');
    expect(await gtl.getSelectedTestRun()).toBe('');
    expect(await gtl.isGenerateDisabled()).toBe(true);
  });

});
