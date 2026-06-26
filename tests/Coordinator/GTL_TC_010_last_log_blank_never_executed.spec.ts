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
 * DATA NOTE: the never-executed run is TC-26300 → TR-1680, which lives in the "UATNext Dev" workspace
 *   (NOT the default qConnect BU), version 2.0 — verified live 2026-06-24: generating its log shows a
 *   blank Last Log (0 step rows) while the New Log carries all steps defaulting to Unexecuted.
 *   `EXPECTED.generateTestLog.neverExecuted` holds the workspace / pid / version / run.
 *
 * Post-condition: no data is mutated (the log is generated for inspection only, not saved).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_010 | Verify Last Log Section is Blank When No Previous Execution Exists', async ({ page }) => {
    test.slow(); // workspace switch + permission nav + slow search exceed the 30s default
    const data = EXPECTED.generateTestLog;
    const nx = data.neverExecuted;
    // ─── Step 1: open the Generate Test Log screen (on the UATNext Dev workspace) ─────
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page, nx.workspace);
    await captureScreenshot(page, 'Step 1: Generate Test Log screen open (UATNext Dev)');

    // ─── Step 2: search the test case and confirm its version populates ───────────────
    await gtl.searchValidTestCase(nx.pid);
    expect(await gtl.getVersionValue()).toBe(nx.version);
    await captureScreenshot(page, 'Step 2: Test case searched, version populated');

    // ─── Step 3: select the never-executed run and generate the log ───────────────────
    await gtl.selectTestRun(nx.run);
    await gtl.clickGenerate();
    // The New Log steps stream in after the grid mounts — wait for them before asserting, so the
    // generate is fully rendered when we check the (blank) Last Log.
    await expect.poll(() => gtl.getStepStatusValues('new').then(v => v.length), { timeout: 20000 })
      .toBeGreaterThan(0);
    await captureScreenshot(page, 'Step 3: Never-executed run selected and log generated');

    // ─── Step 4: Last Log blank — no previous execution, so no step rows ──────────────
    expect(await gtl.getStepCount('last')).toBe(0);
    await captureScreenshot(page, 'Step 4: Last Log blank (no previous execution)');

    // ─── Steps 5-6: New Log fully populated, every step defaulting to Unexecuted ──────
    const newStatuses = await gtl.getStepStatusValues('new');
    expect(newStatuses.length).toBeGreaterThan(0);
    expect(newStatuses.every(s => s === data.defaultStatus)).toBe(true);
    await captureScreenshot(page, 'Step 5-6: New Log fully populated, all steps Unexecuted');
  });

});
