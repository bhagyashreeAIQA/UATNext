/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect – Team configuration
 * Test Case ID : Def_TC_047
 * Test Name    : Verify Defect Save Without Team for Non-Mandatory Business Unit
 *
 * Description  : As a Test Engineer, I want to verify that defects can be saved without selecting
 *                Team when Team is optional.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User has access to multiple Business Units.
 *   3. Team is optional for the selected Business Unit.
 *
 * Steps:
 *   1. Select a Business Unit where Team is optional.
 *   2. Navigate to Defect tab.
 *   3. Click New Defect.
 *   4. Enter valid values in all fields except Team.
 *   5. Click Save.
 *
 * Expected:
 *   1. Defect is saved successfully.
 *   2. The new defect appears in the defect list.
 *
 * 2026-08-12: "qConnect - Sample Project" (the previously-used Team-optional BU) was removed from
 *   the app. Confirmed with the dev team that Team is now mandatory on every available Business
 *   Unit ("UATNext Dev" and "Aqua Sandbox Environment" both verified live), so the Team-optional
 *   precondition this test depends on no longer holds anywhere — it self-skips via the live
 *   isFieldMandatory('Team') check below rather than a hardcoded skip, so it starts running again
 *   automatically if a Team-optional BU is reintroduced.
 * MUTATING: creates a REAL qTest defect (timestamped Summary; run sparingly).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Defect | Sub-Feature: Create Defect – Team configuration', () => {

  test('Def_TC_047 | Verify Defect Save Without Team for Non-Mandatory Business Unit', async ({ page }) => {
    test.setTimeout(480000);
    const summary = `Automated defect Def_TC_047 ${Date.now()}`;

    // ─── Steps 1-3: open the New Defect form ──────────────────────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page, "Aqua Sandbox Environment");
    await defectTabPage.verifyDefectsLoaded();
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await captureScreenshot(page, "Steps 1-3: open the New Defect form");

    // Team is mandatory on every currently available BU (see file header), so a defect cannot be
    // saved without one — skip rather than create a doomed (and data-mutating) save attempt when
    // the Team-optional precondition is not met.
    test.skip(await createDefect.isFieldMandatory('Team'), 'Team is mandatory on this BU — the Team-optional precondition is not met.');

    // ─── Step 4: enter valid values in all fields EXCEPT Team ──────────────────
    await createDefect.fillRequiredForSave({ summary, skip: ['team'] });
    expect(await createDefect.getDropdownValue(CreateDefectPage.PLACEHOLDER.team)).toBe('');
    await captureScreenshot(page, "Step 4: enter valid values in all fields EXCEPT Team");

    // ─── Step 5: Save → success even without a Team (Team optional) ────────────
    await createDefect.clickCreateSave();
    
    //await page.getByText('Error: Please select a valid').toBeVisible({ timeout: 20000 });
    await expect(createDefect.toast(EXPECTED.createDefectPage.createdSuccessMessage)).toBeVisible({ timeout: 20000 });
    //EXPECTED.createDefectPage.createdSuccessMessage = new RegExp(`Defect ${summary} created successfully`, 'i');
    await defectTabPage.waitForResults();
    const newId = await defectTabPage.searchAndGetDefectIdBySummary(summary);
    await defectTabPage.verifyDefectVisible(newId);
    await captureScreenshot(page, "Step 5: Save → success even without a Team (Team optional)");
  });

});
