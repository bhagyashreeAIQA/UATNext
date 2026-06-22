/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_004
 * Test Name    : Verify Invalid Test Case PID Search Behavior
 *
 * Description  : Invalid Test Case IDs do not populate version or test run information.
 *
 * Pre-conditions: Logged in; test data exists (see testData note).
 *
 * Steps:
 *   1. Follow GTL_TC_001.
 *   2. Enter an invalid Test Case PID and search.
 *   3. Validate Version, Test Runs and the GENERATE TEST LOG button state.
 *
 * Expected:
 *   1. An error/no-runs message is displayed.
 *   2. Test Case Version remains empty.
 *   3. Test Runs remains at "Please Select".
 *   4. GENERATE TEST LOG remains disabled.
 *
 * BUILD NOTE: the live message is "Error fetching test runs. Please try again." (the spec wording is
 *   "No test runs found"); matched leniently via testData.noRunsMessage.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_004 | Verify Invalid Test Case PID Search Behavior', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // Step 2: search an invalid PID (waits for the no-result state)
    await gtl.searchInvalidTestCase(data.invalidTestCasePid);

    // Expected 1: error / no-runs message
    await expect(page.getByText(data.noRunsMessage).first()).toBeVisible({ timeout: 20000 });

    // Expected 2-4: version empty, runs empty, GENERATE disabled
    expect(await gtl.getVersionValue()).toBe('');
    expect(await gtl.getSelectedTestRun()).toBe('');
    expect(await gtl.isGenerateDisabled()).toBe(true);
    await captureScreenshot(page, "Step 2: search an invalid PID (waits for the no-result state)");
  });

});
