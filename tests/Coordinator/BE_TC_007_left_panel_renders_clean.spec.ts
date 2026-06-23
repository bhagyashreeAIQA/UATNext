/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_007
 * Test Name    : Verify Left Panel Renders Without UI Issues or Errors on Load
 *
 * Description  : As a Test Engineer, I want to verify that the left panel renders correctly without
 *                any UI issues or errors so that users can navigate the screen properly.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Workspace has multiple projects with multiple releases.
 *
 * Steps:
 *   1. Follow BE_TC_001 → Bulk Execution open.
 *   2. Validate the left-panel layout and controls (and assert no browser console errors).
 *
 * Expected: left panel renders with Projects dropdown, Release tree nodes and expand/collapse
 *   chevrons properly visible/aligned, and no browser console errors are logged.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_007 | Verify Left Panel Renders Without UI Issues or Errors on Load', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav exceed the 30s default

    // Collect genuine browser console errors from this point on (ignore noisy benign sources).
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: Bulk Execution open ───────────────────────────────────────────────
    await be.openBulkExecution();
    await captureScreenshot(page, "Step 1: Bulk Execution open");

    // ─── Step 2: left panel renders cleanly, controls visible, no console errors ────
    await be.verifyLeftPanelRendersCleanly();
    // Filter out failed-resource noise (network 4xx/5xx) — assert no script/runtime console errors.
    const scriptErrors = consoleErrors.filter(e => !/Failed to load resource|net::ERR_/i.test(e));
    expect(scriptErrors, `console errors:\n${scriptErrors.join('\n')}`).toEqual([]);
    await captureScreenshot(page, "Step 2: Left panel rendered without UI issues or errors");
  });

});
