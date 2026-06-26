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
 * DATA NOTE (re-verified live 2026-06-24): the UATNext Dev workspace now exposes TWO Bulk Execution
 *   projects — "SET Dealer CRM" (the new default; releases drill Release → Cycle to a grid of 77
 *   entries) and "Testdata_Module" (releases Testdata_Release_P01..P03; a Release click loads its grid
 *   directly, P03 = 21 entries). The two projects load a grid by different paths, so a small
 *   per-project helper loads each. (Previously the workspace had a single project and this test
 *   skipped at runtime.)
 *
 * BEHAVIOUR NOTE: switching the Project settles the left-panel Release tree to the new project's
 *   releases, but the right-panel grid keeps the previous project's rows until a Release/Cycle is
 *   selected in the new project — so Step 5 selects a release in the new project to force the refresh,
 *   then asserts the run set differs from the previous project's.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { BulkExecutionPage } from '../../pages/Coordinator/BulkExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_008 | Verify Selecting a Different Project Clears Old Releases, Populates New Releases, and Refreshes the Grid', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + two grid loads exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // Loads a grid for `project` by its release tree's shape and returns the visible run IDs.
    // - Testdata_Module: a Release node loads its grid directly (use the first release shown).
    // - SET Dealer CRM : the release drills Release → Cycle before a grid appears.
    // When `prevIds` is given the previous project's rows are still on screen (the grid is not cleared
    // on project switch), so wait for the run set to actually change before reading — otherwise the
    // stale rows read back (the grid's documented "rows visible but stale" race).
    const loadGrid = async (project: string, releases: string[], prevIds?: string[]): Promise<string[]> => {
      if (project === 'Testdata_Module') {
        await be.selectRelease(releases[0]);
      } else {
        await be.expandRelease(releases[0]);
        await be.selectCycle(releases[0]);
      }
      if (prevIds) await be.waitForRunIdsChangedFrom(prevIds);
      await be.verifyTestRunGridLoaded();
      return be.getTestRunIds();
    };

    // ─── Step 1: Bulk Execution open with a project selected (BE_TC_006) ────────────
    await be.openBulkExecution();
    await be.verifyLeftPanelDisplayed();
    await captureScreenshot(page, "Step 1: Bulk Execution open with a project selected ");

    // ─── Step 2: note current Project, Releases and grid data ──────────────────────
    const firstProject = await be.getProjectsValue();
    const releasesBefore = await be.getReleaseNames();
    expect(releasesBefore.length).toBeGreaterThan(0);
    const runIdsBefore = await loadGrid(firstProject, releasesBefore);
    expect(runIdsBefore.length).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2: Current project, releases and grid noted");

    const projects = await be.getProjectOptions();
    test.skip(projects.length < 2, 'UATNext Dev exposes a single project — no different project to switch to.');

    // ─── Step 3: select a different Project ─────────────────────────────────────────
    const otherProject = projects.find(p => p !== firstProject)!;
    await be.selectProject(otherProject);
    expect(await be.getProjectsValue()).toBe(otherProject); // dropdown closed + new name shown
    await captureScreenshot(page, "Step 3: Different project selected");

    // ─── Step 4: old Releases cleared, new Releases populated ───────────────────────
    await expect.poll(() => be.getReleaseNames(), { timeout: 20000 }).not.toEqual(releasesBefore);
    const releasesAfter = await be.getReleaseNames();
    expect(releasesAfter.length).toBeGreaterThan(0);
    for (const old of releasesBefore) expect(releasesAfter).not.toContain(old); // no stale releases
    await captureScreenshot(page, "Step 4: Releases replaced for the new project");

    // ─── Step 5: Test Run grid refreshes (no stale data from the previous project) ──
    const runIdsAfter = await loadGrid(otherProject, releasesAfter, runIdsBefore);
    expect(runIdsAfter.length).toBeGreaterThan(0);
    expect(runIdsAfter).not.toEqual(runIdsBefore);
    await captureScreenshot(page, "Step 5: Grid refreshed for the new project");
  });

});
