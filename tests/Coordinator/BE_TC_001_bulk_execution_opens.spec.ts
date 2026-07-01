/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_001
 * Test Name    : Verify Coordinator Tab and Bulk Execution Screen Opens Correctly for Authorized User
 *
 * Description  : An authorized user can open the Bulk Execution screen and see the Test Run grid
 *                after selecting a Release, so bulk log creation can be managed.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access (permission-gated COORDINATOR tab).
 *   3. Workspace "UATNext Dev" is selected.
 *
 * Steps:
 *   1. Click the COORDINATOR tab → tab highlighted (teal underline); sub-tabs visible.
 *   2. Click the Bulk Execution sub-tab → active; left panel = Projects + Release tree; right empty.
 *   3. Validate a Project is pre-selected and Releases are displayed.
 *   4. Click a Release node → Test Run grid loads; CREATE LOG visible and disabled.
 *
 * Post-condition: no data is mutated (read-only navigation).
 *
 * NOTE: Bulk Execution is exercised on UATNext Dev (per precondition) — its releases carry test runs.
 *   The loading indicator in Step 4 is transient; the grid-loaded + CREATE LOG assertions cover the
 *   observable outcome.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_001 | Verify Coordinator Tab and Bulk Execution Screen Opens Correctly', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav + grid load exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: COORDINATOR tab highlighted; sub-tabs visible ─────────────────
    await be.verifyCoordinatorTabActive();
    await be.verifySubTabsVisible();
    await captureScreenshot(page, "Step 1: COORDINATOR tab highlighted; sub-tabs visible");

    // ─── Step 2: open Bulk Execution → active; left panel shown; right empty ───
    await be.openBulkExecution();
    await be.verifyBulkExecutionActive();
    await be.verifyLeftPanelDisplayed();
    // The panel defaults to another project ("SET Dealer CRM"); select the Testdata_Module project
    // whose releases carry the test-run data this test needs.
    await be.ensureProjectSelected(data.expectedProject, data.releaseWithRuns);
    await be.verifyRightPanelEmpty();
    await captureScreenshot(page, "Step 2: open Bulk Execution → active; left panel shown; right empty");

    // ─── Step 3: Project selected; Releases displayed ──────────────────────────
    await be.verifyProjectSelected();
    expect(await be.getProjectsValue()).toBe(data.expectedProject);
    await be.verifyReleasesVisible();
    expect(await be.getReleaseNames()).toContain(data.releaseWithRuns);
    await captureScreenshot(page, "Step 3: Project pre-selected; Releases displayed");

    // ─── Step 4: click a Release → grid loads; CREATE LOG visible and disabled ──
    await be.selectRelease(data.releaseWithRuns);
    await be.verifyTestRunGridLoaded();
    await be.verifyCreateLogVisibleAndDisabled();
    await captureScreenshot(page, "Step 4: click a Release → grid loads; CREATE LOG visible and disabled");
  });

});
