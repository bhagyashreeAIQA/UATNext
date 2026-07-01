import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object for the **Author Test Cases** tab (`/author`).
 *
 * Layout (verified live 2026-06-29): the page renders under `.frame` — a left filter panel
 * (Projects dropdown + Epic / Feature / Team "Please Select" dropdowns + an "Or" + a Requirement
 * search box) above a Requirement list table, with a right pane that stays empty until a requirement
 * is selected.
 *
 * Selectors:
 *  - Filter dropdowns are four `input.searchable-dropdown-input` in DOM order:
 *    [0] Projects, [1] Epic, [2] Feature, [3] Team. (The header Business-Unit switcher is a separate
 *    `span.project-selector`, NOT a searchable-dropdown-input, so the index mapping is stable.)
 *  - Requirement search: `input.content-2[type="search"]` (placeholder "Search Requirements by
 *    PID/ADO ID/Title"); its magnifier icon is decorative, so search is triggered with Enter.
 *  - Requirement table: header `.tree-view-table-row-header` (cells ID / ADO ID / Requirement); data
 *    rows `.tree-view-table-row` (each `id="requirements-table-row"`, `data-id=…`), with cells
 *    ID `.table-left-cell-7 .text-wrapper-8`, ADO ID `.table-left-cell-5 .text-wrapper-6`,
 *    Requirement `.table-left-cell-6 .text-wrapper-7`.
 *  - Pagination: `.pagination` with `img[alt="First Page"|"Previous"|"Next"|"Last Page"]` and the
 *    current page `.pagination-item .text-wrapper-9`; a disabled control carries inline
 *    `opacity: 0.5; cursor: default`.
 *  - Empty state: the text "There is no data" (rendered in a `.text-wrapper-8`).
 *  - Right pane: `.req-right-panel-wrapper` — absent on initial load, created when a requirement is
 *    opened.
 *
 * Data note: under the UATNext Dev BU both Author projects carry requirements (Testdata_Module ≈ 45,
 * SET Dealer CRM ≈ 20), so a project with zero requirements is not available; the documented empty
 * state ("There is no data" + disabled pagination) is reachable via a no-match Requirement search.
 */
export class AuthorTestCasesPage {
  private readonly page: Page;

  readonly authorTab: Locator;
  readonly frame: Locator;

  readonly projectField: Locator;
  readonly epicField: Locator;
  readonly featureField: Locator;
  readonly teamField: Locator;
  readonly requirementSearch: Locator;

  readonly epicLabel: Locator;
  readonly featureLabel: Locator;
  readonly teamLabel: Locator;

  readonly tableHeader: Locator;
  readonly requirementRows: Locator;
  readonly pagination: Locator;
  readonly rightPanel: Locator;
  readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.authorTab = page.getByRole('link', { name: 'AUTHOR TEST CASES' });
    this.frame = page.locator('.frame');

    const dropdowns = this.frame.locator('input.searchable-dropdown-input');
    this.projectField = dropdowns.nth(0);
    this.epicField    = dropdowns.nth(1);
    this.featureField = dropdowns.nth(2);
    this.teamField    = dropdowns.nth(3);
    this.requirementSearch = page.locator('input.content-2[type="search"]');

    this.epicLabel    = this.frame.getByText('Epic', { exact: true }).first();
    this.featureLabel = this.frame.getByText('Feature', { exact: true }).first();
    this.teamLabel    = this.frame.getByText('Team', { exact: true }).first();

    // The empty state renders a second `.tree-view-table-row-header`, so pin to the first (the
    // requirement list's column header) to avoid a strict-mode match of both.
    this.tableHeader      = page.locator('.tree-view-table-row-header').first();
    this.requirementRows  = page.locator('.tree-view-table-row');
    this.pagination       = page.locator('.pagination');
    this.rightPanel       = page.locator('.req-right-panel-wrapper');
    this.emptyStateMessage = page.getByText('There is no data', { exact: false });
  }

  // ─── Load / navigation ──────────────────────────────────────────────────────

  /**
   * Waits for the Author Test Cases screen to render: URL + requirement table header, then for the
   * requirement list to settle. The data rows stream in (Blazor) AFTER the header mounts, so this
   * additionally waits until either at least one row is present or the explicit empty state shows —
   * otherwise a row count read immediately after the header appears races to 0.
   */
  async waitForLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/author/);
    await expect(this.tableHeader).toBeVisible({ timeout: 45000 });
    // The requirement list streams from the shared dev backend, which is slow under parallel load,
    // so allow a generous window for rows (or an explicit empty state) to settle.
    await expect.poll(async () =>
      (await this.requirementRows.count()) > 0 || (await this.emptyStateMessage.isVisible().catch(() => false)),
      { timeout: 60000, intervals: [500, 1000, 2000, 3000] }).toBe(true);
  }

  /** The Author Test Cases nav link is the active/highlighted tab. */
  async verifyAuthorTabActive(): Promise<void> {
    await expect(this.authorTab).toBeVisible();
    await expect(this.authorTab).toHaveClass(/active/);
    await expect(this.authorTab).toHaveAttribute('aria-current', 'page');
  }

  // ─── Left filter panel ──────────────────────────────────────────────────────

  async verifyProjectFieldVisible(): Promise<void> {
    await expect(this.projectField).toBeVisible();
  }

  async getProjectValue(): Promise<string> {
    return (await this.projectField.inputValue()).trim();
  }

  /**
   * Epic / Feature / Team dropdowns are all visible and enabled. NOTE: the documented spec expects
   * Feature to enable only after an Epic is picked and Team only after a Feature; in the live build
   * all three are enabled from the start, so this asserts the live behaviour.
   */
  async verifyFilterDropdownsEnabled(): Promise<void> {
    for (const field of [this.epicField, this.featureField, this.teamField]) {
      await expect(field).toBeVisible();
      await expect(field).toBeEnabled();
    }
  }

  async verifyRequirementSearchEnabled(): Promise<void> {
    await expect(this.requirementSearch).toBeVisible();
    await expect(this.requirementSearch).toBeEnabled();
  }

  /** Opens the Projects dropdown and selects `name`, waiting for the requirement grid to refresh. */
  async selectProject(name: string): Promise<void> {
    await this.projectField.click();
    await this.page.locator('.searchable-dropdown-item').filter({ hasText: name }).first().click();
    await expect.poll(() => this.getProjectValue(), { timeout: 15000 }).toBe(name);
    // The requirement list (and the project-scoped Epic dropdown) re-streams after a project change;
    // wait for the table to settle so callers read the new project's data, not the previous one's.
    await expect(this.tableHeader).toBeVisible({ timeout: 30000 });
    await this.waitForRequirementListSettled();
  }

  /**
   * Types a term into the Requirement search and submits with Enter (the magnifier is decorative),
   * RE-ISSUING the fill+Enter until the search visibly applies (the result count changes or the empty
   * state shows). This is robust to two flaky failure modes: a list re-render resetting the search box
   * (typed value lost) and the Enter key being dropped — either of which otherwise leaves the full,
   * unfiltered list. Assumes the search changes the current result set (every real search here does).
   */
  async searchRequirements(term: string): Promise<void> {
    const before = await this.getTotalEntriesText();
    await expect.poll(async () => {
      await this.requirementSearch.fill(term);
      if ((await this.requirementSearch.inputValue()).trim() !== term.trim()) return false; // value didn't stick
      await this.requirementSearch.press('Enter');
      await this.page.waitForTimeout(1500);
      const changed = (await this.getTotalEntriesText()) !== before;
      const empty = await this.emptyStateMessage.isVisible().catch(() => false);
      return changed || empty;
    }, { timeout: 45000, intervals: [800, 1500, 2500] }).toBe(true);
  }

  /**
   * Issues a requirement search and waits for it to apply, RE-ISSUING the whole fill+Enter until the
   * "Total N Entries" count reaches `expected`. Robust to two flaky failure modes: a list re-render
   * resetting the search box (value lost) and the Enter key being dropped (search never runs) — either
   * of which otherwise leaves the full unfiltered list. Then settles the rows / empty state.
   */
  async searchAndWait(term: string, expected: number): Promise<void> {
    //let initialCount;
    await expect.poll(async () => {
      await this.requirementSearch.fill(term);
      if ((await this.requirementSearch.inputValue()).trim() !== term.trim()) return NaN; // value didn't stick
      await this.requirementSearch.press('Enter');
      await this.page.waitForTimeout(1800);
      //initialCount = Number((await this.page.locator('.pagination .wrapper-2 .p').textContent())?.split(' ')[1] ?? '0');
      //console.log(`Initial requirement count after search: ${initialCount}`);
      return this.getTotalEntriesCount();
    }, { timeout: 60000, intervals: [1000, 1500, 2500] }).toBe(expected);
    if (expected === 0) {
      await expect(this.emptyStateMessage).toBeVisible({ timeout: 10000 });
    } else {
      await expect.poll(() => this.getRequirementRowCount(), { timeout: 10000 }).toBeGreaterThan(0);
    }
  }

  /** Clears the Requirement search, waiting for the full list (`fullCount`) to be restored. */
  async clearSearchAndWait(fullCount: number): Promise<void> {
    await this.searchAndWait('', fullCount);
  }

  /**
   * Clears the Requirement search, re-issuing the empty submit until the list is restored (the result
   * count grows back from the searched/empty state). Robust to a dropped Enter leaving the filtered
   * list in place.
   */
  async clearSearch(): Promise<void> {
    const before = await this.getTotalEntriesCount();
    await expect.poll(async () => {
      await this.requirementSearch.fill('');
      await this.requirementSearch.press('Enter');
      await this.page.waitForTimeout(1500);
      return this.getTotalEntriesCount();
    }, { timeout: 30000, intervals: [800, 1500, 2500] }).not.toBe(before);
  }

  /** ADO ID values across the visible requirement rows. */
  async getRequirementAdoIds(): Promise<string[]> {
    return (await this.requirementRows.locator('.table-left-cell-5 .text-wrapper-6').allInnerTexts())
      .map(t => t.trim());
  }

  /** Requirement Name (title) values across the visible requirement rows. */
  async getRequirementNames(): Promise<string[]> {
    return (await this.requirementRows.locator('.table-left-cell-6 .text-wrapper-7').allInnerTexts())
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  // ─── Epic / Feature / Team filter dropdowns ─────────────────────────────────
  // All three share the searchable-dropdown widget: click the input to open the option list
  // (`.searchable-dropdown-item`), then click an option. Selecting a value refreshes the
  // requirement list (Blazor re-streams the rows).

  private async openDropdown(field: Locator): Promise<void> {
    await field.click();
    await expect(this.page.locator('.searchable-dropdown-item').first()).toBeVisible({ timeout: 10000 });
  }

  private async readOpenOptions(): Promise<string[]> {
    return (await this.page.locator('.searchable-dropdown-item').allInnerTexts())
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  private async pickOption(name: string): Promise<void> {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.page.locator('.searchable-dropdown-item')
      .filter({ hasText: new RegExp(`^${escaped}$`) }).first().click();
  }

  /** Opens the Epic dropdown, returns its option labels, and closes it again. */
  async getEpicOptions(): Promise<string[]> {
    await this.openDropdown(this.epicField);
    const opts = await this.readOpenOptions();
    await this.page.keyboard.press('Escape').catch(() => undefined);
    return opts;
  }

  /** Opens the Feature dropdown, returns its option labels, and closes it again. */
  async getFeatureOptions(): Promise<string[]> {
    await this.openDropdown(this.featureField);
    const opts = await this.readOpenOptions();
    await this.page.keyboard.press('Escape').catch(() => undefined);
    return opts;
  }

  /** Opens the Team dropdown, returns its option labels, and closes it again. */
  async getTeamOptions(): Promise<string[]> {
    await this.openDropdown(this.teamField);
    const opts = await this.readOpenOptions();
    await this.page.keyboard.press('Escape').catch(() => undefined);
    return opts;
  }

  async getEpicValue(): Promise<string> {
    return (await this.epicField.inputValue()).trim();
  }

  async getFeatureValue(): Promise<string> {
    return (await this.featureField.inputValue()).trim();
  }

  async getTeamValue(): Promise<string> {
    return (await this.teamField.inputValue()).trim();
  }

  /**
   * Selects an Epic and waits for the requirement list to actually re-filter. The exact per-epic
   * requirement count is VOLATILE (the shared qTest data changes — e.g. epic P1 was 38, later 51), so
   * this keys the wait on the "Total N Entries" count CHANGING from its pre-selection value and then
   * STABILISING, rather than on a hard-coded number. Pair with {@link waitForTotalEntries} only for
   * counts known to be stable (e.g. epic+feature, empty epics).
   */
  async selectEpic(name: string): Promise<void> {
    const before = await this.getTotalEntriesText().catch(() => '');
    await this.openDropdown(this.epicField);
    await this.pickOption(name);
    await expect.poll(() => this.getEpicValue(), { timeout: 15000 }).toBe(name);
    await this.waitForTotalEntriesStable(before);
  }

  /**
   * Waits for the requirement "Total N Entries" count to change from `beforeText` (a filter was
   * applied) and then settle (the same value across two consecutive reads). Count-agnostic, so it is
   * robust to the volatile per-epic counts. Tolerates no change (returns once stable) as a fallback.
   */
  async waitForTotalEntriesStable(beforeText = ''): Promise<void> {
    if (beforeText) {
      await expect.poll(() => this.getTotalEntriesText(), { timeout: 30000, intervals: [500, 1000, 2000] })
        .not.toBe(beforeText).catch(() => undefined);
    }
    let prev: string | null = null;
    await expect.poll(async () => {
      const cur = await this.getTotalEntriesText().catch(() => '');
      const stable = cur !== '' && cur === prev;
      prev = cur;
      return stable;
    }, { timeout: 25000, intervals: [700, 700, 1200] }).toBe(true);
  }

  /** Selects a Feature and waits for its value to apply. Pair with {@link waitForTotalEntries}. */
  async selectFeature(name: string): Promise<void> {
    await this.openDropdown(this.featureField);
    await this.pickOption(name);
    await expect.poll(() => this.getFeatureValue(), { timeout: 15000 }).toBe(name);
  }

  /**
   * Selects a Team and waits for the requirement list to re-filter. Team requirement counts are
   * VOLATILE and context-dependent (e.g. the same team yields a different count with vs without a
   * Feature selected), so this keys the wait on the count changing + stabilising, not a fixed number.
   */
  async selectTeam(name: string): Promise<void> {
    const before = await this.getTotalEntriesText().catch(() => '');
    await this.openDropdown(this.teamField);
    await this.pickOption(name);
    await expect.poll(() => this.getTeamValue(), { timeout: 15000 }).toBe(name);
    await this.waitForTotalEntriesStable(before);
  }

  /**
   * Waits for the requirement list to re-stream to a known size after a filter change. The list
   * refreshes asynchronously and the previous rows linger, so keying the wait on the authoritative
   * "Total N Entries" count reaching the expected value is far more reliable than watching the rows.
   * Then confirms the rows (or the empty state for 0) have rendered to match.
   */
  async waitForTotalEntries(expected: number): Promise<void> {
    await expect.poll(() => this.getTotalEntriesCount(), { timeout: 45000, intervals: [500, 1000, 2000, 3000] })
      .toBe(expected);
    if (expected === 0) {
      await expect(this.emptyStateMessage).toBeVisible({ timeout: 15000 });
    } else {
      await expect.poll(() => this.getRequirementRowCount(), { timeout: 15000 }).toBeGreaterThan(0);
    }
  }

  /** Waits until the requirement list is in a consistent state — rows present or empty state shown. */
  async waitForRequirementListSettled(): Promise<void> {
    await expect.poll(async () =>
      (await this.requirementRows.count()) > 0 || (await this.emptyStateMessage.isVisible().catch(() => false)),
      { timeout: 45000, intervals: [500, 1000, 2000, 3000] }).toBe(true);
  }

  /**
   * Waits until the requirement ID set differs from `prevIds` (a filter change re-streams the rows;
   * the previous rows linger briefly, so polling the row set avoids reading the stale list). Tolerates
   * a transition to the empty state (an empty set differs from a non-empty one).
   */
  async waitForRequirementIdsChangedFrom(prevIds: string[]): Promise<void> {
    await expect.poll(() => this.getRequirementIds(), { timeout: 30000 }).not.toEqual(prevIds);
  }

  /**
   * Waits until the requirement list has re-streamed to a SETTLED, non-empty state whose "Total N
   * Entries" count differs from `prevCount` (a filter/Epic change re-streams the rows to a new size).
   * Keying on the authoritative count — and requiring rows to be present and the count finite — avoids
   * the transient empty/stale state that `waitForRequirementIdsChangedFrom` can return on, and is robust
   * to two filtered states sharing the same first-page IDs. Use when the new size is unknown (counts on
   * the shared dev backend drift, so an exact {@link waitForTotalEntries} is not always usable).
   */
  async waitForListRefreshedFrom(prevCount: number): Promise<void> {
    await expect.poll(async () => {
      const count = await this.getTotalEntriesCount();
      const hasRows = (await this.requirementRows.count()) > 0;
      return hasRows && Number.isFinite(count) && count !== prevCount;
    }, { timeout: 30000, intervals: [500, 1000, 2000, 3000] }).toBe(true);
  }

  /** Clicks a requirement row by index (opens its detail in the right panel). */
  async selectRequirementRow(index: number): Promise<void> {
    await this.requirementRows.nth(index).click();
  }

  // ─── Requirement table ──────────────────────────────────────────────────────

  /** Column header labels left-to-right (ID / ADO ID / Requirement). */
  async getColumnHeaders(): Promise<string[]> {
    await expect(this.tableHeader).toBeVisible({ timeout: 30000 });
    return (await this.tableHeader.locator('> *').allInnerTexts())
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  async verifyColumns(expected: string[]): Promise<void> {
    expect(await this.getColumnHeaders()).toEqual(expected);
  }

  async getRequirementRowCount(): Promise<number> {
    return this.requirementRows.count();
  }

  /** Requirement IDs (the RQ-#### values) across the visible rows, in order. */
  async getRequirementIds(): Promise<string[]> {
    return (await this.requirementRows.locator('.table-left-cell-7 .text-wrapper-8').allInnerTexts())
      .map(t => t.trim()).filter(Boolean);
  }

  /** Structured cell values (ID / ADO ID / Requirement name) for a row by index. */
  async getRequirementRow(index: number): Promise<{ id: string; adoId: string; name: string }> {
    const row = this.requirementRows.nth(index);
    const txt = async (loc: Locator) => (await loc.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    return {
      id:    await txt(row.locator('.table-left-cell-7 .text-wrapper-8')),
      adoId: await txt(row.locator('.table-left-cell-5 .text-wrapper-6')),
      name:  await txt(row.locator('.table-left-cell-6 .text-wrapper-7')),
    };
  }

  /** Requirements load in order with valid RQ ids and a non-empty name. */
  async verifyRequirementsListedSequentially(): Promise<void> {
    const ids = await this.getRequirementIds();
    expect(ids.length, 'expected the requirement list to be populated').toBeGreaterThan(0);
    for (const id of ids) expect(id, `requirement id "${id}"`).toMatch(/^RQ-\d+$/);
    const first = await this.getRequirementRow(0);
    expect(first.id, 'first row Requirement ID').toMatch(/^RQ-\d+$/);
    expect(first.name.length, 'first row Requirement Name').toBeGreaterThan(0);
  }

  // ─── Pagination ─────────────────────────────────────────────────────────────

  private navButton(alt: 'First Page' | 'Previous' | 'Next' | 'Last Page'): Locator {
    return this.pagination.locator(`img[alt="${alt}"]`);
  }

  async verifyPaginationVisible(): Promise<void> {
    // The `.pagination` container renders with height 0 (its children overflow), so assert its
    // contents — the Total-entries text, the prev/next controls and the current page number — rather
    // than the zero-height container's own visibility.
    expect(await this.getTotalEntriesText()).toMatch(/Total\s+\d+\s+Entries/i);
    await expect(this.navButton('Previous')).toHaveCount(1);
    await expect(this.navButton('Next')).toHaveCount(1);
    await expect(this.pagination.locator('.pagination-item .text-wrapper-9').first()).toHaveText(/^\d+$/);
  }

  async getTotalEntriesText(): Promise<string> {
    return (await this.pagination.locator('p.p, .p').first().innerText()).replace(/\s+/g, ' ').trim();
  }

  async getTotalEntriesCount(): Promise<number> {
    const m = (await this.getTotalEntriesText()).match(/\d+/);
    return m ? parseInt(m[0], 10) : NaN;
  }

  /** A pagination control is disabled when its image carries inline opacity 0.5 / cursor default. */
  async isNavDisabled(alt: 'First Page' | 'Previous' | 'Next' | 'Last Page'): Promise<boolean> {
    const style = (await this.navButton(alt).getAttribute('style') ?? '').replace(/\s+/g, '');
    return /opacity:0?\.5/.test(style) || /cursor:default/.test(style);
  }

  /** All four pagination nav controls are disabled (the empty-state, Total 0 Entries). */
  async verifyPaginationDisabled(): Promise<void> {
    for (const alt of ['First Page', 'Previous', 'Next', 'Last Page'] as const) {
      expect(await this.isNavDisabled(alt), `pagination "${alt}" should be disabled`).toBe(true);
    }
  }

  // ─── Empty state / right panel ──────────────────────────────────────────────

  /** Empty requirement list: columns retained, "There is no data", Total 0 Entries. */
  async verifyEmptyState(): Promise<void> {
    await expect(this.emptyStateMessage).toBeVisible({ timeout: 15000 });
    expect(await this.getRequirementIds()).toHaveLength(0);
    expect(await this.getTotalEntriesCount()).toBe(0);
  }

  /** The right pane is blank on initial load — no test-case detail panel is rendered. */
  async verifyRightPanelBlank(): Promise<void> {
    await expect(this.rightPanel).toHaveCount(0);
  }

  /** The right pane shows a requirement's detail (rendered once a requirement row is selected). */
  async verifyRightPanelHasContent(): Promise<void> {
    await expect(this.rightPanel.first()).toBeVisible({ timeout: 15000 });
    await expect(this.rightPanel.first()).toContainText(/RQ-\d+/);
  }

  // ─── Filter labels ──────────────────────────────────────────────────────────

  async verifyEpicLabelVisible(): Promise<void> {
    await expect(this.epicLabel).toBeVisible();
  }

  async verifyFeatureLabelVisible(): Promise<void> {
    await expect(this.featureLabel).toBeVisible();
  }

  async verifyTeamLabelVisible(): Promise<void> {
    await expect(this.teamLabel).toBeVisible();
  }

  /**
   * Before an Epic is selected the Team dropdown offers no real teams (only "Please Select"). NOTE:
   * the documented spec expects the Team dropdown to be DISABLED until Epic/Feature are chosen; in the
   * live build it is enabled but empty, so this asserts the live "no teams yet" behaviour.
   */
  async verifyNoTeamOptionsYet(): Promise<void> {
    const opts = (await this.getTeamOptions()).filter(o => o.toLowerCase() !== 'please select');
    expect(opts, 'no real Team options should be offered before an Epic is selected').toEqual([]);
  }

  /**
   * Every visible requirement is a valid RQ id and the list is non-empty — i.e. the filtered list
   * shows only (well-formed) requirements. `expectedCount`, when given, additionally pins the count.
   */
  async verifyRequirementsFiltered(expectedCount?: number): Promise<void> {
    const ids = await this.getRequirementIds();
    expect(ids.length, 'filtered requirement list should be non-empty').toBeGreaterThan(0);
    for (const id of ids) expect(id, `requirement id "${id}"`).toMatch(/^RQ-\d+$/);
    if (expectedCount !== undefined) {
      expect(await this.getTotalEntriesCount(), 'filtered Total Entries').toBe(expectedCount);
    }
  }

  // ─── Requirement detail (right) panel + Linked Test Cases (AT_TC_021 onward) ──
  // Selecting a requirement renders `.req-right-panel-wrapper` with the requirement's detail fields
  // (Feature / Linked System = Azure Boards / ADO Id / Description), an ADD TEST CASE button, and a
  // Linked Test Cases table (`.testlisttable`, rows `.testlistrow`, columns Test Case ID / Name /
  // Description / Type / Status / Assigned To / Business User / Action) with its own pagination.

  get rightPanelFirst(): Locator { return this.rightPanel.first(); }
  get addTestCaseButton(): Locator { return this.rightPanelFirst.locator('button', { hasText: /ADD TEST CASE/i }); }
  get linkedTcTable(): Locator { return this.rightPanelFirst.locator('.testlisttable'); }
  get linkedTcHeaderRow(): Locator { return this.linkedTcTable.locator('.testlistrow.header-row').first(); }
  /** Real linked-test-case rows carry a `.testlistcell-pid` (the empty-state message renders as a
   *  pid-less `.testlistrow`, so it is excluded). */
  get linkedTcRows(): Locator { return this.linkedTcTable.locator('.testlistrow:has(.testlistcell-pid)'); }
  get linkedTcPagination(): Locator { return this.rightPanelFirst.locator('.pagination'); }
  /** The "no test-case linked to the selected requirement" empty state in the right panel. */
  get noLinkedTcMessage(): Locator { return this.rightPanelFirst.getByText(/no test.?case linked/i); }

  // Unlink controls (the Action column's "Unlink Test Case" icon → a YES/NO confirmation popup).
  get unlinkIcons(): Locator { return this.rightPanelFirst.locator('img[title="Unlink Test Case"]'); }
  get unlinkConfirmYes(): Locator { return this.page.getByRole('button', { name: 'YES' }); }
  get unlinkConfirmNo(): Locator { return this.page.getByRole('button', { name: 'NO' }); }

  /** Clicks the unlink icon on the linked test case at `index` and waits for the confirm popup. */
  async clickUnlink(index = 0): Promise<void> {
    await this.unlinkIcons.nth(index).click();
    await expect(this.unlinkConfirmYes).toBeVisible({ timeout: 10000 });
  }

  /** Confirms an unlink (YES) — MUTATING: removes the test case link from the requirement. */
  async confirmUnlink(): Promise<void> {
    await this.unlinkConfirmYes.click();
  }

  /** Clicks the requirement row whose ID is `reqId` (must be on the current requirement-list page). */
  async selectRequirementById(reqId: string): Promise<void> {
    await this.requirementRows.filter({ hasText: reqId }).first().click();
    await expect(this.rightPanelFirst).toBeVisible({ timeout: 15000 });
  }

  /**
   * Clicks requirement rows in turn until one with linked test cases is found, leaving its detail
   * panel open; returns that requirement's {id, name}. Needed because unlink runs have emptied some
   * requirements (e.g. RQ-8438), so the "row with test cases" must be discovered at runtime. Throws
   * if none of the first `maxRows` requirements has any linked test cases.
   */
  async selectRequirementWithLinkedTestCases(maxRows = 12): Promise<{ id: string; name: string }> {
    await this.page.waitForTimeout(500); // give the right panel a moment to settle
    const n = Math.min(await this.requirementRows.count(), maxRows);
    for (let i = 0; i < n; i++) {
      const r = await this.getRequirementRow(i);
      await this.requirementRows.nth(i).click();
      await expect(this.rightPanelFirst).toBeVisible({ timeout: 15000 });
      await expect.poll(async () =>
        (await this.getLinkedTcCount()) > 0 || (await this.noLinkedTcMessage.isVisible().catch(() => false)),
        { timeout: 12000, intervals: [500, 1000, 2000] }).toBe(true).catch(() => undefined);
      if ((await this.getLinkedTcCount()) > 0) return { id: r.id, name: r.name };
    }
    throw new Error(`No requirement with linked test cases found in the first ${maxRows} rows`);
  }

  /** Clicks the requirement row at `index` and waits for its detail panel to render. */
  async selectRequirementAndOpenDetail(index: number): Promise<string> {
    const row = this.requirementRows.nth(index);
    const reqId = (await row.locator('.table-left-cell-7 .text-wrapper-8').innerText()).trim();
    await row.click();
    await expect(this.rightPanelFirst).toBeVisible({ timeout: 15000 });
    return reqId;
  }

  /** Asserts the right panel shows the requirement's detail fields for `reqId`. */
  async verifyRequirementDetails(reqId: string): Promise<void> {
    const rp = this.rightPanelFirst;
    await expect(rp).toBeVisible({ timeout: 15000 });
    await expect(rp).toContainText(reqId);
    await expect(rp.getByText('Feature', { exact: false }).first()).toBeVisible();
    await expect(rp.getByText('Linked System', { exact: false }).first()).toBeVisible();
    await expect(rp.getByText('Azure Boards', { exact: false }).first()).toBeVisible();
    await expect(rp.getByText('ADO Id', { exact: false }).first()).toBeVisible();
    await expect(rp.getByText('Description', { exact: false }).first()).toBeVisible();
  }

  async verifyAddTestCaseEnabled(): Promise<void> {
    await expect(this.addTestCaseButton).toBeVisible();
    await expect(this.addTestCaseButton).toBeEnabled();
  }

  /** Linked Test Cases column header labels (left-to-right). */
  async getLinkedTcColumns(): Promise<string[]> {
    await expect(this.linkedTcHeaderRow).toBeVisible({ timeout: 15000 });
    return (await this.linkedTcHeaderRow.locator('.text-wrapper-15').allInnerTexts())
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  async getLinkedTcCount(): Promise<number> {
    return this.linkedTcRows.count();
  }

  /** Whether the linked test cases table currently shows a row containing `name`. */
  async linkedTcContainsName(name: string): Promise<boolean> {
    return (await this.linkedTcTable.innerText().catch(() => '')).includes(name);
  }

  /** Test Case IDs (TC-####) shown in the linked test cases table. */
  async getLinkedTcIds(): Promise<string[]> {
    const texts = await this.linkedTcRows.allInnerTexts().catch(() => [] as string[]);
    return texts.map(t => (t.match(/TC-\d+/) ?? [''])[0]).filter(Boolean);
  }

  /** The right panel shows linked test cases (table present with ≥1 row, columns include the expected set). */
  async verifyLinkedTestCasesPresent(expectedColumns: string[]): Promise<void> {
    await expect(this.linkedTcTable).toBeVisible({ timeout: 15000 });
    const cols = await this.getLinkedTcColumns();
    for (const c of expectedColumns) expect(cols, `Linked Test Cases column "${c}"`).toContain(c);
    // The linked-test-case rows stream in after the table mounts, so wait for them to load.
    await expect.poll(() => this.getLinkedTcCount(), { timeout: 20000, intervals: [500, 1000, 2000] })
      .toBeGreaterThan(0);
  }

  /** The right panel shows the empty "no test case linked" state for the selected requirement. */
  async verifyNoLinkedTestCases(): Promise<void> {
    await expect(this.noLinkedTcMessage).toBeVisible({ timeout: 15000 });
    expect(await this.getLinkedTcCount()).toBe(0);
  }

  /**
   * The linked-test-cases pagination is displayed. Like the requirement-list pagination, its
   * container renders height 0, so assert its contents (the current page number) rather than the
   * container's own visibility.
   */
  async verifyLinkedTcPaginationDisplayed(): Promise<void> {
    await expect(this.linkedTcPagination).toHaveCount(1);
    await expect(this.linkedTcPagination.locator('.test-case-text-wrapper-9, .pagination-item .text-wrapper-9').first())
      .toHaveText(/^\d+$/, { timeout: 10000 });
  }

  // ─── Add Test Case popup ("Create Test Cases") — AT_TC_026 onward ─────────────
  // ADD TEST CASE opens an inline "Create Test Cases" form: an editable row table (columns Name* /
  // Description / Priority* / QA User / Business User / Precondition / Action) with ADD ROW / SAVE /
  // CLOSE buttons. Name and Priority are mandatory. Rows are `.treeview-row`; each Action has a
  // `.deleteRowButton`. Verified live 2026-06-30.

  get createPopup(): Locator {
    return this.page.locator('.modal-content, .modal').filter({ hasText: /Create Test Cases/i }).first();
  }
  get createPopupSave(): Locator { return this.createPopup.getByRole('button', { name: /^SAVE$/i }); }
  get createPopupClose(): Locator { return this.createPopup.getByRole('button', { name: /^CLOSE$/i }); }
  get createPopupAddRow(): Locator { return this.createPopup.getByRole('button', { name: /ADD ROW/i }); }
  get createPopupRows(): Locator { return this.createPopup.locator('.treeview-row'); }
  get createPopupDeleteIcons(): Locator { return this.createPopup.locator('.deleteRowButton'); }

  /** Opens the Add Test Case popup and waits for the Create Test Cases form to render. */
  async openAddTestCasePopup(): Promise<void> {
    await this.addTestCaseButton.click();
    await expect(this.createPopup).toBeVisible({ timeout: 15000 });
    await expect(this.createPopupAddRow).toBeVisible({ timeout: 10000 });
  }

  /** Asserts the Create Test Cases popup shows its columns, a delete icon and SAVE/CLOSE. */
  async verifyCreatePopupFields(): Promise<void> {
    const popup = this.createPopup;
    for (const col of ['Name', 'Description', 'Priority', 'QA User', 'Business User', 'Precondition', 'Action']) {
      await expect(popup.getByText(col, { exact: false }).first(), `column "${col}"`).toBeVisible();
    }
    await expect(this.createPopupDeleteIcons.first()).toBeVisible();
    await expect(this.createPopupSave).toBeVisible();
    await expect(this.createPopupSave).toBeEnabled();
    await expect(this.createPopupClose).toBeVisible();
    await expect(this.createPopupClose).toBeEnabled();
  }

  /** Create-form row count via the per-row delete icons (each row has one in the Action column). */
  async getCreatePopupRowCount(): Promise<number> {
    return this.createPopupDeleteIcons.count();
  }

  /** Clicks ADD ROW and waits for an extra create-form row. */
  async addCreateRow(): Promise<void> {
    const before = await this.getCreatePopupRowCount();
    await this.createPopupAddRow.click();
    await expect.poll(() => this.getCreatePopupRowCount(), { timeout: 10000 }).toBe(before + 1);
  }

  /** Deletes the create-form row at `index` and waits for a row to be removed. */
  async deleteCreateRow(index = 0): Promise<void> {
    const before = await this.getCreatePopupRowCount();
    await this.createPopupDeleteIcons.nth(index).click();
    await expect.poll(() => this.getCreatePopupRowCount(), { timeout: 10000 }).toBe(before - 1);
  }

  // Create-form row fields (per row, in column order): 3 plain text inputs (Name / Description /
  // Precondition) + 3 `.testcase-select` searchable dropdowns (Priority / QA User / Business User).
  get createNameInput(): Locator { return this.createPopup.locator('input[type="text"]').nth(0); }
  get createDescriptionInput(): Locator { return this.createPopup.locator('input[type="text"]').nth(1); }
  get createPreconditionInput(): Locator { return this.createPopup.locator('input[type="text"]').nth(2); }
  get createDropdowns(): Locator { return this.createPopup.locator('.testcase-select'); }

  /** Fills the first create-form row's text fields (Name / Description / Precondition). */
  async fillCreateTestCase(opts: { name?: string; description?: string; precondition?: string }): Promise<void> {
    if (opts.name !== undefined) await this.createNameInput.fill(opts.name);
    if (opts.description !== undefined) await this.createDescriptionInput.fill(opts.description);
    if (opts.precondition !== undefined) await this.createPreconditionInput.fill(opts.precondition);
  }

  /** Selects the first real Priority option for the first create-form row; returns the chosen value. */
  async selectCreatePriority(): Promise<string> {
    await this.createDropdowns.nth(0).click();
    const opt = this.page.locator('.searchable-dropdown-item').filter({ hasNotText: /please select/i }).first();
    const val = (await opt.innerText()).trim();
    await opt.click();
    return val;
  }

  async clickCreateSave(): Promise<void> {
    await this.createPopupSave.click();
  }

  /** A create-form notification/toast matching `message` (e.g. validation error or success). */
  createNotification(message: RegExp): Locator {
    return this.page.locator('.notification').filter({ hasText: message }).first();
  }

  /** Closes the Create Test Cases popup (CLOSE; accepts the unsaved-changes confirm if it appears). */
  async closeAddTestCasePopup(): Promise<void> {
    await this.createPopupClose.click();
    await this.unlinkConfirmYes.click({ timeout: 4000 }).catch(() => undefined); // "unsaved changes?" → YES
    await expect(this.createPopup).toBeHidden({ timeout: 10000 });
  }

  // ─── Test Case detail view (click a Test Case ID) — AT_TC_031 onward ──────────
  // Clicking a linked test case's ID opens its detail in place (URL stays /author): a header with the
  // TC id + Name, field labels (Priority / Assigned To / Business User / Description / Precondition /
  // Type / Status / Automation Progress), a Requirement reference, a Test Steps table (columns Step /
  // Step Description / Expected Result / UAT Category / Action) with a "+" add-step icon, an ADD
  // CALLED TESTCASE button, and SAVE / CLOSE.

  get addCalledTestCaseButton(): Locator { return this.page.getByRole('button', { name: /ADD CALLED ?TEST ?CASE/i }); }

  /** Opens a linked test case's detail by clicking its Test Case ID; returns the opened TC id. */
  async openTestCaseDetail(index = 0): Promise<string> {
    const row = this.linkedTcRows.nth(index);
    const tcId = ((await row.innerText()).match(/TC-\d+/) ?? [''])[0];
    await row.locator('.testlistcell-pid').click().catch(async () => { await row.click(); });
    await expect(this.addCalledTestCaseButton).toBeVisible({ timeout: 15000 });
    // The detail fields (`.testcase-select` dropdowns) stream their values in after the view mounts;
    // wait for them to render so callers don't read empty values.
    await expect.poll(() => this.page.locator('input.testcase-select').count(), { timeout: 15000 }).toBeGreaterThanOrEqual(6);
    await this.page.waitForTimeout(2000);
    return tcId;
  }

  /** Asserts the test case detail view shows the id, the requirement ref and its standard fields. */
  async verifyTestCaseDetails(tcId: string, reqId: string): Promise<void> {
    await expect(this.page.getByText(tcId).first()).toBeVisible();
    await expect(this.page.getByText(reqId).first()).toBeVisible();
    for (const f of ['Priority', 'Assigned To', 'Business User', 'Description', 'Precondition', 'Type', 'Status']) {
      await expect(this.page.getByText(f, { exact: false }).first(), `field "${f}"`).toBeVisible();
    }
    await expect(this.page.getByText('Test Steps', { exact: false }).first()).toBeVisible();
    await expect(this.addCalledTestCaseButton).toBeVisible();
  }

  /** Test Steps table column header labels. */
  async getTestStepColumns(): Promise<string[]> {
    const header = this.page.locator('.test-logs-table .table-row, [class*=test-log] [class*=header], .step-table [class*=header]').first();
    await expect(header).toBeVisible({ timeout: 15000 });
    return (await header.locator('*').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /** Number of test steps — read from the detail view's "Test Steps(N)" heading. */
  async getTestStepCount(): Promise<number> {
    const heading = this.page.getByText(/Test Steps\s*\(\d+\)/i).first();
    const txt = await heading.innerText().catch(() => '');
    const m = txt.match(/\((\d+)\)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  // ─── Test Case detail EDIT (AT_TC_034/035) ───────────────────────────────────
  // The detail view's fields are `.testcase-select` searchable dropdowns labelled in an
  // `.input-with-label` wrapper (Priority / Status / Type / Automation Progress / Assigned To /
  // Business User). SAVE persists; a "Successfully updated" toast confirms.

  // The detail view's six `.testcase-select` dropdowns appear in this fixed order (verified live);
  // the labels are not in the inputs' ancestry, so target by index.
  private static readonly TC_DETAIL_FIELD_INDEX: Record<string, number> = {
    'Priority': 0, 'Status': 1, 'Type': 2, 'Automation Progress': 3, 'Assigned To': 4, 'Business User': 5,
  };

  /** The `.testcase-select` value input for a labelled detail field (e.g. "Priority"). */
  tcDetailField(label: string): Locator {
    const idx = AuthorTestCasesPage.TC_DETAIL_FIELD_INDEX[label] ?? 0;
    return this.page.locator('input.testcase-select').nth(idx);
  }

  async getTcDetailFieldValue(label: string): Promise<string> {
    return (await this.tcDetailField(label).inputValue()).trim();
  }

  /** Changes a detail dropdown to a different value and returns the new value. */
  async changeTcDetailDropdown(label: string): Promise<string> {
    const field = this.tcDetailField(label);
    const current = (await field.inputValue()).trim();
    await field.click();
    const opt = this.page.locator('.searchable-dropdown-item')
      .filter({ hasNotText: /please select/i })
      .filter({ hasNotText: current ? new RegExp(`^${current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : /$^/ })
      .first();
    const val = (await opt.innerText()).trim();
    await opt.click();
    return val;
  }

  /** Clicks the test case detail SAVE and waits for the "Successfully updated" toast. */
  async saveTcDetail(): Promise<void> {
    await this.page.getByRole('button', { name: /^SAVE$/i }).first().click();
    await expect(this.page.locator('.notification').filter({ hasText: /success|updated/i }).first())
      .toBeVisible({ timeout: 15000 });
  }

  /** Closes the test case detail view, returning to the requirement's linked test case list. */
  async tcDetailBackToList(): Promise<void> {
    await this.page.getByRole('button', { name: /^CLOSE$/i }).first().click();
    await this.unlinkConfirmYes.click({ timeout: 3000 }).catch(() => undefined); // "unsaved changes?" → YES
    await expect(this.linkedTcTable).toBeVisible({ timeout: 15000 });
  }

  // ─── Test Steps: add / new-step section / delete (AT_TC_036-042) ──────────────
  // The "+" add-step control is `#addRowIcon`. A new step row (`#test-steps-row`) has a `.step-number`,
  // a UAT Category dropdown (default "Business"), and Step Description (`#stepDescription`) + Expected
  // Result (`#stepExpected`) cells rendered as TinyMCE `.testcase-prototype` "Click to add…" editors
  // (the same programmatically-unreliable editor as the Execute tab's Actual Result, TC-100/101).

  get addStepButton(): Locator { return this.page.locator('#addRowIcon'); }
  get newStepRow(): Locator { return this.page.locator('#test-steps-row').filter({ has: this.page.locator('#stepDescription') }).last(); }
  get newStepUatCategory(): Locator { return this.newStepRow.locator('input[placeholder="Select UAT Category"]'); }
  get stepDescriptionCell(): Locator { return this.page.locator('#stepDescription .testcase-prototype').first(); }
  get stepExpectedCell(): Locator { return this.page.locator('#stepExpected .testcase-prototype').first(); }
  get stepDeleteIcon(): Locator { return this.page.locator('#test-steps-row .deleteRowButton, #test-steps-row [class*="delete"], #test-steps-row img[title*="Delete"]').first(); }
  get stepDeleteIcons(): Locator { return this.page.locator('#test-steps-row .deleteRowButton, #test-steps-row [class*="delete"], #test-steps-row img[title*="Delete"]'); }

  /** Adds a step (UAT/desc/expected) and saves it — MUTATING (a real test step is created). */
  async addAndSaveTestStep(description: string, expected: string, uat = 'Business'): Promise<void> {
    await this.addTestStep();
    await this.selectUatCategory(uat);
    await this.enterStepDescription(description);
    await this.enterStepExpected(expected);
    await this.saveTcDetail();
    await expect.poll(() => this.getTestStepCount(), { timeout: 15000 }).toBeGreaterThan(0);
  }

  /** Deletes the saved step at `index` (accepts a confirm if one appears) — leaves it unsaved. */
  async deleteStepAt(index: number): Promise<void> {
    await this.stepDeleteIcons.nth(index).click();
    await this.unlinkConfirmYes.click({ timeout: 3000 }).catch(() => undefined);
  }

  /** Clicks the "+" add-step icon and waits for the new editable step row. */
  async addTestStep(): Promise<void> {
    await this.addStepButton.scrollIntoViewIfNeeded();
    await this.addStepButton.click();
    await expect(this.newStepUatCategory).toBeVisible({ timeout: 10000 });
  }

  /** Number of step rows currently rendered (`#test-steps-row`). */
  async getStepRowCount(): Promise<number> {
    return this.page.locator('#test-steps-row').count();
  }

  /**
   * The numeric step numbers shown on the SAVED step rows (`#test-steps-row .step-number`), in order.
   * Only saved steps carry a `.step-number` (the trailing "add new" row has none), so this matches the
   * "Test Steps(N)" heading count — use it to assert sequential numbering.
   */
  async getStepNumbers(): Promise<number[]> {
    return (await this.page.locator('#test-steps-row .step-number').allInnerTexts())
      .map(t => parseInt(t.trim(), 10)).filter(n => Number.isFinite(n));
  }

  /** Asserts the new step section's default state: UAT=Business, empty desc/expected, delete icon. */
  async verifyNewStepDefaults(): Promise<void> {
    await expect(this.newStepUatCategory).toBeVisible();
    expect(await this.newStepUatCategory.inputValue(), 'UAT Category default').toBe('Business');
    await expect(this.stepDescriptionCell).toContainText(/click to add/i);
    await expect(this.stepExpectedCell).toContainText(/click to add/i);
    await expect(this.stepDeleteIcon).toBeVisible();
  }

  /**
   * Selects a UAT Category for the new step, RE-ISSUING the open+pick until the input value sticks
   * (the dropdown option-click is occasionally dropped, leaving the prior value). The option is
   * exact-matched so "Technical" is not confused with another option.
   */
  async selectUatCategory(value: string): Promise<void> {
    const input = this.newStepUatCategory;
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect.poll(async () => {
      if ((await input.inputValue()).trim() === value) return value;
      await input.click();
      await this.page.locator('.searchable-dropdown-item')
        .filter({ hasText: new RegExp(`^${escaped}$`) }).first()
        .click({ timeout: 5000 }).catch(() => undefined);
      return (await input.inputValue()).trim();
    }, { timeout: 20000, intervals: [500, 1000, 1500] }).toBe(value);
  }

  /**
   * Changes the last step row's UAT Category to a value DIFFERENT from its current one (so a "modify"
   * test makes a real change). Returns the chosen value. Options are Business / Technical / N/A.
   */
  async changeUatCategory(): Promise<string> {
    const current = (await this.newStepUatCategory.inputValue()).trim();
    const target = ['Business', 'Technical', 'N/A'].find(o => o !== current) ?? 'Technical';
    await this.selectUatCategory(target);
    return target;
  }

  /**
   * Types text into the last step row's TinyMCE cell (`#stepDescription` / `#stepExpected`). Works for
   * both a newly-added step and an existing/committed step — clicking the `.testcase-prototype` cell
   * re-opens its TinyMCE editor (editable area = `iframe[title="Rich Text Area"]`). For an existing
   * step the text is inserted at the cursor (appends to the current content). Real keystrokes (not
   * `fill`) are required to commit to the Blazor model — see the inline note below.
   */
  private async enterTinyMceCell(containerId: string, text: string): Promise<void> {
    const cell = this.page.locator(containerId).last();
    const iframe = cell.locator('iframe[title="Rich Text Area"]');
    // Clicking the "Click to add…" placeholder activates a TinyMCE editor whose editable area is the
    // iframe's contenteditable body (accessible name "Rich Text Area. Press ALT-0 …"). The activation
    // click is occasionally dropped and TinyMCE init is slow, so RE-CLICK the placeholder until THIS
    // cell's iframe appears. Scoping to the cell (not a global iframe locator) avoids racing the other
    // step cell's editor during the open/collapse transition.
    await expect.poll(async () => {
      if (await iframe.isVisible().catch(() => false)) return true;
      await cell.locator('.testcase-prototype').click().catch(() => undefined);
      await this.page.waitForTimeout(1000);
      return iframe.isVisible().catch(() => false);
    }, { timeout: 25000, intervals: [500, 1000, 1500] }).toBe(true);
    const editor = cell.frameLocator('iframe[title="Rich Text Area"]')
      .getByLabel('Rich Text Area. Press ALT-0');
    // `fill()` sets the DOM but does not fire the real keystroke events TinyMCE binds to, so the value
    // never syncs to the Blazor model and SAVE rejects it as empty. Type real keystrokes instead, then
    // blur (Tab) so TinyMCE flushes its content to the bound field.
    await editor.click();
    await editor.pressSequentially(text, { delay: 25 });
    await expect(editor).toContainText(text, { timeout: 10000 });
    await this.page.keyboard.press('Tab');
  }

  /** Types into the new step's Step Description (TinyMCE iframe). */
  async enterStepDescription(text: string): Promise<void> {
    await this.enterTinyMceCell('#stepDescription', text);
  }

  /** Types into the new step's Expected Result (TinyMCE iframe). */
  async enterStepExpected(text: string): Promise<void> {
    await this.enterTinyMceCell('#stepExpected', text);
  }

  /** Deletes the (last) new step row via its delete icon and waits for it to be removed. */
  async deleteNewStep(): Promise<void> {
    const before = await this.getStepRowCount();
    await this.stepDeleteIcon.click();
    await expect.poll(() => this.getStepRowCount(), { timeout: 10000 }).toBe(before - 1);
  }

  // ─── Add Called Test Case popup (AT_TC_043-045) ──────────────────────────────
  // `#addcalledTestCase` opens `#addCalledTestCaseModal`: a "Search Test cases" input
  // (`#searchInputTCModal`) + SEARCH (`#searchTCButton`), a "Search Results" table (PID / Name
  // columns), and a CANCEL button. Selecting a result + Save adds a "Call <name>" step (MUTATING).

  get calledTcModal(): Locator { return this.page.locator('#addCalledTestCaseModal'); }
  get calledTcSearchInput(): Locator { return this.page.locator('#searchInputTCModal'); }
  get calledTcSearchButton(): Locator { return this.page.locator('#searchTCButton'); }
  get calledTcCancelButton(): Locator { return this.calledTcModal.getByRole('button', { name: /^CANCEL$/i }); }
  get calledTcResultRows(): Locator { return this.calledTcModal.locator('.defect-modal-frame-1, [class*="data-row"], .defect-modal-row'); }

  /** Opens the Add Called Test Case popup. */
  async openCalledTcPopup(): Promise<void> {
    await this.addCalledTestCaseButton.click();
    await expect(this.calledTcModal).toBeVisible({ timeout: 15000 });
  }

  /** Asserts the called-tc popup shows PID/Name columns and Search + Cancel controls. */
  async verifyCalledTcPopup(): Promise<void> {
    await expect(this.calledTcModal).toBeVisible();
    await expect(this.calledTcModal.locator('.defect-modal-header-cell').first()).toBeVisible({ timeout: 10000 });
    const headers = (await this.calledTcModal.locator('.defect-modal-header-cell').allInnerTexts()).join(' ');
    expect(headers, 'PID column').toMatch(/PID/i);
    expect(headers, 'Name column').toMatch(/Name/i);
    await expect(this.calledTcSearchButton).toBeVisible();
    await expect(this.calledTcSearchButton).toBeEnabled();
    await expect(this.calledTcCancelButton).toBeVisible();
    await expect(this.calledTcCancelButton).toBeEnabled();
  }

  /** Types a term into the called-tc search and clicks SEARCH. */
  async searchCalledTc(term: string): Promise<void> {
    await this.calledTcSearchInput.fill(term);
    await this.calledTcSearchButton.click();
  }

  async closeCalledTcPopup(): Promise<void> {
    await this.calledTcCancelButton.click();
    await expect(this.calledTcModal).toBeHidden({ timeout: 10000 });
  }

  /** A called-tc search with no match: no result rows + a no-results/invalid-search message. */
  async verifyCalledTcNoResults(): Promise<void> {
    await expect.poll(() => this.calledTcResultRows.count(), { timeout: 10000 }).toBe(0);
    // NOTE: the live build shows "Please enter a valid Test case Id" (not the documented
    // "No matching records found"); accept either.
    await expect(this.calledTcModal.getByText(/no matching record|valid test case|no record|not found/i).first())
      .toBeVisible({ timeout: 10000 });
  }

  // ─── Test step reorder (AT_TC_048-050) ───────────────────────────────────────
  // Each step row's `#order` cell has `.move-up` / `.move-down` arrows; at a boundary the arrow gets
  // a `.disable` class + `aria-disabled`. Step numbers are `.step-number`.

  stepMoveUp(index: number): Locator { return this.page.locator('#test-steps-row .move-up').nth(index); }
  stepMoveDown(index: number): Locator { return this.page.locator('#test-steps-row .move-down').nth(index); }

  async getStepNumbers(): Promise<string[]> {
    return (await this.page.locator('#test-steps-row .step-number').allInnerTexts()).map(t => t.trim());
  }

  async isStepArrowDisabled(arrow: Locator): Promise<boolean> {
    const cls = (await arrow.getAttribute('class')) ?? '';
    const aria = await arrow.getAttribute('aria-disabled');
    return /disable/.test(cls) || aria === '' || aria === 'true';
  }
}
