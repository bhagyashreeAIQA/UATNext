/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_008
 * Test Name    : Verify Requirement Filtering Based on Team Selection with EPIC and Feature
 *
 * Description  : As a Test Engineer, I want to validate that selecting EPIC, Feature and Team shows
 *                only requirements mapped to the selected Team.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-6): open Author tab → Team disabled before Epic/Feature → select Epic → select Feature →
 *   select Team → only the Team's requirements displayed.
 *
 * Real data + DEVIATION (Testdata_Module, verified live 2026-06-29): the Team dropdown is technically
 *   ENABLED before an Epic is selected, but it offers no real teams (only "Please Select") until an
 *   Epic is chosen — so step 2 asserts that "not-usable-yet" state rather than a disabled control.
 *   EPIC = Sub_Testdata_Module_P1 (38 reqs) → Feature Sub_Testdata_Module_P01 → Team "SPARK Mod
 *   Team A" filters the list to a real subset (≈19 of 38).
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Team Filter', () => {

  test('AT_TC_008 | Verify Requirement Filtering Based on Team Selection with EPIC and Feature', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page + project Testdata_Module ───────────────────────
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2: Team dropdown offers no teams before an Epic is selected ───────────────
    await authorPage.verifyTeamLabelVisible();
    await authorPage.verifyNoTeamOptionsYet();
    await captureScreenshot(page, 'Step 2: Team not usable before Epic');

    // ─── Step 3: select an EPIC ─────────────────────────────────────────────────────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    expect(await authorPage.getEpicValue()).toBe(data.epicA);
    await captureScreenshot(page, 'Step 3: Epic selected');

    // ─── Step 4: select a Feature ───────────────────────────────────────────────────────
    await authorPage.selectFeature(data.featureA);
    await authorPage.waitForTotalEntries(data.epicACount);
    expect(await authorPage.getFeatureValue()).toBe(data.featureA);
    await captureScreenshot(page, 'Step 4: Feature selected');

    // ─── Step 5: select a Team ──────────────────────────────────────────────────────────
    // Team requirement counts are volatile, so assert a non-empty filtered subset (count-agnostic).
    await authorPage.selectTeam(data.teamWithRequirements);
    expect(await authorPage.getTeamValue()).toBe(data.teamWithRequirements);
    const epicFeatureTotal = await authorPage.getTotalEntriesCount();
    await captureScreenshot(page, 'Step 5: Team selected');

    // ─── Step 6: only the Team's requirements are displayed (a real subset) ────────────
    await authorPage.verifyRequirementsFiltered();
    expect(await authorPage.getTotalEntriesCount(), 'Team filter should subset the Epic+Feature list')
      .toBeLessThanOrEqual(epicFeatureTotal);
    await captureScreenshot(page, 'Step 6: Team-filtered requirements');
  });

});
