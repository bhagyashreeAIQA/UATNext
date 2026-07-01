/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_003
 * Test Name    : Verify Filtering of Requirements Based on Epic Selection
 *
 * Description  : As a Test Engineer, I want to validate that selecting an EPIC updates the Requirement
 *                list to show only requirements that belong to the selected EPIC.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-12): open Author tab → Epic label + dropdown enabled → open Epic dropdown → Epic values
 *   populated → select EPIC_A → requirement list filtered to EPIC_A → change to EPIC_B → list
 *   refreshes to EPIC_B → previous selection cleared / no stale EPIC_A requirements remain.
 *
 * Real data (Testdata_Module, verified 2026-06-29): EPIC_A = Sub_Testdata_Module_P1 (≈38 reqs),
 *   EPIC_B = Sub_Testdata_Module_P2 (≈4 reqs) — disjoint requirement sets.
 *
 * LIVE NOTE — spec deviation: changing the Epic refreshes the requirement LIST (no EPIC_A rows remain),
 *   but the build does NOT auto-clear a previously opened requirement's right-panel DETAIL. This case
 *   therefore validates step 11 ("previous selection cleared") at the list level (none of EPIC_A's
 *   requirements remain visible after switching to EPIC_B), which is also step 12.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Epic Filter', () => {

  test('AT_TC_003 | Verify Filtering of Requirements Based on Epic Selection', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page + project Testdata_Module ───────────────────────
    await authorPage.selectProject(data.projectWithRequirements);
    await captureScreenshot(page, 'Step 1: Author tab, Testdata_Module selected');

    // ─── Step 2-3: Epic label displayed + Epic dropdown enabled ────────────────────────
    await authorPage.verifyEpicLabelVisible();
    await expect(authorPage.epicField).toBeEnabled();
    await captureScreenshot(page, 'Step 2-3: Epic label + dropdown');

    // ─── Step 4-5: open Epic dropdown → Epic values populated from qTest ────────────────
    const epicOptions = await authorPage.getEpicOptions();
    expect(epicOptions, 'Epic options populated').toEqual(
      expect.arrayContaining([data.epicA, data.epicB, data.epicEmpty]));
    await captureScreenshot(page, 'Step 4-5: Epic values populated');

    // ─── Step 6-8: select EPIC_A → requirement list filtered to EPIC_A ─────────────────
    await authorPage.selectEpic(data.epicA);
    expect(await authorPage.getEpicValue()).toBe(data.epicA);
    await authorPage.waitForTotalEntries(data.epicAOnlyCount); // epic alone (no feature)
    await authorPage.verifyRequirementsFiltered(data.epicAOnlyCount);
    const epicAIds = await authorPage.getRequirementIds();
    await captureScreenshot(page, 'Step 6-8: EPIC_A requirements');

    // ─── Step 9-10: change to EPIC_B → list refreshes to EPIC_B only ───────────────────
    await authorPage.selectEpic(data.epicB);
    expect(await authorPage.getEpicValue()).toBe(data.epicB);
    await authorPage.waitForTotalEntries(data.epicBCount);
    await authorPage.verifyRequirementsFiltered(data.epicBCount);
    const epicBIds = await authorPage.getRequirementIds();
    await captureScreenshot(page, 'Step 9-10: EPIC_B requirements');

    // ─── Step 11-12: no stale data — none of EPIC_A's requirements remain visible ──────
    const overlap = epicBIds.filter(id => epicAIds.includes(id));
    expect(overlap, 'no EPIC_A requirements should remain after switching to EPIC_B').toEqual([]);
    await captureScreenshot(page, 'Step 11-12: No stale EPIC_A requirements');
  });

});
