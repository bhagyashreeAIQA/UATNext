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
 * KNOWN FLAKY (2026-08-04, stg): searchRequirements()'s "did the Total Entries count change" signal
 *   is not proof the grid ROWS finished re-rendering — a run was observed where the count had already
 *   updated but getRequirementNames() still read a stale/unfiltered row (a result whose name did not
 *   contain the search term). searchRequirements()'s own comments already note the app can silently
 *   drop the Enter keystroke. A real fix needs the row CONTENT (not just the count) polled until it
 *   matches the term, with a re-search retry if it doesn't — not attempted yet.
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
    await authorPage.waitForTotalEntriesStable();
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
