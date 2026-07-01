/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_016
 * Test Name    : Verify Search Behavior with Special Input Cases
 *
 * Description  : As a Test Engineer, I want to validate that search handles case sensitivity, leading
 *                spaces and special characters without breaking.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module".
 *
 * Steps (1-11): lowercase / uppercase / mixed-case search all return the same matches; leading spaces
 *   are ignored (same matches); special characters yield the empty state without errors.
 *
 * Live data (2026-06-29): the title word "Create" → 20 matches; search is case-insensitive and trims
 *   leading spaces; "@#$%" → "There is no data".
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Requirement Search', () => {

  test('AT_TC_016 | Verify Search Behavior with Special Input Cases', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const word = data.searchTitleWord;          // "Create"
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);

    // ─── Step 2-3: lowercase search → matching requirements ────────────────────────────
    await page.waitForTimeout(5000);
    await authorPage.searchRequirements(word.toLowerCase());
    await page.waitForTimeout(5000); // Waits for 5 seconds to ensure the requirement list is fully loaded
    
    const initialReqCount = Number((await page.locator('.pagination .wrapper-2 .p').textContent())?.split(' ')[1] ?? '0');
       
    console.log(`Initial requirement count for lowercase search: ${initialReqCount}`);
    await authorPage.searchAndWait(word.toLowerCase(), initialReqCount);
    await captureScreenshot(page, 'Step 2-3: lowercase search');

    // ─── Step 4-5: uppercase search → same matches ─────────────────────────────────────
    //await page.waitForTimeout(5000);
    //await authorPage.searchRequirements(word.toUpperCase());
    //await page.waitForTimeout(5000);
    //const initialReqCount1 = Number((await page.locator('.pagination .wrapper-2 .p').textContent())?.split(' ')[1] ?? '0');
    //console.log(`Initial requirement count for uppercase search: ${initialReqCount1}`);
    await authorPage.searchAndWait(word.toUpperCase(), initialReqCount);
    await captureScreenshot(page, 'Step 4-5: uppercase search');

    // ─── Step 6-7: mixed-case search → same matches ────────────────────────────────────
   
    //const initialReqCount2 = Number((await page.locator('.pagination .wrapper-2 .p').textContent())?.split(' ')[1] ?? '0');
    //console.log(`Initial requirement count for mixed-case search: ${initialReqCount2}`);
    await authorPage.searchAndWait('CrEaTe', initialReqCount);
    await captureScreenshot(page, 'Step 6-7: mixed-case search');

    // ─── Step 8-9: leading spaces are ignored → same matches ───────────────────────────
   
    await authorPage.searchAndWait('   ' + word, initialReqCount);
    await captureScreenshot(page, 'Step 8-9: leading-space search');

    // ─── Step 10-11: special characters → graceful empty state ─────────────────────────
    await page.waitForTimeout(5000);
    await authorPage.searchAndWait(data.searchSpecialChars, 0);
    await authorPage.verifyEmptyState();
    await captureScreenshot(page, 'Step 10-11: special characters → "There is no data"');
  });

});
