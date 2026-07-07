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
 * DATA NOTE: the never-executed run is not hard-coded — it is COLLECTED from the Bulk Execution grid.
 *   Both flows are COORDINATOR sub-tabs, so this test loads the Bulk Execution grid, picks a row whose
 *   Status is "Unexecuted" AND whose Execution Date is blank (by definition a run with no previous
 *   execution), then switches to Generate Test Log and drives that PID + run. A hard-coded run drifts
 *   (the once-pinned TR-1680/TR-1687 get executed over time and grow a Last Log; a stepless PID like
 *   TC-26112 yields an empty New Log), so several candidates are tried until one has step rows to inspect.
 *
 * Post-condition: no data is mutated (the log is generated for inspection only, not saved).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { GenerateTestLogPage } from '../../pages/Coordinator/GenerateTestLogPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_010 | Verify Last Log Section is Blank When No Previous Execution Exists', async ({ page }) => {
    test.setTimeout(240_000); // bulk grid walk + switching sub-tabs + trying several candidates
    const gtlData = EXPECTED.generateTestLog;
    const beData  = EXPECTED.bulkExecution;

    // ─── Step 1: open COORDINATOR on UATNext Dev and load a populated Bulk Execution grid ───
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, beData.workspace);
    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(beData.expectedProject, beData.releaseWithCycles);
    await be.openCycleGrid(beData.releaseWithCycles, beData.cycleWithRuns);
    await captureScreenshot(page, 'Step 1: Bulk Execution grid loaded');

    // ─── Data collection: pick the test case from bulk entries with status Unexecuted + blank date ──
    const candidates = await be.collectUnexecutedBlankDateRuns();
    expect(candidates.length,
      'a Bulk Execution row with status Unexecuted + blank Execution Date').toBeGreaterThan(0);
    await captureScreenshot(page, `Data: ${candidates.length} never-executed candidate(s) collected`);

    // ─── Step 2-3: switch to Generate Test Log; search + generate until a candidate has step rows ───
    await be.openGenerateTestLog();
    const gtl = new GenerateTestLogPage(page);
    await gtl.ensureGenerateTestLogSubTab();

    let chosen: { pid: string; runId: string } | null = null;
    let lastCount = -1;
    let newStatuses: string[] = [];
    for (const c of candidates) {
      // A bulk-grid PID may not resolve in GTL (BU-scoped) or the run may be listed elsewhere — skip
      // gracefully and try the next candidate rather than failing the whole test.
      try {
        await gtl.searchValidTestCase(c.pid);
      } catch { continue; }
      const runs = await gtl.getTestRunOptionsSafe();
      await page.keyboard.press('Escape').catch(() => undefined);
      if (!runs.includes(c.runId)) continue;

      await gtl.selectTestRun(c.runId);
      await gtl.clickGenerate();
      // New Log steps stream in after the grid mounts (SignalR); allow them to arrive, but a stepless
      // test case simply stays at 0 — in which case move on to the next candidate.
      await gtl.waitForSteps('new', 10000).catch(() => undefined);
      if (await gtl.getStepCount('new') === 0) continue;

      chosen = c;
      lastCount = await gtl.getStepCount('last');
      newStatuses = await gtl.getStepStatusValues('new');
      break;
    }

    expect(chosen, 'a never-executed run whose test case has step rows to inspect').not.toBeNull();
    await captureScreenshot(page, `Step 2-3: never-executed run ${chosen!.pid} / ${chosen!.runId} generated`);

    // ─── Step 4: Last Log blank — no previous execution, so no step rows ──────────────
    expect(lastCount).toBe(0);
    await captureScreenshot(page, 'Step 4: Last Log blank (no previous execution)');

    // ─── Steps 5-6: New Log fully populated, every step defaulting to Unexecuted ──────
    expect(newStatuses.length).toBeGreaterThan(0);
    expect(newStatuses.every(s => s === gtlData.defaultStatus)).toBe(true);
    await captureScreenshot(page, 'Step 5-6: New Log fully populated, all steps Unexecuted');
  });

});
