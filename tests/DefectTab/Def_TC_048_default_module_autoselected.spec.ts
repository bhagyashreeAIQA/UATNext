/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Default Module
 * Test Case ID : Def_TC_048
 * Test Name    : Verify Default Module is Auto-Selected for Configured Project
 *
 * Description  : As a Test Engineer, I want to verify that the configured default module is
 *                automatically selected during defect creation.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User has access to multiple projects.
 *   3. A project exists with a configured default module.
 *
 * Steps:
 *   1. Select a project with a default module configuration.
 *   2. Navigate to Defect tab.
 *   3. Click New Defect.
 *   4. Observe the Module dropdown.
 *
 * Expected:
 *   1. Module dropdown is auto-populated with the configured default module value.
 *
 * BLOCKED (test.fixme): the DEFECT-tab New Defect form has no test-case context, so Module starts
 *   blank for the default project (verified live — see Def_TC_051). Auto-population of Module is a
 *   per-project qTest configuration; no project available to this account is known to define a
 *   default module for the standalone Defect-tab create flow. Enable this test (and set
 *   EXPECTED.createDefectPage.defaultModulePattern) once such a project is provisioned and select
 *   it via the sidebar before opening the Defect tab.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Default Module', () => {

  test.fixme('Def_TC_048 | Verify Default Module is Auto-Selected for Configured Project', async ({ page }) => {
    // TODO: select a project configured with a default module before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();

    // Expected: Module is auto-populated with the configured default ("MD-<id> <name>").
    expect(await createDefect.getDropdownValue(CreateDefectPage.PLACEHOLDER.module)).toMatch(/^MD-\d+\s+\S/);
  });

});
