/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_002
 * Test Name    : Verify Both Generate Test Log and Bulk Execution Sub-Tabs Are Displayed Under Coordinator
 *
 * Description  : Both sub-tabs are displayed under the Coordinator tab so users can access the
 *                required workflow.
 *
 * Pre-conditions:
 *   1. User is logged into the UATNext application.
 *   2. User has valid Coordinator role access (permission-gated COORDINATOR tab).
 *   3. Workspace "UATNext Dev" is selected.
 *
 * Steps:
 *   1. Click the COORDINATOR tab → tab highlighted.
 *   2. Validate sub-tabs → Generate Test Log and Bulk Execution displayed, aligned together.
 *   3. Click Bulk Execution → it becomes active; Generate Test Log becomes inactive.
 *
 * Post-condition: no data is mutated (read-only navigation).
 */

import { test } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_002 | Verify Both Generate Test Log and Bulk Execution Sub-Tabs Are Displayed', async ({ page }) => {
    test.slow(); // workspace switch + coordinator nav exceed the 30s default
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    // ─── Step 1: COORDINATOR tab highlighted ───────────────────────────────────
    await be.verifyCoordinatorTabActive();
    await captureScreenshot(page, "Step 1: COORDINATOR tab highlighted");

    // ─── Step 2: both sub-tabs displayed and rendered together ─────────────────
    await be.verifySubTabsVisible();
    // The COORDINATOR screen lands on Generate Test Log by default.
    await be.verifyGenerateTestLogActive();
    await captureScreenshot(page, "Step 2: both sub-tabs displayed and rendered together");

    // ─── Step 3: Bulk Execution active; Generate Test Log inactive ─────────────
    await be.openBulkExecution();
    await be.verifyBulkExecutionActive();
    await be.verifyGenerateTestLogInactive();
    await captureScreenshot(page, "Step 3: Bulk Execution active; Generate Test Log inactive");
  });

});
