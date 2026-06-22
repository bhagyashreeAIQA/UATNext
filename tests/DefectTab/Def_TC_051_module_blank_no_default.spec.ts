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
 * BUILD NOTE: the default project used by this suite has no default-module configuration for the
 *   standalone Defect-tab create flow, so it satisfies the precondition. Verified live: Module
 *   starts blank on the New Defect form here (the counterpart auto-population case is Def_TC_048).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Default Module', () => {

  test('Def_TC_051 | Verify Module Field is Not Auto-Selected for Project Without Default Configuration', async ({ page }) => {
    // ─── Steps 1-3: open the New Defect form (project without default module) ──
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the New Defect form (project without default module)");

    // ─── Step 4 / Expected: Module dropdown is blank, no default value shown ───
    expect(await createDefect.getDropdownValue(CreateDefectPage.PLACEHOLDER.module)).toBe('');
    await captureScreenshot(page, "Step 4 / Expected: Module dropdown is blank, no default value shown");
  });

});
