/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_032
 * Test Name    : Verify Test Steps Are Displayed for Selected Test Case
 *
 * Description  : As a Test Engineer, I want to validate that a selected test case's test steps are
 *                displayed in a table with the expected columns.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-8): Author tab → select a requirement (with linked test cases) → linked test cases list →
 *   click a Test Case ID → Test Steps section → table with columns Step / Step Description / UAT
 *   Category / Action / Expected Result → steps listed.
 *
 * KNOWN FLAKY (2026-08-04, stg): the "Step Description" column check has failed even at a 15s
 *   timeout, yet Playwright's auto-captured failure screenshot shows the column plainly rendered at
 *   that same moment — ruling out "just needs more time". Suspect: the linked test case used here
 *   (TC-26373, seeded/mutated repeatedly by other tests today — its step count shifted 5→6 between
 *   runs) may re-render/flicker the table under shared-backend load, and the poll instant happens to
 *   land mid-flicker. Needs the interactive trace (`npx playwright show-trace`) to confirm — not
 *   diagnosed further yet.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Case Detail View – Test Steps', () => {

  test('AT_TC_032 | Verify Test Steps Are Displayed for Selected Test Case', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);

    // ─── Step 1-4: select a requirement → find a test case that HAS test steps ─────────
    await authorPage.selectRequirementWithLinkedTestCases();
    const tcCount = await authorPage.getLinkedTcCount();
    let opened = '';
    for (let i = 0; i < tcCount; i++) {
      const tcId = await authorPage.openTestCaseDetail(i);
      if ((await authorPage.getTestStepCount()) > 0) { opened = tcId; break; }
      await authorPage.tcDetailBackToList();
    }
    //test.skip(opened === '', 'No linked test case with test steps is available.');
    expect(opened).toMatch(/^TC-\d+$/);
    await captureScreenshot(page, 'Step 1-4: Test Case (with steps) opened');

    // ─── Step 5-7: Test Steps section + column headers ─────────────────────────────────
    await expect(page.getByText(/Test Steps/i).first()).toBeVisible();
    for (const col of ['Step', 'Step Description', 'UAT Category', 'Action', 'Expected Result']) {
      // "Step Description" is a mandatory field and renders with a trailing " *" marker, so an
      // exact match on the bare label never matches — allow an optional "*" suffix for every column.
      const locator = page.getByText(new RegExp(`^${col}\\s*\\*?$`)).first();
      await expect(locator, `column "${col}"`).toBeVisible({ timeout: 15000 });
    }
    await captureScreenshot(page, 'Step 5-7: Test Steps columns');

    // ─── Step 8: test steps are listed ─────────────────────────────────────────────────
    expect(await authorPage.getTestStepCount(), 'test steps listed').toBeGreaterThan(0);
    await captureScreenshot(page, 'Step 8: Test steps listed');
  });

});
