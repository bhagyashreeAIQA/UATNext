/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_003
 * Test Name    : Verify Enter Key Triggers Test Case Search
 *
 * Description  : Pressing Enter after entering a valid Test Case PID triggers the search.
 *
 * Pre-conditions: Logged in; BU/project with an approved test case + runs (see testData note).
 *
 * Steps:
 *   1. Follow GTL_TC_001.
 *   2. Enter a valid Test Case PID.
 *   3. Press Enter.
 *   4. Validate Test Case Version and Test Runs.
 *
 * Expected:
 *   1. PID visible; search executes.
 *   2. Test Case Version shows the latest approved version.
 *   3. Test Runs populated with available runs.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_003 | Verify Enter Key Triggers Test Case Search', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // Steps 2-3: enter PID + press Enter (searchValidTestCase types then presses Enter, retrying)
    await gtl.searchValidTestCase(data.validTestCasePid);
    expect(await gtl.getTestCaseValue()).toBe(data.validTestCasePid);

    // Expected 2: version populated by the Enter-triggered search
    expect(await gtl.getVersionValue()).toBe(data.expectedVersion);

    // Expected 3: Test Runs populated
    const runs = await gtl.getTestRunOptions();
    expect(runs.length).toBeGreaterThan(0);
    expect(runs).toContain(data.validTestRun);
    await captureScreenshot(page, "Steps 2-3: enter PID + press Enter (searchValidTestCase types then presses Enter, retrying)");
  });

});
