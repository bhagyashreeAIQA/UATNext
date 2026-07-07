/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Assignee Filter – Assigned To / Business User
 * Test Case ID : TC-139
 * Test Case Name: Verify Filtering Test Runs by Business User Email
 *
 * Description  : As a Test Engineer, I want to filter test runs using a Business User email address.
 *
 * Pre-conditions:
 *   1. User is logged into UATNext.
 *   2. A Release with test runs is selected.
 *   3. Assigned To / Business User option is selected.
 *
 * Dependencies : Follows TC-137.
 *
 * Steps:
 *   1. Follow TC-137 — the Select User dropdown is enabled.
 *   2. Click the Select User dropdown — it opens with a search field.
 *   3. Search a valid Business User — the matching email entry appears in the list.
 *   4. Select the user — the selected email shows in the Select User field.
 *   5. Validate the test run grid — only runs whose Business User matches the email are shown.
 *   6. Validate the grid columns (Test Run, Test Case, Status, Assigned To, etc.).
 *
 * Select User typeahead note (verified 2026-07-03):
 *   The "Select user" list DOES carry Business User emails as options (e.g.
 *   Keshan.Beharry@setoyota.com), but it filters options by their LEADING name token, not the full
 *   email string. Typing the whole email ("Keshan.Beharry@setoyota.com") or the surname ("Beharry")
 *   returns zero options; typing the first token ("Keshan") surfaces exactly the email option. This
 *   test therefore searches by the token and selects the resulting email option.
 */

import { test, expect } from '@playwright/test';
import {
  loginAndOpenExecuteTab,
  switchProjectAndLoadReleases,
} from './executeNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Assignee Filter – Assigned To / Business User', () => {

  test('TC-139 | Verify Filtering Test Runs by Business User Email', async ({ page }) => {
    test.setTimeout(300000);

    // The Business User email to filter by, and the leading name token the typeahead filters on
    // (see header note — the full email matches nothing, the "Keshan" token surfaces this option).
    const businessUserEmail = 'Keshan.Beharry@setoyota.com';
    const searchToken = businessUserEmail.split(/[.@]/)[0];   // "Keshan"

    // ─── Step 1 (Follow TC-137): reach a populated grid and enable Business User filter ─
    // Project: Testdata_Module (sidebar). Path: Testdata_Release_P01 → Testdata_Cycle_1 →
    // Dealer Master (its grid carries Business User emails). View All for a populated grid.
    const { executeTabPage } = await loginAndOpenExecuteTab(page);
    await switchProjectAndLoadReleases(executeTabPage);
    await executeTabPage.selectSidebarProject('Testdata_Module');
    await executeTabPage.expandReleaseByName('Testdata_Release_P01');
    await executeTabPage.expandCycleByName('Testdata_Cycle_1');
    await executeTabPage.clickModuleByName('Dealer Master');
    await executeTabPage.selectViewAllAndWaitForRefresh(await executeTabPage.getTotalEntriesText());
    await executeTabPage.verifyTotalEntriesPositive();
    await executeTabPage.selectAssignedToBusinessUser();   // Select User dropdown enabled
    await captureScreenshot(page, 'Step 1: Business User filter enabled on a populated grid');

    // ─── Step 2-3: search the Business User by name token; the email option appears ─────
    const options = await executeTabPage.getSelectUserOptions(searchToken);
    expect(options.some(o => o.includes(businessUserEmail)),
      `the "${businessUserEmail}" option should appear when searching "${searchToken}"`).toBe(true);
    await captureScreenshot(page, 'Step 2-3: Business User email option shown');

    // ─── Step 4: select the Business User email → it shows in the Select User field ─────
    const chosen = await executeTabPage.selectUserAndWaitForRefresh(searchToken, businessUserEmail);
    expect(chosen).toContain(businessUserEmail);
    await captureScreenshot(page, 'Step 4: Business User selected, grid filtered');

    // ─── Steps 5-6 / Expected 3-4: grid shows only matching runs; columns are correct ──
    await executeTabPage.verifyAllRowsMatchUser(chosen);
    await executeTabPage.verifyGridHeaders(EXPECTED.gridColumns);
    await captureScreenshot(page, 'Step 5-6: Grid shows only matching runs; columns valid');
  });

});
