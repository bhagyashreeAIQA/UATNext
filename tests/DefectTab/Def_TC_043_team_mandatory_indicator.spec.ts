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
import { EXPECTED } from '../../utils/testData';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Team configuration', () => {

  test('Def_TC_043 | Verify Team Field is Mandatory for Specific Business Unit', async ({ page }) => {
    // ─── Steps 1-2: (BU with mandatory Team) → Defect tab loaded ─────────────────────
    // The shared helper switches to the UATNext Dev workspace (where Team is configured mandatory)
    // before opening the Defect tab.
    const { defectTabPage } = await loginAndOpenDefectTab(page, EXPECTED.defect.workspace);
    
    await defectTabPage.verifyDefectsLoaded();
    await captureScreenshot(page, 'Step 1-2: Defect tab loaded');

    // ─── Step 3: open the New Defect form ────────────────────────────────────────────
    await defectTabPage.openCreateDefectForm();
    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, 'Step 3: New Defect form open');

    // ─── Step 4 / Expected: the Team label carries the mandatory "*" marker ───────────
    expect(await createDefect.isFieldMandatory('Team')).toBe(true);
    await captureScreenshot(page, 'Step 4: Team field shows mandatory indicator');
  });

});
