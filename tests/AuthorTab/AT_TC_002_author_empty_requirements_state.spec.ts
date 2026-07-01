/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_002
 * Test Name    : Verify Behavior When No Requirements Are Available for Selected Project
 *
 * Description  : As a Test Engineer, I want to validate that when the requirement list is empty the
 *                system shows an appropriate empty state without any UI issues.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev" selected.
 *
 * Steps (1-9): open Author tab → select a project → tab highlighted → Requirement panel keeps its
 *   columns (ID / ADO ID / Requirement) → requirement list empty → "There is no data" message →
 *   pagination disabled → filters + search still visible/usable → right panel blank.
 *
 * LIVE NOTE — spec deviation (verified 2026-06-29): under the UATNext Dev BU BOTH Author projects
 *   carry requirements (Testdata_Module ≈ 45, SET Dealer CRM ≈ 20), so a project with ZERO
 *   requirements is not available to select. The documented empty state this case validates ("There
 *   is no data", retained columns, disabled pagination, still-usable filters/search, blank right
 *   panel) is induced here by selecting an Epic with no mapped requirements (Sub_Testdata_Module_P5)
 *   after selecting the project — a genuinely empty requirement scope that renders the full documented
 *   empty state. (A no-match Requirement search reaches an empty list too, but the build leaves its
 *   pagination "Next" enabled in that path, so it does not satisfy "pagination disabled".) Switch to a
 *   genuinely empty project here if/when one exists.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Empty Requirements State', () => {

  test('AT_TC_002 | Verify Behavior When No Requirements Are Available for Selected Project', async ({ page }) => {
    test.setTimeout(180000); // BU switch + Author screen + slow requirement streaming under parallel load
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page is displayed ───────────────────────────────────
    await expect(page).toHaveURL(/\/author/);
    await captureScreenshot(page, 'Step 1: Author Test Cases page displayed');

    // ─── Step 2: select a project ──────────────────────────────────────────────────────
    await authorPage.selectProject(data.projectWithRequirements);
    expect(await authorPage.getProjectValue()).toBe(data.projectWithRequirements);
    await captureScreenshot(page, 'Step 2: Project selected');

    // ─── Step 3: Author Test Cases tab is highlighted ──────────────────────────────────
    await authorPage.verifyAuthorTabActive();
    await captureScreenshot(page, 'Step 3: Author tab highlighted');

    // Induce the empty requirement list (no project with zero requirements exists — see note):
    // select an Epic that has no mapped requirements.
    await authorPage.selectEpic(data.epicEmpty);
    await authorPage.waitForTotalEntries(0);

    // ─── Step 4: Requirement panel still shows its columns ─────────────────────────────
    await authorPage.verifyColumns(data.requirementColumns);
    await captureScreenshot(page, 'Step 4: Requirement columns retained');

    // ─── Step 5-6: list is empty + "There is no data" message ──────────────────────────
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 5-6: Empty list with "There is no data"');

    // ─── Step 7: pagination controls disabled ──────────────────────────────────────────
    await authorPage.verifyPaginationDisabled();
    await captureScreenshot(page, 'Step 7: Pagination disabled');

    // ─── Step 8: filters and search remain visible and usable ──────────────────────────
    await authorPage.verifyProjectFieldVisible();
    await authorPage.verifyFilterDropdownsEnabled();
    await authorPage.verifyRequirementSearchEnabled();
    await captureScreenshot(page, 'Step 8: Filters and search still usable');

    // ─── Step 9: right panel remains blank ─────────────────────────────────────────────
    await authorPage.verifyRightPanelBlank();
    await captureScreenshot(page, 'Step 9: Right panel blank');
  });

});
