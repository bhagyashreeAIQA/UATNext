import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object for the Coordinator → Bulk Execution sub-tab (`/generate-test-log`, "Bulk Execution").
 *
 * Bulk Execution is the sibling of Generate Test Log under the permission-gated COORDINATOR tab. Its
 * left panel is a Projects dropdown + a Release tree; clicking a Release node loads a Test Run grid in
 * the right panel with a (initially disabled) CREATE LOG button. Selectors verified live (2026-06-19).
 *
 * BU note: Bulk Execution is exercised on the **UATNext Dev** workspace (per the spec precondition),
 * whose releases (Testdata_Release_P01..P03) carry test runs; under the default qConnect - Sample
 * Project BU the Bulk Execution panel does not render its tree (console errors), so the test switches
 * the workspace first.
 */
export class BulkExecutionPage {
  private readonly page: Page;

  readonly coordinatorTab: Locator;
  readonly generateTestLogSubTab: Locator;
  readonly bulkExecutionSubTab: Locator;

  readonly projectsInput: Locator;
  readonly releaseTree: Locator;
  readonly createLogButton: Locator;
  readonly gridRows: Locator;
  readonly gridHeader: Locator;

  // Generate Test Log sibling screen — its Test Case search input is the proof that switching to the
  // Generate Test Log sub-tab actually rendered that screen (selector shared with GenerateTestLogPage).
  readonly testCaseInput: Locator;

  // Left-panel collapse/expand + tree-node + grid locators (verified live 2026-06-22).
  readonly modulePanel: Locator;       // .gtl-module-selection — gains `.collapsed` when collapsed
  readonly sidebarToggle: Locator;     // the Close/Open Sidebar control
  readonly projectsLabel: Locator;
  readonly headerRow: Locator;         // the grid's header `.gtl-testlistrow` (has `.gtl-header-checkbox`)
  readonly dataRows: Locator;          // data `.gtl-testlistrow`s (have `.gtl-checkbox-cell`)
  readonly paginationText: Locator;    // "Total N Entries"
  readonly pagination: Locator;        // #pagination container
  readonly pageNumber: Locator;        // current page number `.gtl-text-wrapper-9`
  readonly masterCheckbox: Locator;    // header (select-all) checkbox

