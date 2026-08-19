/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Default Module
 * Test Case ID : Def_TC_051
 * Test Name    : Verify Module Field is Not Auto-Selected for Project Without Default Configuration
 *
 * Description  : As a Test Engineer, I want to verify that Module remains blank when no default
 *                module configuration exists.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User has access to multiple projects.
 *   3. At least one project exists without a configured default module.
 *
 * Steps:
 *   1. Navigate to Defect tab.
 *   2. Select a project without default module configuration.
 *   3. Click Create Defect.
 *   4. Observe the Module dropdown.
 *
 * Expected:
 *   1. The Module dropdown remains blank/unselected.
 *   2. No default value is displayed.
 *
 * SKIPPED 2026-08-12: "qConnect - Sample Project" (the previously-used no-default-module project)
 *   was removed from the app. Every remaining project tried since — "UATNext Dev"/"SET Dealer CRM"
 *   ("MD-6078 SET Dealer CRM"), "UATNext Dev"/"Testdata_Module" ("MD-6111 Testdata_Module"), and
 *   "Aqua Sandbox Environment" (Def_TC_048) — auto-selects a default Module. Default-module
 *   selection may now be universal rather than project-specific; flagged for the dev/QA team to
 *   confirm whether any project still has no default configured. Skipped until one is identified.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Default Module', () => {

  test.skip('Def_TC_051 | Verify Module Field is Not Auto-Selected for Project Without Default Configuration', async ({ page }) => {
    // ─── Steps 1-3: open the New Defect form (project without default module) ──
    const { defectTabPage } = await loginAndOpenDefectTab(page, "UATNext Dev");
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.selectDropdownValue('Projects', 'Testdata_Module');
    // The grid re-fetches for the new project after the switch; give it a moment to settle before
    // CREATE DEFECT is clicked, otherwise the click can land mid-reload and never open the form.
    await defectTabPage.ensureDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the New Defect form (project without default module)");

    // ─── Step 4 / Expected: Module dropdown is blank, no default value shown ───
    const moduleValue = (await createDefect.getDropdownValue(CreateDefectPage.PLACEHOLDER.module)).trim();
    expect(moduleValue).toBe('');
    await captureScreenshot(page, "Step 4 / Expected: Module dropdown is blank, no default value shown");
  });

});
