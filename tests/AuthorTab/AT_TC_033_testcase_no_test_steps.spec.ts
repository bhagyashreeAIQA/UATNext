/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_033
 * Test Name    : Verify Test Case Detail View When No Test Steps Are Available
 *
 * Description  : As a Test Engineer, I want to validate that a test case with no test steps shows its
 *                details correctly and handles the empty Test Steps section without UI issues.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-10): Author tab → select a requirement (with linked test cases) → open a test case that has
 *   no test steps → details shown → "+" add-step icon → Test Steps section blank, no UI issues.
 *
 * Data note (2026-06-30): a test case with zero test steps is data-dependent; the test scans the
 *   requirement's linked test cases for one and skips if none is reachable.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Detail View – Empty Test Steps', () => {

  test('AT_TC_033 | Verify Test Case Detail View When No Test Steps Are Available', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-2: select a requirement with linked test cases ─────────────────────────
    const req = await authorPage.selectRequirementWithLinkedTestCases();
    const tcCount = await authorPage.getLinkedTcCount();

    // ─── Find a test case with no test steps (scan the requirement's linked test cases) ─
    let openedTcId = '';
    for (let i = 0; i < tcCount; i++) {
      const tcId = await authorPage.openTestCaseDetail(i);
      if ((await authorPage.getTestStepCount()) === 0) { openedTcId = tcId; break; }
      await authorPage.tcDetailBackToList();
    }
    test.skip(openedTcId === '', 'No linked test case without test steps is available.');

    // ─── Step 4-8: details shown + "+" add-step icon ───────────────────────────────────
    await authorPage.verifyTestCaseDetails(openedTcId, req.id);
    await captureScreenshot(page, 'Step 4-8: Test Case detail (no steps)');

    // ─── Step 9-10: Test Steps section blank (no steps), no UI issues ──────────────────
    expect(await authorPage.getTestStepCount(), 'no test steps listed').toBe(0);
    await captureScreenshot(page, 'Step 9-10: Empty Test Steps section');
  });

});
