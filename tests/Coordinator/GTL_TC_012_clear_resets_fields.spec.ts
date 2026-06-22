/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_012
 * Test Name    : Verify CLEAR Button Resets All Left Panel Fields
 *
 * Description  : Clicking CLEAR resets all left-panel fields and disables the Generate Test Log
 *                button.
 *
 * Pre-conditions: Logged in; Test Case, Version and Test Run populated; GENERATE enabled.
 *
 * Steps:
 *   1. Follow GTL_TC_005.
 *   2. Click CLEAR.
 *   3-6. Validate Test Case, Version, Test Runs and the GENERATE TEST LOG button.
 *
 * Expected:
 *   1. Test Case field cleared (placeholder shown).
 *   2. Test Case Version empty.
 *   3. Test Runs reset to "Please Select".
 *   4. GENERATE TEST LOG disabled.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_012 | Verify CLEAR Button Resets All Left Panel Fields', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // Follow GTL_TC_005: populate Test Case + Version + Test Run
    await gtl.searchValidTestCase(data.validTestCasePid);
    await gtl.selectTestRun(data.validTestRun);
    expect(await gtl.isClearDisabled()).toBe(false);

    // Step 2: click CLEAR
    await gtl.clickClear();

    // Expected 1-4: fields reset, GENERATE disabled
    await expect(gtl.testCaseInput).toHaveValue('');
    await expect(gtl.testCaseInput).toHaveAttribute('placeholder', /Enter test case pid/);
    await expect(gtl.testCaseVersionInput).toHaveValue('');
    await expect(gtl.testRunsInput).toHaveValue('');
    await expect(gtl.testRunsInput).toHaveAttribute('placeholder', 'Please Select');
    expect(await gtl.isGenerateDisabled()).toBe(true);
    await captureScreenshot(page, "Step 2: click CLEAR");
  });

});
