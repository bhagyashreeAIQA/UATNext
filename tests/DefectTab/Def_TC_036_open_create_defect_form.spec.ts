/**
 * Feature      : Defect
 * Sub-Feature  : Create Defect
 * Test Case ID : Def_TC_036
 * Test Name    : Verify Open Create Defect Form
 *
 * Description  : As a Test Engineer, I want to verify that clicking the Create Defect button opens
 *                the defect creation form, so that users can create new defects.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. Business Unit / project with defect data is selected (see testData note).
 *
 * Steps:
 *   1. Click on the Defect tab.
 *   2. Select a valid project.
 *   3. Click on the Create Defect button.
 *
 * Expected:
 *   1. Defect page displayed and project defects visible.
 *   2. New Defect form opens with Save/Close, Summary, every dropdown (Affected/Fixed/Target
 *      Release, Severity, Type, Module, Reason, Category, Environment, Status, Priority, Assigned
 *      To, Team, Business User, Root Cause), Description, Browse File and Linked Test Run section.
 */

import { test } from '@playwright/test';
import { loginAndOpenDefectTab } from './defectNavHelpers';
import { CreateDefectPage } from '../../pages/DefectTab/CreateDefectPage';

test.describe('Feature: Defect | Sub-Feature: Create Defect', () => {

  test('Def_TC_036 | Verify Open Create Defect Form', async ({ page }) => {
    // ─── Steps 1-2: Defect tab open, project defects loaded ───────────────────
    const { defectTabPage } = await loginAndOpenDefectTab(page);
    await defectTabPage.verifyDefectPageDisplayed();
    await defectTabPage.verifyProjectSelected();
    await defectTabPage.verifyDefectsLoaded();

    // ─── Step 3: Click Create Defect ──────────────────────────────────────────
    // Expected: New Defect form opens with all documented fields.
    await defectTabPage.openCreateDefectForm();

    const createDefect = new CreateDefectPage(page);
    await createDefect.waitForCreateFormOpen();
    await createDefect.verifyAllFieldsPresent();
  });

});
