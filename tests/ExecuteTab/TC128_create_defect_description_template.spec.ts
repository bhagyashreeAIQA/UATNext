/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Test Run Execution Details – Create Defect
 * Test Case ID : TC-128
 * Test Case Name: Verify Default Template is Populated in Description Field
 *
 * Description  : As a Test Engineer, I want to verify that the Description field is pre-populated
 *                with the default defect template.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : Follows TC-098 (open a run → LINK DEFECT → NEW → Create Defect form).
 *
 * Steps:
 *   1. Follow TC-098.
 *   2. Verify the Description field content.
 *
 * Expected:
 *   1. Create Defect page/panel opens.
 *   2. Description field is populated with the predefined defect template.
 *   3. Template contains all required sections (Business Impact, Steps to Reproduce, Expected
 *      Result, Actual Result, etc.).
 *
 * Note: Description is the defect textarea (not Summary); the template also carries Test Suite,
 *       Test Case Name, Role Used, User Name, Test Case Number and Requirement Details. No defect
 *       is created — the form is discarded.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
  reachTestSuiteGrid,
} from './executeNavHelpers';
import { TestRunExecutionPage } from '../../pages/ExecuteTab/TestRunExecutionPage';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

const RUN_ROW_INDEX = 0;

test.describe('Feature: Execute Test Case | Sub-Feature: Test Run Execution Details – Create Defect', () => {

  test('TC-128 | Verify Default Template is Populated in Description Field', async ({ page }) => {
    test.setTimeout(300000);

    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await reachTestSuiteGrid(executeTabPage, { viewAll: true });
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.clickRunButton(RUN_ROW_INDEX);

    const executionPage = new TestRunExecutionPage(page);
    await executionPage.verifyDetailsPageOpen();
    await executionPage.openCreateDefectForm();          // Expected 1: form opens

    // ─── Expected 2-3: Description is pre-populated with the template + sections ──
    const description = await executionPage.getDefectDescriptionValue();
    expect(description.length, 'Description should be pre-populated').toBeGreaterThan(0);
    for (const section of EXPECTED.createDefect.descriptionTemplateSections) {
      expect(description, `template should contain "${section}"`).toContain(section);
    }

    await executionPage.closeCreateDefectForm();         // discard — no defect created
    await captureScreenshot(page, "Expected 2-3: Description is pre-populated with the template + sections");
  });

});
