/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_023
 * Test Name    : Verify Version Mismatch Colour Coding at Test Suite Level
 *
 * Description  : As a Test Engineer, I want to verify that the version mismatch colour coding works
 *                correctly at the Test Suite level.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *   6. The selected suite contains runs with both matched and mismatched versions.
 *
 * Steps:
 *   1. Follow BE_TC_021 → expand Release → Cycle → sub-cycle, click a Test Suite with mismatches.
 *   2. Check the Test Case Version column across rows.
 *
 * Expected: mismatched versions render RED; matching versions render normal/BLACK.
 *
 * BUILD NOTE: RED is rgb(255, 65, 54); a matching version uses the normal text token rgb(71, 84, 103)
 *   (the build's dark-slate stand-in for "black"). The "Sales Ops" suite carries both states.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_023 | Verify Version Mismatch Colour Coding at Test Suite Level', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + deep tree expansion + grid load
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution, expand to the Test Suite and click it ─────────
    await be.openBulkExecution();
    // Panel defaults to another project ("SET Dealer CRM"); select Testdata_Module first.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    await be.expandRelease(data.releaseWithCycles);
    await be.expandCycle(data.cycleWithRuns);
    await be.expandCycle(data.subCycleWithSuite);
    await be.selectSuite(data.suiteWithRuns);
    await be.verifySuiteActive(data.suiteWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 1: Test Suite grid loaded");

    // ─── Step 2: mismatched versions RED, matching versions normal/BLACK ────────────
    const { red, normal } = await be.verifyVersionMismatchColorCoding(
      data.versionMismatchColor, data.versionMatchColor,
    );
    expect(red, 'expected at least one RED (mismatched) version row').toBeGreaterThan(0);
    expect(normal, 'expected at least one normal (matching) version row').toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2: Suite-level version colour coding verified");
  });

});
