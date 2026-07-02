/**
 * Feature      : Defect
 * Sub-Feature  : Defect Tab UI
 * Test Case ID : Def_TC_001
 * Test Name    : Verify Defect Tab UI for Left Panel
 *
 * Description  : As a Test Engineer, I want to verify that the Defect tab displays all
 *                required UI components in the left panel as per SRS, so that users can
 *                filter defects properly.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a Project.
 *   3. Verify the Left Panel components.
 */

import { test } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Defect Tab UI', () => {

  test('Def_TC_001 | Verify Defect Tab UI for Left Panel', async ({ page }) => {
    // ─── Step 1: Click on the Defect tab ──────────────────────────────────────
    // Expected: Defect page should be displayed
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectPageDisplayed();
    await captureScreenshot(page, "Step 1: Click on the Defect tab");

    // ─── Step 2: Select a Project ─────────────────────────────────────────────
    // Expected: Project-related data should be visible
    await defectTabPage.verifyProjectSelected();
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, "Step 2: Select a Project");

    // ─── Step 3: Verify the Left Panel components ─────────────────────────────
    // Expected: Search, Clear, Projects, Summary/Defect ID, Affected Release, Status,
    //           Team, Severity, Priority, Assigned To, Business User, Created By,
    //           Submitted After and Submitted Before controls should all be present.
    await defectTabPage.verifyLeftPanelControls();
    await captureScreenshot(page, "Step 3: Verify the Left Panel components");
  });

});
