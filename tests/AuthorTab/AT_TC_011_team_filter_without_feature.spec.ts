/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_011
 * Test Name    : Verify Requirement Filtering When Team Is Selected Without Selecting Feature
 *
 * Description  : As a Test Engineer, I want to validate that selecting a Team after an EPIC (without
 *                a Feature) filters requirements correctly, and switching the Team refreshes the list.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-11): open Author tab → Team disabled before Epic → select EPIC_A → select Team_A (no
 *   Feature) → Team_A requirements → switch to Team_B → Team_B requirements (only).
 *
 * Real data + DEVIATIONS (Testdata_Module, verified live 2026-06-29): the Team dropdown is ENABLED
 *   before an Epic is selected but offers no teams until an Epic is chosen (step 2 asserts that). Under
 *   EPIC_A: Team_A "SPARK Mod Team A" → 19 reqs, Team_B "SPARK Mod Team B" → 3 reqs. The grid has no
 *   Team column, so "requirements belong only to Team_X" (steps 6-7,10-11) is validated via the
 *   filtered count + valid RQ ids and the set changing on switch (no stale data).
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Team Filter (no Feature)', () => {

  test('AT_TC_011 | Verify Requirement Filtering When Team Is Selected Without Selecting Feature', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1-2: Author page; Team offers no teams before an Epic ────────────────────
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.verifyNoTeamOptionsYet();
    await captureScreenshot(page, 'Step 1-2: Team not usable before Epic');

    // ─── Step 3: select EPIC_A ──────────────────────────────────────────────────────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    await captureScreenshot(page, 'Step 3: EPIC_A selected');

    // ─── Step 4-7: select Team_A (no Feature) → only Team_A requirements ────────────────
    // Team requirement counts are volatile, so assert a non-empty filtered subset (count-agnostic).
    await authorPage.selectTeam(data.teamWithRequirements);
    expect(await authorPage.getTeamValue()).toBe(data.teamWithRequirements);
    await authorPage.verifyRequirementsFiltered();
    const teamAIds = await authorPage.getRequirementIds();
    await captureScreenshot(page, 'Step 4-7: Team_A requirements');

    // ─── Step 8-11: switch to Team_B → only Team_B requirements (no stale Team_A) ───────
    await authorPage.selectTeam(data.teamB);
    expect(await authorPage.getTeamValue()).toBe(data.teamB);
    await authorPage.verifyRequirementsFiltered();
    const teamBIds = await authorPage.getRequirementIds();
    expect(teamBIds.filter(id => teamAIds.includes(id)),
      'no Team_A requirements should remain after switching to Team_B').toEqual([]);
    await captureScreenshot(page, 'Step 8-11: Team_B requirements');
  });

});
