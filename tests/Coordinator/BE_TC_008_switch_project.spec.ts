/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_008
 * Test Name    : Verify Selecting a Different Project Clears Old Releases, Populates New Releases, and Refreshes the Grid
 *
 * Description  : As a Test Engineer, I want to verify that changing the selected Project refreshes the
 *                associated Releases and Test Run grid correctly so that users can work within the
 *                selected Project scope.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access.
 *   3. Workspace "UATNext Dev" is selected in the header dropdown.
 *   4. Bulk Execution sub-tab is open successfully.
 *   5. A Project is selected and at least one Release with Test Runs exists.
 *
 * Steps:
 *   1. Follow BE_TC_006 to open Bulk Execution with a project selected.
 *   2. Note the current Project, displayed Releases and Test Run grid data.
 *   3. Open the Projects dropdown and select a different Project.
 *   4. Validate the left panel after changing the Project (old Releases cleared, new ones shown).
 *   5. Validate the Test Run grid refreshes for the new Project (no stale data).
 *
 * DATA NOTE: the UATNext Dev workspace exposes a SINGLE project (Testdata_Module), so there is no
 *   "different Project" to switch to — this test SKIPS at runtime when fewer than two projects exist.
 *   It is kept so the scenario auto-activates if the workspace later gains a second project.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_008 | Verify Selecting a Different Project Clears Old Releases, Populates New Releases, and Refreshes the Grid', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + two grid loads exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: Bulk Execution open with a project selected (BE_TC_006) ────────────
    await be.openBulkExecution();
    await be.verifyLeftPanelDisplayed();
    await captureScreenshot(page, "Step 1: Bulk Execution open with a project selected ");

    // ─── Step 2: note current Project, Releases and grid data ──────────────────────
    const firstProject = await be.getProjectsValue();
    const releasesBefore = await be.getReleaseNames();
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    const runIdsBefore = await be.getTestRunIds();
    await captureScreenshot(page, "Step 2: Current project, releases and grid noted");

    const projects = await be.getProjectOptions();
    test.skip(projects.length < 2, 'UATNext Dev exposes a single project — no different project to switch to.');

    // ─── Step 3: select a different Project ─────────────────────────────────────────
    const otherProject = projects.find(p => p !== firstProject)!;
    await be.selectProject(otherProject);
    expect(await be.getProjectsValue()).toBe(otherProject); // dropdown closed + new name shown
    await captureScreenshot(page, "Step 3: Different project selected");

    // ─── Step 4: old Releases cleared, new Releases populated ───────────────────────
    await expect.poll(() => be.getReleaseNames()).not.toEqual(releasesBefore);
    const releasesAfter = await be.getReleaseNames();
    expect(releasesAfter.length).toBeGreaterThan(0);
    for (const old of releasesBefore) expect(releasesAfter).not.toContain(old); // no stale releases
    await captureScreenshot(page, "Step 4: Releases replaced for the new project");

    // ─── Step 5: Test Run grid refreshes (no stale data from the previous project) ──
    await be.selectRelease(releasesAfter[0]);
    await be.verifyTestRunGridLoaded();
    const runIdsAfter = await be.getTestRunIds();
    expect(runIdsAfter).not.toEqual(runIdsBefore);
    await captureScreenshot(page, "Step 5: Grid refreshed for the new project");
  });

});
