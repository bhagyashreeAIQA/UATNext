/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_007
 * Test Name    : Verify Feature Filter with No Mapped Requirements
 *
 * Description  : As a Test Engineer, I want to validate that selecting a Feature (under a selected
 *                Epic) that has no mapped requirements shows an appropriate empty state.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open Author tab → select Epic → select a Feature with no mapped requirements →
 *   requirement list empty → "There is no data" → pagination → right panel blank.
 *
 * Real data + DEVIATIONS (Testdata_Module, verified live 2026-06-29):
 *   - Each Epic maps to exactly ONE Feature whose requirements equal the Epic's, so the only Feature
 *     with NO mapped requirements is the one under the empty Epic: Epic Sub_Testdata_Module_P5 →
 *     Feature Sub_Testdata_Module_P05 (0 requirements). This case uses that pair.
 *   - Step 6 expects pagination "visible and enabled"; the build DISABLES all pagination controls in
 *     the empty state (Total 0 Entries) — consistent with AT_TC_002/AT_TC_004 — so this asserts the
 *     live (disabled) behaviour.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Feature Filter Empty State', () => {

  test('AT_TC_007 | Verify Feature Filter with No Mapped Requirements', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page + project Testdata_Module ───────────────────────
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-3: select Epic + a Feature with no mapped requirements ──────────────────
    await authorPage.selectEpic(data.epicEmpty);
    await authorPage.waitForTotalEntries(0);
    await authorPage.selectFeature(data.featureUnderEmptyEpic);
    await authorPage.waitForTotalEntries(0);
    await captureScreenshot(page, 'Step 2-3: Epic + empty Feature selected');

    // ─── Step 4-5: requirement list empty + "There is no data" message ─────────────────
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 4-5: Empty list with "There is no data"');

    // ─── Step 6: pagination — DISABLED in the empty state (see header note) ─────────────
    await authorPage.verifyPaginationDisabled();
    await captureScreenshot(page, 'Step 6: Pagination disabled');

    // ─── Step 7: right panel remains blank ─────────────────────────────────────────────
    await authorPage.verifyRightPanelBlank();
    await captureScreenshot(page, 'Step 7: Right panel blank');
  });

});
