/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_021
 * Test Name    : Verify Requirement Details Display on Selection
 *
 * Description  : As a Test Engineer, I want to validate that selecting a Requirement shows its details
 *                and linked Test Cases correctly.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-17): EPIC_A → Feature_A → requirement list → click a requirement → details (ID, Title,
 *   Description, Linked System = Azure Boards, ADO Id, Feature) → ADD TEST CASE button → Linked Test
 *   Cases section with its columns + data + pagination.
 *
 * Live note (2026-06-30): the Linked Test Cases grid shows MORE columns than the documented spec —
 *   Test Case ID, Name, Description, Type, Status, Assigned To, Business User, Action (the spec omits
 *   Description and Status), so this asserts the full live column set.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Details', () => {

  test('AT_TC_021 | Verify Requirement Details Display on Selection', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-4: EPIC_A + Feature_A → requirement list ───────────────────────────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);
    await captureScreenshot(page, 'Step 2-4: EPIC_A + Feature_A requirements');

    // ─── Step 5-7: click a requirement (with linked TCs) → details match it ────────────
    const req = await authorPage.selectRequirementWithLinkedTestCases();
    const reqId = req.id;
    await expect(authorPage.rightPanelFirst).toContainText(req.id);    // Step 6: Requirement ID
    await expect(authorPage.rightPanelFirst).toContainText(req.name);  // Step 7: Requirement Title
    await captureScreenshot(page, 'Step 5-7: Requirement detail opened');

    // ─── Step 8-12: Description / Linked System (Azure Boards) / ADO Id / Feature ───────
    await authorPage.verifyRequirementDetails(reqId);
    await captureScreenshot(page, 'Step 8-12: Requirement detail fields');

    // ─── Step 13: ADD TEST CASE button visible + enabled ───────────────────────────────
    await authorPage.verifyAddTestCaseEnabled();
    await captureScreenshot(page, 'Step 13: ADD TEST CASE button');

    // ─── Step 14-16: Linked Test Cases section with columns + data ─────────────────────
    await authorPage.verifyLinkedTestCasesPresent(data.linkedTcColumns);
    const tcIds = await authorPage.getLinkedTcIds();
    for (const id of tcIds) expect(id, 'linked test case id').toMatch(/^TC-\d+$/);
    await captureScreenshot(page, 'Step 14-16: Linked Test Cases');

    // ─── Step 17: pagination controls displayed for the linked test cases ──────────────
    await authorPage.verifyLinkedTcPaginationDisplayed();
    await captureScreenshot(page, 'Step 17: Linked Test Cases pagination');
  });

});
