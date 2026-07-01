/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_009
 * Test Name    : Verify Team Selection with EPIC and Feature When No Mapped Requirements Exist
 *
 * Description  : As a Test Engineer, I want to validate that selecting a Team with no mapped
 *                requirements under an EPIC and Feature shows the appropriate empty state.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open Author tab → Team disabled before Epic/Feature → select Epic → select Feature →
 *   select TEAM_EMPTY → requirement list empty → "There is no data".
 *
 * Real data + DEVIATION (Testdata_Module, verified live 2026-06-29): the Team dropdown is ENABLED
 *   before an Epic is selected but offers no teams (only "Please Select") until an Epic is chosen, so
 *   step 2 asserts that "not-usable-yet" state. EPIC = Sub_Testdata_Module_P1 → Feature
 *   Sub_Testdata_Module_P01 → Team "Main Team" (TEAM_EMPTY) maps to 0 requirements → empty state.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Team Filter Empty State', () => {

  test('AT_TC_009 | Verify Team Selection with EPIC and Feature When No Mapped Requirements Exist', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page + project Testdata_Module ───────────────────────
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2: Team dropdown offers no teams before an Epic is selected ───────────────
    await authorPage.verifyNoTeamOptionsYet();
    await captureScreenshot(page, 'Step 2: Team not usable before Epic');

    // ─── Step 3-4: select Epic + Feature ───────────────────────────────────────────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);
    await captureScreenshot(page, 'Step 3-4: Epic + Feature selected');

    // ─── Step 5: select TEAM_EMPTY ──────────────────────────────────────────────────────
    await authorPage.selectTeam(data.teamEmpty);
    expect(await authorPage.getTeamValue()).toBe(data.teamEmpty);
    await authorPage.waitForTotalEntries(0);
    await captureScreenshot(page, 'Step 5: TEAM_EMPTY selected');

    // ─── Step 6-7: requirement list empty + "There is no data" message ─────────────────
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 6-7: Empty list with "There is no data"');
  });

});
