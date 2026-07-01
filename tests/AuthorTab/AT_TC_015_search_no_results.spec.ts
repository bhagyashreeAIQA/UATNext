/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_015
 * Test Name    : Verify Search Functionality When No Matching Results Are Found
 *
 * Description  : As a Test Engineer, I want to validate that searching with invalid / non-existing
 *                input shows an appropriate empty state without UI issues.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-8): open Author tab → search field visible + enabled → enter invalid input → search →
 *   no requirements displayed → "There is no data" → right panel blank.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Search', () => {

  test('AT_TC_015 | Verify Search Functionality When No Matching Results Are Found', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-3: Requirement Search field visible + enabled ──────────────────────────
    await authorPage.verifyRequirementSearchEnabled();

    // ─── Step 4-5: enter invalid input and search ──────────────────────────────────────
    await authorPage.searchAndWait(data.noMatchSearch, 0);
    await captureScreenshot(page, 'Step 4-5: Searched invalid input');

    // ─── Step 6-7: no requirements + "There is no data" message ────────────────────────
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 6-7: Empty state with "There is no data"');

    // ─── Step 8: right panel remains blank ─────────────────────────────────────────────
    await authorPage.verifyRightPanelBlank();
    await captureScreenshot(page, 'Step 8: Right panel blank');
  });

});
