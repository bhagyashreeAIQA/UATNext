/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_002
 * Test Name    : Verify Valid Test Case Search Populates Version and Test Runs
 *
 * Description  : Entering a valid Test Case PID and searching retrieves the latest approved version
 *                and populates the Test Runs dropdown.
 *
 * Pre-conditions: Logged in; BU/project with an approved test case + runs (see testData note).
 *
 * Steps:
 *   1. Follow GTL_TC_001.
 *   2. Enter a valid Test Case PID and trigger the search.
 *   3. Validate Test Case Version, Test Runs and the GENERATE TEST LOG button state.
 *
 * Expected:
 *   1. Entered PID is visible.
 *   2. Test Case Version is auto-populated with the latest approved version.
 *   3. Test Runs dropdown lists available test runs.
 *   4. GENERATE TEST LOG remains disabled until a test run is selected.
 *
 * BUILD NOTE: the search icon is decorative (pointer-events:none), so the search is triggered by
 *   pressing Enter, not by clicking the icon.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_002 | Verify Valid Test Case Search Populates Version and Test Runs', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    // Step 2: enter a valid PID and search (Enter-triggered; retried until the version resolves)
    await gtl.searchValidTestCase(data.validTestCasePid);
    expect(await gtl.getTestCaseValue()).toBe(data.validTestCasePid);   // Expected 1

    // Expected 2: Version auto-populated
    expect(await gtl.getVersionValue()).toBe(data.expectedVersion);

    // Expected 3: Test Runs populated
    const runs = await gtl.getTestRunOptions();
    expect(runs.length).toBeGreaterThan(0);
    expect(runs).toContain(data.validTestRun);

    // Expected 4: GENERATE disabled until a run is selected
    expect(await gtl.isGenerateDisabled()).toBe(true);
    await captureScreenshot(page, "Step 2: enter a valid PID and search (Enter-triggered; retried until the version resolves)");
  });

});
