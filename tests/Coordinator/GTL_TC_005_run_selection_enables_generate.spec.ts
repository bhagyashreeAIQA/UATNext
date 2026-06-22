/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_005
 * Test Name    : Verify Test Run Selection Enables Generate Test Log Button
 *
 * Description  : Selecting a Test Run enables the Generate Test Log button.
 *
 * Pre-conditions: Logged in; Test Case Version and Test Runs successfully loaded.
 *
 * Steps:
 *   1. Follow GTL_TC_002.
 *   2. Select a test run.
 *   3. Validate the GENERATE TEST LOG and CLEAR button states.
 *
 * Expected:
 *   1. Selected Test Run displayed.
 *   2. GENERATE TEST LOG becomes enabled and turns orange.
 *   3. CLEAR remains enabled.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_005 | Verify Test Run Selection Enables Generate Test Log Button', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // Follow GTL_TC_002: search + version + runs
    await gtl.searchValidTestCase(data.validTestCasePid);

    // Step 2: select a test run
    await gtl.selectTestRun(data.validTestRun);
    expect(await gtl.getSelectedTestRun()).toBe(data.validTestRun);   // Expected 1

    // Expected 2: GENERATE enabled + orange
    expect(await gtl.isGenerateDisabled()).toBe(false);
    expect(await gtl.getGenerateButtonColor()).toBe(data.generateEnabledColor);

    // Expected 3: CLEAR enabled
    expect(await gtl.isClearDisabled()).toBe(false);
    await captureScreenshot(page, "Step 2: select a test run");
  });

});
