/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_005
 * Test Name    : Verify Left Panel Can Be Collapsed and Expanded Without Layout Breakage
 *
 * Description  : As a Test Engineer, I want to verify that the left panel can be collapsed and
 *                expanded successfully so that additional space can be provided to the Test Run grid
 *                when required.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *
 * Steps:
 *   1. Follow BE_TC_001 → Bulk Execution open, left panel visible, Test Run grid loaded.
 *   2. Click the collapse control → left panel collapses; grid expands to fill the width.
 *   3. Click the collapse/expand control again → left panel restored; grid + data intact.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_005 | Verify Left Panel Can Be Collapsed and Expanded Without Layout Breakage', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + grid load exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: Bulk Execution open, left panel visible, grid loaded ──────────────
    await be.openBulkExecution();
    await be.verifyLeftPanelDisplayed();
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    expect(await be.isSidebarCollapsed()).toBe(false);
    const expandedPanelWidth = await be.getPanelWidth();
    const gridWidthExpanded  = await be.getGridWidth();
    const rowsBefore         = await be.getDataRowCount();
    await captureScreenshot(page, "Step 1: Left panel visible with grid loaded");

    // ─── Step 2: collapse → panel collapses, grid expands to fill width ────────────
    await be.collapseSidebar();
    expect(await be.getPanelWidth()).toBeLessThan(expandedPanelWidth);
    expect(await be.getGridWidth()).toBeGreaterThan(gridWidthExpanded); // grid reflows wider
    await be.verifyTestRunGridLoaded(); // no layout breakage — rows still render
    await captureScreenshot(page, "Step 2: Left panel collapsed, grid expanded");

    // ─── Step 3: expand → panel restored to original width, data intact ────────────
    await be.expandSidebar();
    await be.verifyLeftPanelDisplayed();
    expect(await be.getPanelWidth()).toBe(expandedPanelWidth);
    // Previously visible data remains intact (same project + same data row count).
    expect(await be.getProjectsValue()).toBe(data.expectedProject);
    expect(await be.getDataRowCount()).toBe(rowsBefore);
    await captureScreenshot(page, "Step 3: Left panel restored, data intact");
  });

});
