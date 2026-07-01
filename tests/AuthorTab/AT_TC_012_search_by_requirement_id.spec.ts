/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_012
 * Test Name    : Verify Search Functionality Using Requirement ID
 *
 * Description  : As a Test Engineer, I want to validate that searching with a valid Requirement ID
 *                displays the matching requirement.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open Author tab → search field visible + enabled → enter a valid Requirement ID →
 *   search → only the matching requirement is displayed → its ID matches the entered value.
 *
 * Live note (2026-06-29): the search magnifier is decorative; search is triggered with Enter.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Search', () => {

  test('AT_TC_012 | Verify Search Functionality Using Requirement ID', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-3: Requirement Search field visible + enabled ──────────────────────────
    await authorPage.verifyRequirementSearchEnabled();
    await captureScreenshot(page, 'Step 2-3: Search field visible + enabled');

    // ─── Step 4-5: enter a valid Requirement ID and search ─────────────────────────────
    await authorPage.searchAndWait(data.searchReqId, 1);
    await captureScreenshot(page, 'Step 4-5: Searched by Requirement ID');

    // ─── Step 6-7: only the matching requirement is displayed; its ID matches ──────────
    const ids = await authorPage.getRequirementIds();
    expect(ids, 'only the matching requirement is displayed').toEqual([data.searchReqId]);
    await captureScreenshot(page, 'Step 6-7: Matching requirement displayed');
  });

});
