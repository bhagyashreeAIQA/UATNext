/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_004
 * Test Name    : Verify Epic Filter When No Data Is Available
 *
 * Description  : As a Test Engineer, I want to validate that selecting an Epic with no mapped
 *                requirements shows an appropriate empty state without any UI issues.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-6): open Author tab → select Epic_EMPTY → requirement list empty → "There is no data"
 *   message → pagination disabled → right panel blank.
 *
 * Real data (Testdata_Module, verified 2026-06-29): Epic_EMPTY = Sub_Testdata_Module_P5 maps to zero
 *   requirements, so it renders the documented empty state.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Epic Filter Empty State', () => {

  test('AT_TC_004 | Verify Epic Filter When No Data Is Available', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page + project Testdata_Module ───────────────────────
    await authorPage.selectProject(data.projectWithRequirements);
    await captureScreenshot(page, 'Step 1: Author tab, Testdata_Module selected');

    // ─── Step 2: select Epic_EMPTY (an Epic with no mapped requirements) ───────────────
    await authorPage.selectEpic(data.epicEmpty);
    await authorPage.waitForTotalEntries(0);
    await captureScreenshot(page, 'Step 2: Epic_EMPTY selected');

    // ─── Step 3-4: requirement list empty + "There is no data" message ─────────────────
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 3-4: Empty list with "There is no data"');

    // ─── Step 5: pagination controls disabled ──────────────────────────────────────────
    await authorPage.verifyPaginationDisabled();
    await captureScreenshot(page, 'Step 5: Pagination disabled');

    // ─── Step 6: right panel remains blank ─────────────────────────────────────────────
    await authorPage.verifyRightPanelBlank();
    await captureScreenshot(page, 'Step 6: Right panel blank');
  });

});