  constructor(page: Page) {
    this.page = page;

    this.coordinatorTab        = page.getByRole('link', { name: 'COORDINATOR' });
    this.generateTestLogSubTab = page.locator('button.sidebar-tab', { hasText: 'Generate Test Log' });
    this.bulkExecutionSubTab   = page.locator('button.sidebar-tab', { hasText: 'Bulk Execution' });

    this.projectsInput   = page.locator('input.searchable-dropdown-input').first();
    this.releaseTree     = page.locator('.sidebar-tree');
    this.createLogButton = page.locator('button.test-execution-button', { hasText: 'CREATE LOG' });
    this.gridRows        = page.locator('.gtl-testlistrow');
    this.gridHeader      = page.locator('.gtl-header-content').first();

    this.testCaseInput   = page.locator('input[placeholder^="Enter test case pid"]');

    this.modulePanel     = page.locator('.gtl-module-selection');
    // Both the Close- and Open-Sidebar icons exist in the DOM at once; only the one for the current
    // state is visible, so pin to `:visible` to avoid a strict-mode match of both.
    this.sidebarToggle   = page.locator('.gtl-module-selection img[alt="Close Sidebar"]:visible, .gtl-module-selection img[alt="Open Sidebar"]:visible');
    this.projectsLabel   = page.locator('.gtl-module-selection').getByText('Projects', { exact: true });
    this.headerRow       = page.locator('.gtl-testlistrow:has(.gtl-header-checkbox)').first();
    this.dataRows        = page.locator('.gtl-testlistrow:has(.gtl-checkbox-cell)');
    this.paginationText  = page.locator('.gtl-pagination-text').first();
    this.pagination      = page.locator('#pagination');
    this.pageNumber      = page.locator('.gtl-pagination-item .gtl-text-wrapper-9').first();
    this.masterCheckbox  = this.headerRow.locator('.gtl-header-checkbox input');
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  /**
   * Activates the Bulk Execution sub-tab and waits for its Projects + Release tree to render.
   * The panel render is racy — clicking the sub-tab occasionally leaves the tree unmounted (a
   * degraded Blazor render). When that happens a reload re-mounts the COORDINATOR screen (back on the
   * Generate Test Log default), so this retries click → (on failure) reload → re-click until the tree
   * appears.
   */
  async openBulkExecution(): Promise<void> {
    await expect(this.bulkExecutionSubTab).toBeVisible({ timeout: 20000 });
    await expect(async () => {
      await this.bulkExecutionSubTab.click();
      const rendered = await this.releaseNodes().first()
        .waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
      if (!rendered) {
        await this.page.reload();
        await expect(this.bulkExecutionSubTab).toBeVisible({ timeout: 20000 });
        throw new Error('Bulk Execution tree has not rendered yet');
      }
    }).toPass({ timeout: 90000, intervals: [2000, 3000, 5000] });
    await expect(this.bulkExecutionSubTab).toHaveClass(/active/);
    await expect(this.releaseTree).toBeVisible();
  }

  /**
   * Activates the Generate Test Log sub-tab and waits for its left panel (the Test Case search input)
   * to render. Mirrors the racy-render retry used for Bulk Execution: a sub-tab click can occasionally
   * leave the panel unmounted, so on failure reload and re-click until the Test Case input appears.
   * Used by the sub-tab switching spec (BE_TC_004).
   */
  async openGenerateTestLog(): Promise<void> {
    await expect(this.generateTestLogSubTab).toBeVisible({ timeout: 20000 });
    await expect(async () => {
      await this.generateTestLogSubTab.click();
      const rendered = await this.testCaseInput
        .waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
      if (!rendered) {
        await this.page.reload();
        await expect(this.generateTestLogSubTab).toBeVisible({ timeout: 20000 });
        throw new Error('Generate Test Log panel has not rendered yet');
      }
    }).toPass({ timeout: 90000, intervals: [2000, 3000, 5000] });
    await expect(this.generateTestLogSubTab).toHaveClass(/active/);
    await expect(this.testCaseInput).toBeVisible();
  }

  // ─── Left-panel collapse / expand (BE_TC_005) ───────────────────────────────

  /** The left panel renders `.gtl-module-selection.collapsed` (≈56px) when collapsed, else ≈350px. */
  async isSidebarCollapsed(): Promise<boolean> {
    return (await this.modulePanel.getAttribute('class') ?? '').includes('collapsed');
  }

  async getPanelWidth(): Promise<number> {
    return this.modulePanel.evaluate((el) => Math.round(el.getBoundingClientRect().width));
  }

  /** Width of the Test Run grid (its header row spans the full table) — grows when sidebar collapses. */
  async getGridWidth(): Promise<number> {
    return this.gridRows.first().evaluate((el) => Math.round(el.getBoundingClientRect().width));
  }

  /** Clicks the sidebar collapse/expand control and waits for the collapsed state to flip. */
  async toggleSidebar(): Promise<void> {
    const before = await this.isSidebarCollapsed();
    await this.sidebarToggle.click();
    await expect.poll(() => this.isSidebarCollapsed(), { timeout: 10000 }).toBe(!before);
  }

  async collapseSidebar(): Promise<void> {
    if (!(await this.isSidebarCollapsed())) await this.toggleSidebar();
    expect(await this.isSidebarCollapsed()).toBe(true);
  }

  async expandSidebar(): Promise<void> {
    if (await this.isSidebarCollapsed()) await this.toggleSidebar();
    expect(await this.isSidebarCollapsed()).toBe(false);
  }

  // ─── Left panel ───────────────────────────────────────────────────────────

  /** Release nodes in the tree (each `.releases` row under the `.sidebar-tree`). */
  releaseNodes(): Locator {
    return this.releaseTree.locator('.releases');
  }

  async getReleaseNames(): Promise<string[]> {
    return (await this.releaseNodes().allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  async getProjectsValue(): Promise<string> {
    return (await this.projectsInput.inputValue()).trim();
  }

  /** Opens the Projects dropdown and returns the option names (closes it again afterwards). */
  async getProjectOptions(): Promise<string[]> {
    await this.projectsInput.click();
    const items = this.page.locator('.searchable-dropdown-item');
    await expect(items.first()).toBeVisible({ timeout: 10000 });
    const names = (await items.allInnerTexts()).map(t => t.trim()).filter(Boolean);
    await this.page.keyboard.press('Escape').catch(() => undefined);
    return names;
  }

  /** Selects a different Project from the dropdown and waits for its value to update. */
  async selectProject(name: string): Promise<void> {
    await this.projectsInput.click();
    await this.page.locator('.searchable-dropdown-item').filter({ hasText: name }).first().click();
    await expect(this.projectsInput).toHaveValue(name, { timeout: 15000 });
  }

  /**
   * Ensures `name` is the selected Project. The Bulk Execution panel defaults to a different project
   * ("SET Dealer CRM") under UATNext Dev, so the Testdata_Module data the specs exercise must be
   * selected explicitly rather than assumed pre-selected. Waits for the Release tree to re-render with
   * `expectedRelease` (the tree reloads asynchronously after the dropdown value updates).
   */
  async ensureProjectSelected(name: string, expectedRelease: string): Promise<void> {
    if ((await this.getProjectsValue()) !== name) await this.selectProject(name);
    await expect.poll(() => this.getReleaseNames(), { timeout: 20000 }).toContain(expectedRelease);
  }

  /** Clicks a Release node by name and waits for its Test Run grid to load. */
  async selectRelease(name: string): Promise<void> {
    await this.releaseTree.getByText(name, { exact: true }).click();
    await expect(this.gridRows.first()).toBeVisible({ timeout: 30000 });
  }

  // ─── Tree expansion: Release → Cycle → Sub-cycle → Suite ────────────────────

  /** Cycle nodes (`.test-cycle-row`, icon fa-sync-alt) currently rendered in the tree. */
  cycleNodes(): Locator { return this.releaseTree.locator('.test-cycle-row'); }
  /** Suite leaf nodes (`.test-suite-row`, icon fa-diagram-project). */
  suiteNodes(): Locator { return this.releaseTree.locator('.test-suite-row'); }

  async getCycleNames(): Promise<string[]> {
    return (await this.cycleNodes().allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /** Clicks the expand chevron of a Release node and waits for its child list to mount. */
  async expandRelease(name: string): Promise<void> {
    const node = this.releaseNodes().filter({ hasText: name }).first();
    await node.locator('.toggle-icon').first().click();
    // The child <ul> mounts under the node's <li>; cycles (if any) appear shortly after.
    await this.page.waitForTimeout(1500);
  }

  /** Clicks the expand chevron of a Cycle node and waits for its child list to mount. */
  async expandCycle(name: string): Promise<void> {
    const node = this.cycleNodes().filter({ hasText: name }).first();
    await expect(node).toBeVisible({ timeout: 20000 });
    await node.locator('.toggle-icon').first().click();
    await this.page.waitForTimeout(1500);
  }

  /** Clicks a Cycle node's label to load its (cycle-scoped) Test Run grid. */
  async selectCycle(name: string): Promise<void> {
    const node = this.cycleNodes().filter({ hasText: name }).first();
    await expect(node).toBeVisible({ timeout: 20000 }); // wait for the async cycle list to mount
    await node.getByText(name, { exact: true }).click();
    await expect(this.gridRows.first()).toBeVisible({ timeout: 30000 });
  }

  /** Clicks a Suite leaf node to load its (suite-scoped) Test Run grid. */
  async selectSuite(name: string): Promise<void> {
    const node = this.suiteNodes().filter({ hasText: name }).first();
    await expect(node).toBeVisible({ timeout: 20000 });
    await node.click();
    await expect(this.gridRows.first()).toBeVisible({ timeout: 30000 });
  }

  /** Convenience: expand a Release → Cycle and load that cycle's grid (the grid the pagination /
   *  sort / checkbox specs operate on — it carries a mix of eligible + non-eligible rows). */
  async openCycleGrid(release: string, cycle: string): Promise<void> {
    await this.expandRelease(release);
    await this.expandCycle(cycle);
    await this.selectCycle(cycle);
    await this.verifyTestRunGridLoaded();
  }

  async verifyCycleActive(name: string): Promise<void> {
    await expect(this.cycleNodes().filter({ hasText: name }).first()).toHaveClass(/active/);
  }

  async verifySuiteActive(name: string): Promise<void> {
    await expect(this.suiteNodes().filter({ hasText: name }).first()).toHaveClass(/active/);
  }

  // ─── Right panel / grid ─────────────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return this.gridRows.count();
  }

  /** Number of data rows (the header row is itself a `.gtl-testlistrow`, so it is excluded here). */
  async getDataRowCount(): Promise<number> {
    return this.dataRows.count();
  }

  /** Column header labels (left-to-right) from the grid header row. */
  async getColumnHeaders(): Promise<string[]> {
    await expect(this.headerRow).toBeVisible({ timeout: 30000 });
    return (await this.headerRow.locator('.gtl-text-wrapper-15').allInnerTexts())
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /** Whether the header row exposes the leading (select-all) checkbox cell. */
  async hasCheckboxColumn(): Promise<boolean> {
    return (await this.headerRow.locator('.gtl-header-checkbox').count()) > 0;
  }

  /** Status values (e.g. Passed / Unexecuted) across all visible data rows. */
  async getStatusValues(): Promise<string[]> {
    return (await this.dataRows.locator('.gtl-status-cell .gtl-text-wrapper-16').allInnerTexts())
      .map(t => t.trim()).filter(Boolean);
  }

  /**
   * Structured cell values for each visible data row (used to assert each value maps to its column).
   * Test Run ID + Test Case PID share `.gtl-test-run-pid-cell` (in that order); Assign To + Business
   * User share `.gtl-assignto-cell` (in that order).
   */
  async getRows(): Promise<Array<{
    runId: string; pid: string; version: string; name: string;
    status: string; date: string; assignedTo: string; businessUser: string;
  }>> {
    const n = await this.dataRows.count();
    const rows = [];
    for (let i = 0; i < n; i++) {
      const r = this.dataRows.nth(i);
      const pidCells = r.locator('.gtl-test-run-pid-cell');
      const assignCells = r.locator('.gtl-assignto-cell');
      const txt = async (loc: Locator) => (await loc.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      rows.push({
        runId:        await txt(pidCells.nth(0)),
        pid:          await txt(pidCells.nth(1)),
        version:      await txt(r.locator('.gtl-testcase-version-cell')),
        name:         await txt(r.locator('.gtl-name-cell')),
        status:       await txt(r.locator('.gtl-status-cell')),
        date:         await txt(r.locator('.gtl-execution-date-cell')),
        assignedTo:   await txt(assignCells.nth(0)),
        businessUser: await txt(assignCells.nth(1)),
      });
    }
    return rows;
  }

  /**
   * Waits until the grid's Test Run IDs differ from `prevIds`. When switching between nodes (suite →
   * suite, cycle → cycle) the previous node's rows stay visible until the new data streams in, so a
   * plain "rows visible" wait returns on the stale grid — poll here until the run set actually changes.
   */
  async waitForRunIdsChangedFrom(prevIds: string[]): Promise<void> {
    await expect.poll(() => this.getTestRunIds(), { timeout: 30000 }).not.toEqual(prevIds);
  }

  /** Test Run ID values across visible data rows (the first PID cell of each row). */
  async getTestRunIds(): Promise<string[]> {
    const n = await this.dataRows.count();
    const ids: string[] = [];
    for (let i = 0; i < n; i++) {
      ids.push((await this.dataRows.nth(i).locator('.gtl-test-run-pid-cell').first().innerText()).trim());
    }
    return ids;
  }

  /** Computed text colour of each row's Test Case Version cell (used for mismatch colour coding). */
  async getVersionCellColors(): Promise<string[]> {
    const cells = this.dataRows.locator('.gtl-testcase-version-cell .gtl-text-wrapper-18');
    const n = await cells.count();
    const colors: string[] = [];
    for (let i = 0; i < n; i++) {
      colors.push(await cells.nth(i).evaluate(el => getComputedStyle(el).color));
    }
    return colors;
  }

  async getTotalEntriesText(): Promise<string> {
    return (await this.paginationText.innerText()).trim();
  }

  /** Parses the integer out of "Total N Entries". */
  async getTotalEntriesCount(): Promise<number> {
    const m = (await this.getTotalEntriesText()).match(/\d+/);
    return m ? parseInt(m[0], 10) : NaN;
  }

  /** Eligible (log-creatable) rows — those whose checkbox is enabled (no existing test log). */
  eligibleCheckboxes(): Locator {
    return this.dataRows.locator('.gtl-checkbox-cell input[type="checkbox"]:not([disabled])');
  }

  async getEligibleRowCount(): Promise<number> {
    return this.eligibleCheckboxes().count();
  }

  async selectFirstEligibleRow(): Promise<void> {
    await this.eligibleCheckboxes().first().check();
  }

  async deselectFirstEligibleRow(): Promise<void> {
    await this.eligibleCheckboxes().first().uncheck();
  }

  // ─── Row / master checkbox + eligibility (blank Execution Date) ──────────────

  /** Per-row selection model: eligible (blank date / enabled checkbox), checked, run id, date. */
  async getRowSelectionStates(): Promise<Array<{ runId: string; date: string; eligible: boolean; checked: boolean }>> {
    const n = await this.dataRows.count();
    const out = [];
    for (let i = 0; i < n; i++) {
      const r = this.dataRows.nth(i);
      const cb = r.locator('.gtl-checkbox-cell input');
      out.push({
        runId: (await r.locator('.gtl-test-run-pid-cell').first().innerText()).trim(),
        date:  (await r.locator('.gtl-execution-date-cell').innerText()).replace(/\s+/g, ' ').trim(),
        eligible: !(await cb.isDisabled()),
        checked:  await cb.isChecked(),
      });
    }
    return out;
  }

  /** First row whose checkbox is enabled (blank Execution Date). */
  firstEligibleRow(): Locator {
    return this.dataRows.filter({ has: this.page.locator('.gtl-checkbox-cell input:not([disabled])') }).first();
  }

  /** First row whose checkbox is disabled (an existing log — "Testlog exists"). */
  firstTestlogExistsRow(): Locator {
    return this.dataRows.filter({ has: this.page.locator('.gtl-checkbox-cell input[disabled]') }).first();
  }

  /** The title/tooltip on a disabled row's checkbox (the "Testlog exists" indicator). */
  async getDisabledCheckboxTitle(row: Locator): Promise<string> {
    return (await row.locator('.gtl-checkbox-cell input').getAttribute('title')) ?? '';
  }

  async isMasterCheckboxEnabled(): Promise<boolean> {
    return !(await this.masterCheckbox.isDisabled());
  }

  /** Ticks the master (select-all) checkbox and waits for the row selection to apply (Blazor lags). */
  async clickMasterCheckbox(): Promise<void> {
    await this.masterCheckbox.check();
    await expect.poll(async () => (await this.getRowSelectionStates()).some(s => s.checked),
      { timeout: 10000 }).toBe(true);
  }

  /** Unticks the master checkbox and waits until no data row is checked. */
  async uncheckMasterCheckbox(): Promise<void> {
    await this.masterCheckbox.uncheck();
    await expect.poll(async () => (await this.getRowSelectionStates()).every(s => !s.checked),
      { timeout: 10000 }).toBe(true);
  }

  /** A data row located by its Test Run ID. */
  rowByRunId(runId: string): Locator {
    return this.dataRows.filter({ hasText: runId }).first();
  }

  /** Ticks an eligible row's checkbox by Test Run ID. */
  async selectRowByRunId(runId: string): Promise<void> {
    await this.rowByRunId(runId).locator('.gtl-checkbox-cell input').check();
  }

  /**
   * Walks the grid pages from page 1 until it finds a row with a blank Execution Date (an eligible,
   * log-creatable row), leaving the grid on the page where it was found. Returns that row's Test Run
   * ID, or '' if no blank-date row exists on any page. Assumes the grid is currently on page 1.
   */
  async findFirstEmptyExecutionDateRow(): Promise<string> {
    const totalPages = await this.getTotalPages();
    for (let p = 1; p <= totalPages; p++) {
      const hit = (await this.getRowSelectionStates()).find(s => s.date === '' && s.eligible);
      if (hit) return hit.runId;
      if (p < totalPages) await this.goToNextPage();
    }
    return '';
  }

  /**
   * Pages from page 1 to find the first blank-Execution-Date eligible row whose Test Case Version
   * renders in `color` (e.g. the RED version-mismatch colour), leaving the grid on the page where it
   * was found. Returns that row's Test Run ID, or '' if none exists. Assumes the grid is on page 1.
   */
  async findFirstEligibleRowWithVersionColor(color: string): Promise<string> {
    const totalPages = await this.getTotalPages();
    for (let p = 1; p <= totalPages; p++) {
      const states = await this.getRowSelectionStates();
      const colors = await this.getVersionCellColors();
      for (let i = 0; i < states.length; i++) {
        if (states[i].date === '' && states[i].eligible && colors[i] === color) return states[i].runId;
      }
      if (p < totalPages) await this.goToNextPage();
    }
    return '';
  }

  /**
   * Pages from page 1 for an eligible (blank-date) run, PREFERRING one whose Test Case Version renders
   * in `preferColor` (e.g. the RED mismatch colour) but falling back to any eligible run when none of
   * that colour exists (e.g. the scarce mismatched data has been consumed). Leaves the grid on the page
   * of the returned run so it can be selected. Returns the run id and whether it matched the preferred
   * colour; runId is '' when no eligible run exists anywhere. Assumes the grid starts on page 1.
   */
  async findEligibleRowPreferringColor(preferColor: string): Promise<{ runId: string; matchedPreferred: boolean }> {
    const totalPages = await this.getTotalPages();
    let fallbackId = '', fallbackPage = 0;
    for (let p = 1; p <= totalPages; p++) {
      const states = await this.getRowSelectionStates();
      const colors = await this.getVersionCellColors();
      for (let i = 0; i < states.length; i++) {
        if (states[i].date !== '' || !states[i].eligible) continue;
        if (colors[i] === preferColor) return { runId: states[i].runId, matchedPreferred: true };
        if (!fallbackId) { fallbackId = states[i].runId; fallbackPage = p; }
      }
      if (p < totalPages) await this.goToNextPage();
    }
    // No preferred-colour run found; page back to the fallback's page so it can be selected.
    if (fallbackId) {
      while ((await this.getCurrentPage()) > fallbackPage) await this.goToPreviousPage();
    }
    return { runId: fallbackId, matchedPreferred: false };
  }

  /**
   * Pages from page 1 to find a SINGLE grid page that holds at least `count` eligible (blank-date) rows
   * whose Test Case Version renders in `color`, leaving the grid on that page (so all can be selected
   * without relying on cross-page selection). Returns those run ids, or null if no single page has
   * enough. Using the matched/BLACK colour keeps a bulk action off the version-mismatch path.
   */
  async findPageWithEligibleRowsOfColor(color: string, count = 2): Promise<string[] | null> {
    const totalPages = await this.getTotalPages();
    for (let p = 1; p <= totalPages; p++) {
      const states = await this.getRowSelectionStates();
      const colors = await this.getVersionCellColors();
      const hits: string[] = [];
      for (let i = 0; i < states.length; i++) {
        if (states[i].date === '' && states[i].eligible && colors[i] === color) hits.push(states[i].runId);
        if (hits.length === count) return hits;
      }
      if (p < totalPages) await this.goToNextPage();
    }
    return null;
  }

  // ─── CREATE LOG action ──────────────────────────────────────────────────────

  /** Clicks the (enabled) CREATE LOG button. Toasts are transient, so do not wait for navigation. */
  async clickCreateLog(): Promise<void> {
    await this.createLogButton.click({ noWaitAfter: true });
  }

  /** A notification/toast (`.notification`) whose text matches `message` (transient). */
  notification(message: RegExp): Locator {
    return this.page.locator('.notification').filter({ hasText: message }).first();
  }

  // ─── Pagination ─────────────────────────────────────────────────────────────

  private navButton(alt: 'First Page' | 'Previous' | 'Next' | 'Last Page'): Locator {
    return this.pagination.locator(`img[alt="${alt}"]`);
  }

  async getCurrentPage(): Promise<number> {
    return parseInt((await this.pageNumber.innerText()).trim(), 10);
  }

  async isNavDisabled(alt: 'First Page' | 'Previous' | 'Next' | 'Last Page'): Promise<boolean> {
    return (await this.navButton(alt).getAttribute('class') ?? '').includes('disabled');
  }

  /**
   * Clicks a pagination control and waits for the new page to actually render. The page-number
   * indicator updates BEFORE the grid rows stream in, so waiting on the number alone leaves the
   * previous page's rows on screen — also wait for the run set to change.
   */
  private async navigateTo(alt: 'First Page' | 'Previous' | 'Next' | 'Last Page', expectedPage: number): Promise<void> {
    const before = await this.getTestRunIds();
    await this.navButton(alt).click();
    await expect.poll(() => this.getCurrentPage(), { timeout: 20000 }).toBe(expectedPage);
    await expect.poll(() => this.getTestRunIds(), { timeout: 20000 }).not.toEqual(before);
  }

  async goToNextPage(): Promise<void>     { await this.navigateTo('Next', (await this.getCurrentPage()) + 1); }
  async goToPreviousPage(): Promise<void> { await this.navigateTo('Previous', (await this.getCurrentPage()) - 1); }
  async goToFirstPage(): Promise<void>    { await this.navigateTo('First Page', 1); }
  async goToLastPage(): Promise<void>     { await this.navigateTo('Last Page', await this.getTotalPages()); }

  /** Total pages = ceil(total entries / rows on a full first page). */
  async getTotalPages(): Promise<number> {
    const total = await this.getTotalEntriesCount();
    const perPage = await this.getDataRowCount();
    return perPage > 0 ? Math.ceil(total / perPage) : 1;
  }

  // ─── Sorting ────────────────────────────────────────────────────────────────

  /** Header cell selector for a sortable column. */
  private sortColumn(column: 'runId' | 'pid' | 'date'): Locator {
    const map = {
      runId: this.headerRow.locator('.gtl-header-testrun-pid').first(),
      pid:   this.headerRow.locator('.gtl-header-testrun-pid').nth(1),
      date:  this.headerRow.locator('.gtl-header-execution-date'),
    } as const;
    return map[column];
  }

  /** Clicks a column's sort control and waits for the grid to reorder. */
  async clickSort(column: 'runId' | 'pid' | 'date'): Promise<void> {
    const before = await this.getTestRunIds();
    await this.sortColumn(column).locator('.sort-icon img').click();
    await expect.poll(() => this.getTestRunIds(), { timeout: 20000 }).not.toEqual(before);
  }

  /** Sort direction shown by a column's icon: 'asc' | 'desc' (from sort-asc.svg / sort-desc.svg). */
  async getSortDirection(column: 'runId' | 'pid' | 'date'): Promise<'asc' | 'desc'> {
    const src = await this.sortColumn(column).locator('.sort-icon img').getAttribute('src') ?? '';
    return src.includes('sort-asc') ? 'asc' : 'desc';
  }

  /** Numeric value of a TR-id (e.g. "TR-1360" → 1360) for ordering assertions. */
  static trNum(id: string): number {
    const m = id.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : NaN;
  }

  async isCreateLogDisabled(): Promise<boolean> {
    return this.createLogButton.evaluate(
      (el) => (el as HTMLButtonElement).disabled || el.className.includes('disabled'),
    );
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async verifyCoordinatorTabActive(): Promise<void> {
    await expect(this.coordinatorTab).toHaveClass(/active/);
    await expect(this.coordinatorTab).toHaveAttribute('aria-current', 'page');
  }

  async verifySubTabsVisible(): Promise<void> {
    await expect(this.generateTestLogSubTab).toBeVisible({ timeout: 20000 });
    await expect(this.bulkExecutionSubTab).toBeVisible({ timeout: 20000 });
    // Both sub-tabs live in the same `.sidebar-tabs` container (i.e. rendered together / aligned).
    await expect(this.page.locator('.sidebar-tabs button.sidebar-tab')).toHaveCount(2);
  }

  async verifyGenerateTestLogActive(): Promise<void> {
    await expect(this.generateTestLogSubTab).toHaveClass(/active/);
  }

  async verifyGenerateTestLogInactive(): Promise<void> {
    await expect(this.generateTestLogSubTab).not.toHaveClass(/active/);
  }

  async verifyBulkExecutionActive(): Promise<void> {
    await expect(this.bulkExecutionSubTab).toHaveClass(/active/);
  }

  async verifyBulkExecutionInactive(): Promise<void> {
    await expect(this.bulkExecutionSubTab).not.toHaveClass(/active/);
  }

  /** Generate Test Log sub-tab active and its left panel (Test Case search) rendered without errors. */
  async verifyGenerateTestLogScreenLoaded(): Promise<void> {
    await expect(this.generateTestLogSubTab).toHaveClass(/active/);
    await expect(this.testCaseInput).toBeVisible();
  }

  async verifyLeftPanelDisplayed(): Promise<void> {
    await expect(this.projectsInput).toBeVisible();
    await expect(this.releaseTree).toBeVisible();
  }

  /** Before a Release is selected, the right panel shows no Test Run grid. */
  async verifyRightPanelEmpty(): Promise<void> {
    await expect(this.gridRows).toHaveCount(0);
  }

  async verifyProjectSelected(): Promise<void> {
    await expect(this.projectsInput).toHaveValue(/\S/, { timeout: 15000 });
  }

  async verifyReleasesVisible(): Promise<void> {
    expect((await this.getReleaseNames()).length).toBeGreaterThan(0);
  }

  async verifyTestRunGridLoaded(): Promise<void> {
    await expect(this.gridRows.first()).toBeVisible({ timeout: 30000 });
    expect(await this.getRowCount()).toBeGreaterThan(0);
  }

  async verifyCreateLogVisibleAndDisabled(): Promise<void> {
    await expect(this.createLogButton).toBeVisible();
    expect(await this.isCreateLogDisabled()).toBe(true);
  }

  async verifyCreateLogEnabled(): Promise<void> {
    await expect.poll(() => this.isCreateLogDisabled(), { timeout: 10000 }).toBe(false);
  }

  async verifyCreateLogDisabled(): Promise<void> {
    await expect.poll(() => this.isCreateLogDisabled(), { timeout: 10000 }).toBe(true);
  }

  /** Grid columns match the expected ordered labels and the leading checkbox column is present. */
  async verifyGridColumns(expected: string[]): Promise<void> {
    await expect(this.headerRow).toBeVisible({ timeout: 30000 });
    expect(await this.hasCheckboxColumn()).toBe(true);
    expect(await this.getColumnHeaders()).toEqual(expected);
  }

  /** Every status value in the grid is one of the build's valid Status options (no blank/corrupt). */
  async verifyStatusValuesValid(validValues: string[]): Promise<void> {
    const statuses = await this.getStatusValues();
    expect(statuses.length).toBeGreaterThan(0);
    for (const s of statuses) {
      expect(s, `unexpected status value "${s}"`).not.toBe('');
      expect(validValues, `unexpected status value "${s}"`).toContain(s);
    }
  }

  /**
   * Version-mismatch colour coding: at least one row's Version is RED (mismatch) and any non-red row
   * uses the normal text token (the build's "black"), never an unexpected colour. Returns the
   * per-colour counts so a spec can additionally assert both states are present.
   */
  async verifyVersionMismatchColorCoding(redColor: string, normalColor: string): Promise<{ red: number; normal: number }> {
    const colors = await this.getVersionCellColors();
    expect(colors.length).toBeGreaterThan(0);
    let red = 0, normal = 0;
    for (const c of colors) {
      if (c === redColor) red++;
      else if (c === normalColor) normal++;
      else expect(c, `unexpected version colour "${c}" (not RED or normal)`).toBe(normalColor);
    }
    return { red, normal };
  }

  /**
   * Each row's data maps to its correct column (no data in the wrong column): Test Run ID is a TR-id,
   * Test Case PID a TC-id, Version numeric, Name non-empty, Status a valid value, Execution Date a
   * date (or blank for not-yet-executed/log-eligible rows).
   */
  async verifyRowDataMapping(validStatuses: string[]): Promise<void> {
    const rows = await this.getRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.runId, 'Test Run ID column').toMatch(/^TR-\d+$/);
      expect(row.pid, 'Test Case PID column').toMatch(/^TC-\d+$/);
      expect(row.version, 'Test Case Version column').toMatch(/^\d+(\.\d+)?$/);
      expect(row.name.length, 'Name column').toBeGreaterThan(0);
      expect(validStatuses, `Status column value "${row.status}"`).toContain(row.status);
      expect(row.date === '' || /^\d{2}\/\d{2}\/\d{4}/.test(row.date), `Execution Date "${row.date}"`).toBeTruthy();
    }
  }

  /** Left panel rendered cleanly: Projects label + dropdown + Release tree visible, none zero-sized. */
  async verifyLeftPanelRendersCleanly(): Promise<void> {
    await expect(this.projectsLabel).toBeVisible();
    await expect(this.projectsInput).toBeVisible();
    await expect(this.releaseTree).toBeVisible();
    await expect(this.sidebarToggle).toBeVisible();
    // Each release node must have a visible label and an expand/collapse chevron (no broken rows).
    const nodes = this.releaseNodes();
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(nodes.nth(i)).toBeVisible();
      await expect(nodes.nth(i).locator('.toggle-icon')).toBeVisible();
    }
  }
}
