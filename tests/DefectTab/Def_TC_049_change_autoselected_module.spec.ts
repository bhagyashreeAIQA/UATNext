/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Default Module
 * Test Case ID : Def_TC_049
 * Test Name    : Verify User Can Change Auto-Selected Module
 *
 * Description  : As a Test Engineer, I want to verify that users can override the auto-selected
 *                module value.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User has access to multiple projects.
 *   3. A project exists with a configured default module.
 *
 * Steps:
 *   1. Select a project with a configured default module.
 *   2. Navigate to Defect tab.
 *   3. Click New Defect.
 *   4. Verify the auto-selected module.
 *   5. Change the module manually.
 *
 * Expected:
 *   1. The default module is displayed initially.
 *   2. The user can select another module.
 *   3. The newly selected module is displayed.
 *
 * BLOCKED (test.fixme): depends on a project with a configured default module (see Def_TC_048).
 *   Enable once such a project is provisioned. The body verifies a non-empty default, then changes
 *   the Module to a different option and asserts the new value is retained.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Default Module', () => {

  test('Def_TC_049 | Verify User Can Change Auto-Selected Module', async ({ page }) => {
    const MODULE = CreateDefectPage.PLACEHOLDER.module;

    // ─── Steps 1-2: (project with default module) → Defect tab loaded ────────────────
    // TODO: select a project configured with a default module before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, 'Step 1-2: Defect tab loaded');

    // ─── Step 3: open the New Defect form ────────────────────────────────────────────
    await defectTabPage.openCreateDefectForm();
    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, 'Step 3: New Defect form open');

    // ─── Step 4 / Expected 1: a default module is shown ───────────────────────────────
    const initial = await createDefect.getDropdownValue(MODULE);
    expect(initial).not.toBe('');
    await captureScreenshot(page, 'Step 4: Default module shown');

    // ─── Step 5 / Expected 2-3: change it to a different option, which is displayed ────
    const changed = await createDefect.selectFirstAvailable(MODULE);
    expect(changed).not.toBe('');
    expect(changed).not.toBe(initial);
    await page.waitForTimeout(1000); // wait for the dropdown to update
    expect(await createDefect.getDropdownValue(MODULE)).toBe(changed);
    await captureScreenshot(page, 'Step 5: Module changed to a different option');
  });

});
