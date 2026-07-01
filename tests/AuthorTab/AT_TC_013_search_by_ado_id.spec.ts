/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_013
 * Test Name    : Verify Search Functionality Using ADO ID
 *
 * Description  : As a Test Engineer, I want to validate that searching with a valid ADO ID displays
 *                the matching requirement.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-7): open Author tab → search field visible + enabled → enter a valid ADO ID → search →
 *   only the matching requirement(s) are displayed → each displayed ADO ID matches the entered value.
 *
 * Live note (2026-06-29): the search magnifier is decorative (Enter triggers search). The ADO ID
 *   383414 maps to two requirements (the same requirement is duplicated across Epics), so the search
 *   returns 2 rows — both carrying that ADO ID.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Search', () => {

  test('AT_TC_013 | Verify Search Functionality Using ADO ID', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await captureScreenshot(page, 'Step 1: Open Author tab');
    // ─── Step 2-3: Requirement Search field visible + enabled ──────────────────────────
    await authorPage.verifyRequirementSearchEnabled();
    await captureScreenshot(page, 'Step 2-3: Requirement Search field visible + enabled');
    // ─── Step 4-5: enter a valid ADO ID and search ─────────────────────────────────────
    await page.waitForTimeout(10000); // Waits for 10 seconds to ensure the requirement list is fully loaded
    // Safely read the initial requirement count from pagination; default to 0 if not available
    await authorPage.searchRequirements(data.searchAdoId);
    let initialReqCount = 0;
    try {
      const txt = await page.locator('.pagination .wrapper-2 .p').textContent();
      if (txt)
        initialReqCount = Number(txt.split(' ')[1] ?? '0');
    } catch (e) {
      initialReqCount = 0;
    }
    console.log(`Initial requirement count: ${initialReqCount}`);
    await authorPage.searchAndWait(data.searchAdoId, initialReqCount);
    await captureScreenshot(page, 'Step 4-5: Searched by ADO ID');

    // ─── Step 6-7: only matching requirement(s); each displayed ADO ID matches ─────────
    const adoIds = await authorPage.getRequirementAdoIds();
    expect(adoIds.length, 'matching requirement(s) displayed').toBeGreaterThan(0);
    for (const ado of adoIds) {
      expect(ado, 'displayed ADO ID matches the entered value').toBe(data.searchAdoId);
    }
    await captureScreenshot(page, 'Step 6-7: Matching ADO ID requirements displayed');
  });

});
