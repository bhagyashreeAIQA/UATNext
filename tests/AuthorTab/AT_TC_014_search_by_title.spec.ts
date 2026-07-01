/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_014
 * Test Name    : Verify Search Functionality Using Requirement Title
 *
 * Description  : As a Test Engineer, I want to validate that searching with a Requirement Title
 *                displays the matching requirements.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open Author tab → search field visible + enabled → enter a valid Requirement Title →
 *   search → only requirements matching the title are displayed → results match the entered title.
 *
 * Live note (2026-06-29): the search magnifier is decorative (Enter triggers search). Searching the
 *   title word "Create" returns 20 requirements, each whose Name contains the term.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Search', () => {

  test('AT_TC_014 | Verify Search Functionality Using Requirement Title', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-3: Requirement Search field visible + enabled ──────────────────────────
    await authorPage.verifyRequirementSearchEnabled();
    await captureScreenshot(page, 'Step 2-3: Requirement Search field visible + enabled');
    // ─── Step 4-5: enter a valid Requirement Title and search ──────────────────────────
    await authorPage.searchRequirements(data.searchTitleWord);
    const initialReqCount = Number((await page.locator('.pagination .wrapper-2 .p').textContent())?.split(' ')[1] ?? '0');
    await authorPage.searchAndWait(data.searchTitleWord, initialReqCount);
    await captureScreenshot(page, 'Step 4-5: Searched by Requirement Title');

    // ─── Step 6-7: only requirements matching the title are displayed ──────────────────
    const names = await authorPage.getRequirementNames();
    expect(names.length, 'matching requirements displayed').toBeGreaterThan(0);
    const term = data.searchTitleWord.toLowerCase();
    for (const name of names) {
      expect(name.toLowerCase(), `result "${name}" matches the entered title`).toContain(term);
    }
    await captureScreenshot(page, 'Step 6-7: Matching title requirements displayed');
  });

});
