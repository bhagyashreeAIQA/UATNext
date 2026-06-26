/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_013
 * Test Name    : Verify Test Case Search is Scoped to Current Business Unit
 *
 * Description  : Test Case search resolves only against the currently selected Business Unit — the
 *                same Test Case PID returns that BU's own test case, and another BU's version / runs
 *                are not reachable.
 *
 * Pre-conditions: Logged in; the COORDINATOR tab is available; the test PID exists in two Business
 *                 Units with different BU-local data (see EXPECTED.generateTestLog.crossBu).
 *
 * Steps:
 *   1. On the home Business Unit (qConnect - Sample Project), open Generate Test Log and search the
 *      Test Case PID — note the resolved Version and Test Runs.
 *   2. Switch to a different Business Unit (UATNext Dev), reopen Generate Test Log and search the
 *      SAME PID.
 *   3. Validate the Version, the Test Runs dropdown and the GENERATE TEST LOG button.
 *
 * Expected:
 *   1. The search is scoped to the active BU: the same PID resolves to a DIFFERENT version per BU
 *      (3.0 on qConnect vs 1.0 on UATNext Dev), and the home BU's runs (TR-2237…) are NOT offered in
 *      the other BU; with no run available in that BU, GENERATE TEST LOG stays disabled.
 *
 * BUILD NOTE (verified live 2026-06-25): the original "different BU" PID was unavailable, so this was
 *   blocked. TC-3019 exists in BOTH BUs as distinct test cases — qConnect: v3.0 with runs
 *   TR-2237/2253/2269/2285; UATNext Dev: v1.0 with no runs — which lets the scoping be asserted as a
 *   cross-BU comparison (the identical PID never exposes the other BU's version or runs). A transient
 *   "Error fetching test runs" toast can flash on the UATNext Dev search because that copy has no
 *   runs; it is not asserted against.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_013 | Verify Test Case Search is Scoped to Current Business Unit', async ({ page }) => {
    test.slow(); // login + permission nav + two BU searches exceed the 30s default
    const data = EXPECTED.generateTestLog;
    const cb = data.crossBu;

    // ─── Step 1: home BU (qConnect) — the PID resolves to this BU's test case ──────────
    // Force the home BU explicitly so the comparison is deterministic regardless of the cached BU.
    const { generateTestLogPage: gtl, homePage } =
      await loginAndOpenGenerateTestLog(page, cb.homeWorkspace);

    await gtl.searchValidTestCase(cb.pid);
    expect(await gtl.getVersionValue()).toBe(cb.homeVersion);
    // Home BU has runs — use the strict getter that waits for the dropdown to stream its items
    // (getTestRunOptionsSafe swallows the not-yet-loaded state as [] and races the assertion).
    const homeRunOptions = await gtl.getTestRunOptions();
    expect(homeRunOptions).toContain(cb.homeRun);
    await captureScreenshot(page, `Step 1: ${cb.pid} on ${cb.homeWorkspace} — v${cb.homeVersion}, runs available`);

    // ─── Step 2: switch BU (UATNext Dev) and search the SAME PID ───────────────────────
    await homePage.switchWorkspace(cb.otherWorkspace);
    // Pause the execution for 3 seconds (3000 milliseconds)
    await page.waitForTimeout(3000);

    await homePage.navigateToCoordinatorTab();
    // Under UATNext Dev the COORDINATOR screen can land on the Bulk Execution sub-tab (no Test Case
    // search field) — make sure the Generate Test Log sub-tab is active before searching.
    await gtl.ensureGenerateTestLogSubTab();
    await gtl.searchValidTestCase(cb.pid);
    await captureScreenshot(page, `Step 2: same PID searched on ${cb.otherWorkspace}`);

    // ─── Step 3: search is scoped to the active BU ─────────────────────────────────────
    // Same PID, different BU-local version — proves the search did not reach the home BU's copy.
    const otherVersion = await gtl.getVersionValue();
    expect(otherVersion).toBe(cb.otherVersion);
    expect(otherVersion).not.toBe(cb.homeVersion);
    // The home BU's run is not selectable here, and with no run available GENERATE stays disabled.
    const otherRunOptions = await gtl.getTestRunOptionsSafe();
    expect(otherRunOptions).not.toContain(cb.homeRun);
    expect(await gtl.getSelectedTestRun()).toBe('');
    expect(await gtl.isGenerateDisabled()).toBe(true);
    // This BU's copy of the PID has no runs at all — the explicit empty-state confirms the home BU's
    // runs are unreachable here, not merely hidden.
    await expect(page.getByText(`No test runs found for '${cb.pid}'`)).toBeVisible();
    await captureScreenshot(page, `Step 3: scoped to ${cb.otherWorkspace} — v${cb.otherVersion}, home runs unreachable, GENERATE disabled`);
  });

});
