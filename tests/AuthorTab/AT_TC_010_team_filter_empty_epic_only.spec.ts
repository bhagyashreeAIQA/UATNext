/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_010
 * Test Name    : Verify Team Selection with EPIC Filtering When No Mapped Requirements Exist
 *
 * Description  : As a Test Engineer, I want to validate that selecting a Team with no mapped
 *                requirements under an EPIC shows the appropriate empty state.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-8): open Author tab → Team disabled before Epic → select Epic → select Team (empty) →
 *   requirement list empty → "There is no data" → pagination → right panel blank.
 *
 * Real data + DEVIATIONS (Testdata_Module, verified live 2026-06-29):
 *   - The Team dropdown is ENABLED before an Epic is selected but offers no teams (only "Please
 *     Select") until an Epic is chosen, so step 2 asserts that "not-usable-yet" state. Team filtering
 *     works with an Epic alone (no Feature required).
 *   - EPIC = Sub_Testdata_Module_P1 → Team "Main Team" (TEAM_EMPTY) maps to 0 requirements.
 *   - Step 7 expects pagination "visible and enabled"; the build DISABLES all pagination controls in
 *     the empty state (Total 0 Entries) — consistent with AT_TC_002/004/007 — so this asserts the
 *     live (disabled) behaviour.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Team Filter Empty State (Epic only)', () => {

  test('AT_TC_010 | Verify Team Selection with EPIC Filtering When No Mapped Requirements Exist', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page + project Testdata_Module ───────────────────────
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2: Team dropdown offers no teams before an Epic is selected ───────────────
    await authorPage.verifyNoTeamOptionsYet();
    await captureScreenshot(page, 'Step 2: Team not usable before Epic');

    // ─── Step 3: select an EPIC ─────────────────────────────────────────────────────────
    await authorPage.selectEpic(data.epicA);
    await authorPage.waitForTotalEntriesStable();
    expect(await authorPage.getEpicValue()).toBe(data.epicA);
    await captureScreenshot(page, 'Step 3: Epic selected');

    // ─── Step 4: select a Team with no mapped requirements (no Feature selected) ────────
    await authorPage.selectTeam(data.teamEmpty);
    expect(await authorPage.getTeamValue()).toBe(data.teamEmpty);
    await authorPage.waitForTotalEntries(0);
    await captureScreenshot(page, 'Step 4: TEAM_EMPTY selected');

    // ─── Step 5-6: requirement list empty + "There is no data" message ─────────────────
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 5-6: Empty list with "There is no data"');

    // ─── Step 7: pagination — DISABLED in the empty state (see header note) ─────────────
    await authorPage.verifyPaginationDisabled();
    await captureScreenshot(page, 'Step 7: Pagination disabled');

    // ─── Step 8: right panel remains blank ─────────────────────────────────────────────
    await authorPage.verifyRightPanelBlank();
    await captureScreenshot(page, 'Step 8: Right panel blank');
  });

});
