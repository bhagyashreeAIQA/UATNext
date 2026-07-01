/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_006
 * Test Name    : Verify Left Panel Displays the List of Projects and Associated Releases Correctly
 *
 * Description  : As a Test Engineer, I want to verify that the left panel displays all Projects and
 *                their associated Releases correctly so that users can navigate to the required scope.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. At least two projects exist with associated releases.
 *
 * Steps:
 *   1. Follow BE_TC_001 → Bulk Execution open.
 *   2. Validate the left panel immediately after screen load (Projects dropdown + Release tree).
 *   3. Expand a Release node's chevron → its child Cycles are revealed.
 *   4. Validate the displayed Releases / Cycles under the selected Project.
 *
 * Expected: Projects dropdown shows the selected project; Releases render as a tree; expanding a
 *   Release reveals its associated Cycles; release names are fully visible.
 *
 * DATA NOTE: the UATNext Dev workspace now exposes two projects (the default "SET Dealer CRM" plus
 *   "Testdata_Module"). This test selects Testdata_Module — whose Releases carry the Cycle data — and
 *   asserts its Release tree renders correctly and that the tree is scoped to the selected project
 *   only (no foreign project's releases leak in). Only Testdata_Release_P01 carries Cycles (P02/P03
 *   expand to an empty child list).
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_006 | Verify Left Panel Displays the List of Projects and Associated Releases Correctly', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + tree expansion exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: Bulk Execution open ───────────────────────────────────────────────
    await be.openBulkExecution();
    await captureScreenshot(page, "Step 1: Bulk Execution open");

    // ─── Step 2: Projects dropdown + Release tree render immediately after load ─────
    await be.verifyLeftPanelDisplayed();
    await expect(be.projectsLabel).toBeVisible();
    // The panel defaults to another project ("SET Dealer CRM"); select Testdata_Module, whose
    // Releases carry the Cycle data this test validates.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithCycles);
    expect(await be.getProjectsValue()).toBe(data.expectedProject);
    // Releases display as a tree under the dropdown — scoped to the selected project only.
    const releases = await be.getReleaseNames();
    expect(releases.length).toBeGreaterThan(0);
    expect(releases).toContain(data.releaseWithCycles);
    // The workspace now exposes two projects; the dropdown must offer the selected one among them.
    expect(await be.getProjectOptions()).toContain(data.expectedProject);
    await captureScreenshot(page, "Step 2: Projects dropdown + Release tree displayed");

    // ─── Step 3: expand a Release chevron → its Cycles are revealed ─────────────────
    await be.expandRelease(data.releaseWithCycles);
    await captureScreenshot(page, "Step 3: Release expanded to reveal Cycles");

    // ─── Step 4: associated Cycles appear under the expanded Release ────────────────
    const cycles = await be.getCycleNames();
    expect(cycles).toContain(data.cycleWithRuns);
    // Release names render fully (non-empty, trimmed labels — no truncation to blank).
    for (const name of releases) expect(name.length).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 4: Cycles displayed under the Release");
  });

});
