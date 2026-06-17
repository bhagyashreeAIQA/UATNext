/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Team configuration
 * Test Case ID : Def_TC_043
 * Test Name    : Verify Team Field is Mandatory for Specific Business Unit
 *
 * Description  : As a Test Engineer, I want to verify that Team is marked mandatory for configured
 *                Business Units.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User has access to multiple Business Units.
 *   3. At least one Business Unit has Team configured as mandatory.
 *
 * Steps:
 *   1. Select a Business Unit where Team is mandatory.
 *   2. Navigate to Defect tab.
 *   3. Click New Defect.
 *   4. Observe the Team field.
 *
 * Expected:
 *   1. Team field shows a mandatory indicator (*).
 *   2. Team is required before saving.
 *
 * BLOCKED (test.fixme): the precondition needs a Business Unit configured with Team as mandatory.
 *   On the default BU the New Defect form marks ONLY Affected Release/Build with "*", and no BU
 *   available to this account is known to flip Team to mandatory (Team config is a server-side
 *   per-BU setting not derivable from the UI). Enable this test once such a BU is provisioned and
 *   wire BU selection through the sidebar before opening the Defect tab.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Team configuration', () => {

  test.fixme('Def_TC_043 | Verify Team Field is Mandatory for Specific Business Unit', async ({ page }) => {
    // TODO: select a Business Unit where Team is configured mandatory before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();

    // Expected: the Team label carries the mandatory "*" marker.
    expect(await createDefect.isFieldMandatory('Team')).toBe(true);
  });

});
