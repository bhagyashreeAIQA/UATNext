/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_019
 * Test Name    : Verify Version Mismatch Colour Coding at Test Cycle Level
 *
 * Description  : As a Test Engineer, I want to verify that the version mismatch colour coding (Red for
 *                mismatch, Black for match) works correctly when viewing runs at the Test Cycle level.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *   6. The selected cycle contains runs with both matched and mismatched versions.
 *
 * Steps:
 *   1. Follow BE_TC_011 → expand a Release and reveal its Test Cycles.
 *   2. Click a Test Cycle.
 *   3. Check the Test Case Version column across rows.
 *
 * Expected: mismatched versions render RED; matching versions render normal/BLACK.
 *
 * BUILD NOTE: RED is rgb(255, 65, 54); a matching version uses the normal text token rgb(71, 84, 103)
 *   (the build's dark-slate stand-in for "black"). Testdata_Cycle_1 carries both states.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_019 | Verify Version Mismatch Colour Coding at Test Cycle Level', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution and expand a Release to reveal Cycles ──────────
    await be.openBulkExecution();
    // The panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.expandRelease(data.releaseWithCycles);
    await expect.poll(() => be.getCycleNames(), { timeout: 20000 }).toContain(data.cycleWithRuns);
    await captureScreenshot(page, "Step 1: Release expanded, Cycles shown");

    // ─── Step 2: click a Test Cycle → grid loads ───────────────────────────────────
    await be.selectCycle(data.cycleWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 2: Cycle grid loaded");

    // ─── Step 3: mismatched versions RED, matching versions normal/BLACK ────────────
    const { red, normal } = await be.verifyVersionMismatchColorCoding(
      data.versionMismatchColor, data.versionMatchColor,
    );
    expect(red, 'expected at least one RED (mismatched) version row').toBeGreaterThan(0);
    expect(normal, 'expected at least one normal (matching) version row').toBeGreaterThan(0);
    await captureScreenshot(page, "Step 3: Cycle-level version colour coding verified");
  });

});
