/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_012
 * Test Name    : Verify Test Case Version Mismatch is Highlighted RED and Matching Version is BLACK at Release Level
 *
 * Description  : As a Test Engineer, I want to verify that version mismatch colour coding works
 *                correctly at the Release level so that coordinators can easily identify runs needing
 *                version updates.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *   6. At least one Test Run exists whose Test Case Version differs from the latest approved version.
 *
 * Steps:
 *   1. Follow BE_TC_011 → click a Release whose runs include version mismatches.
 *   2. Identify rows where the Test Case Version differs from the latest approved version.
 *   3. Identify rows where the Test Case Version matches.
 *
 * Expected: mismatched-version rows render the Version in RED; matching rows render it in the normal
 *   (non-red) text colour.
 *
 * BUILD NOTE: RED is rgb(255, 65, 54); a matching version uses the normal text token rgb(71, 84, 103)
 *   (the build's stand-in for "black", a dark slate — not pure black). Verified live 2026-06-22 on
 *   Testdata_Release_P03, which carries both mismatched and matching rows.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_012 | Verify Test Case Version Mismatch is Highlighted RED and Matching Version is BLACK at Release Level', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + grid load exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: open Bulk Execution and click the Release → grid loads ─────────────
    await be.openBulkExecution();
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    await captureScreenshot(page, "Step 1: Release grid loaded");

    // ─── Step 2-3: mismatched versions are RED, matching versions are normal/BLACK ──
    const { red, normal } = await be.verifyVersionMismatchColorCoding(
      data.versionMismatchColor, data.versionMatchColor,
    );
    // This Release is seeded with both states — assert each is actually present.
    expect(red, 'expected at least one RED (mismatched) version row').toBeGreaterThan(0);
    expect(normal, 'expected at least one normal (matching) version row').toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2-3: Version mismatch colour coding verified");
  });

});
