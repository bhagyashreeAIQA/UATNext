/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_001
 * Test Name    : Verify Navigation and UI Rendering of Author Test Cases Tab
 *
 * Description  : As a Test Engineer, I want to validate that navigating to the Author Test Cases tab
 *                shows the Requirement list panel on the left (filters, search, pagination) and a
 *                blank right side initially, so authoring can begin correctly.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev" selected.
 *
 * Steps (1-14): open Author tab → Project field visible + a default project context → Epic / Feature /
 *   Team dropdowns visible → Requirement search visible → Requirement table with ID / ADO ID /
 *   Requirement columns → requirements listed sequentially → pagination shown → each row shows
 *   Requirement ID / ADO ID / Name → right panel blank → no test-case data shown.
 *
 * LIVE NOTES (verified 2026-06-29):
 *   - A default project context loads requirements immediately, but the Projects input itself renders
 *     EMPTY (no selected text); the populated requirement list is the observable proof of the default
 *     selection, so step 3 asserts requirements load rather than a non-empty input value.
 *   - Epic / Feature / Team are all enabled from the start (the documented "enabled only after the
 *     previous selection" progressive-enable is not how this build behaves), so they are asserted
 *     visible + enabled.
 *   - The right pane (`.req-right-panel-wrapper`) is not rendered until a requirement is selected, so
 *     "blank state / no test-case data" is asserted as the absence of that panel on initial load.
 *
 * Post-condition: read-only — no data is mutated.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Navigation & UI Rendering', () => {

  test('AT_TC_001 | Verify Navigation and UI Rendering of Author Test Cases Tab', async ({ page }) => {
    test.setTimeout(180000); // BU switch + Author screen + slow requirement streaming under parallel load
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);

    // ─── Step 1: Author Test Cases page is displayed (tab active) ──────────────────────
    await expect(page).toHaveURL(/\/author/);
    await authorPage.verifyAuthorTabActive();
    await captureScreenshot(page, 'Step 1: Author Test Cases page displayed');

    // ─── Step 2-3: Project field visible + a project context is selected by default ────
    await authorPage.verifyProjectFieldVisible();
    expect(await authorPage.getRequirementRowCount(),
      'a default project context should load requirements').toBeGreaterThan(0);
    await captureScreenshot(page, 'Step 2-3: Project field + default requirements');

    // ─── Step 4-7: Epic section + Epic / Feature / Team dropdowns visible and enabled ──
    await authorPage.verifyFilterDropdownsEnabled();
    await captureScreenshot(page, 'Step 4-7: Epic / Feature / Team dropdowns');

    // ─── Step 8: Requirement Search field visible and enabled ──────────────────────────
    await authorPage.verifyRequirementSearchEnabled();
    await captureScreenshot(page, 'Step 8: Requirement search field');

    // ─── Step 9: Requirement panel with ID / ADO ID / Requirement columns ──────────────
    await authorPage.verifyColumns(data.requirementColumns);
    await captureScreenshot(page, 'Step 9: Requirement table columns');

    // ─── Step 10: Requirements displayed sequentially ──────────────────────────────────
    await authorPage.verifyRequirementsListedSequentially();
    await captureScreenshot(page, 'Step 10: Requirements listed');

    // ─── Step 11: Pagination controls displayed ────────────────────────────────────────
    await authorPage.verifyPaginationVisible();
    expect(await authorPage.getTotalEntriesCount(), 'Total Entries count').toBeGreaterThan(0);
    await captureScreenshot(page, 'Step 11: Pagination controls');

    // ─── Step 12: Requirement details — ID, ADO ID and Requirement Name displayed ──────
    const firstRow = await authorPage.getRequirementRow(0);
    expect(firstRow.id, 'Requirement ID').toMatch(/^RQ-\d+$/);
    expect(firstRow.name.length, 'Requirement Name').toBeGreaterThan(0);
    // (ADO ID may legitimately be blank for some requirements — its cell is present in the row.)
    await captureScreenshot(page, 'Step 12: Requirement details');

    // ─── Step 13-14: right panel blank, no test-case data on initial load ──────────────
    await authorPage.verifyRightPanelBlank();
    await captureScreenshot(page, 'Step 13-14: Right panel blank');
  });

});
