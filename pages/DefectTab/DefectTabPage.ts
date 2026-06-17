import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object for the Defect tab.
 *
 * Layout (verified against the live app):
 *  - Left filter panel: `.defect-modals`. Each filter is an `.input-with-label` group whose
 *    label is a `<span class="div">`. SEARCH / CLEAR are `<button>`s that stay **disabled**
 *    until a filter value is entered. The filters are searchable dropdowns
 *    (`input.searchable-dropdown-input`, placeholder "Please Select") except Summary/Defect ID
 *    (`input.content-2`) and the two date fields (`#submittedAfter` / `#submittedBefore`).
 *    Dropdown options render as `.searchable-dropdown-item` inside the group's
 *    `.searchable-dropdown-list`; the current value's item carries the `selected` class and a
 *    no-match query shows a "No results found" entry alongside the "Please Select" item.
 *  - Right panel: `.test-execution-frame-2`. CREATE DEFECT button (`#createTestCaseButton`),
 *    a resizable-column grid whose header labels are `.text-wrapper-15` and whose data rows
 *    each expose a Defect-ID cell `.text-wrapper-14[title="DF-…"]`. Pagination lives in
 *    `.PaginationTest` (total `.pagination-text`, page number `.text-wrapper-9`,
 *    First/Previous/Next/Last `<img>`s). The empty grid shows a no-defects message.
 */
export class DefectTabPage {
  private readonly page: Page;

  // Tab link
  readonly defectTabLink: Locator;

  // Sidebar filter panel
  readonly sidebar: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly summaryDefectIdInput: Locator;
  readonly projectsDropdown: Locator;
  readonly affectedReleaseDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly teamDropdown: Locator;
  readonly severityDropdown: Locator;
  readonly priorityDropdown: Locator;
  readonly assignedToDropdown: Locator;
  readonly businessUserDropdown: Locator;
  readonly createdByDropdown: Locator;
  readonly submittedAfterInput: Locator;
  readonly submittedBeforeInput: Locator;

  // Right panel
  readonly mainArea: Locator;
  readonly createDefectButton: Locator;
  readonly headerLabels: Locator;
  readonly defectIdCells: Locator;
  readonly noDefectsMessage: Locator;
  readonly pagination: Locator;
  readonly paginationSummary: Locator;
  readonly pageNumber: Locator;
  readonly firstPageButton: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly lastPageButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.defectTabLink = page.getByRole('link', { name: 'DEFECT' });

    // ── Sidebar ──────────────────────────────────────────────────────────────
    this.sidebar              = page.locator('.defect-modals');
    this.searchButton         = page.getByRole('button', { name: 'SEARCH' });
    this.clearButton          = page.getByRole('button', { name: 'CLEAR' });
    this.summaryDefectIdInput = page.getByRole('textbox', { name: /Enter summary or defect ID/ });

    this.projectsDropdown        = this.sidebarInput('Projects');
    this.affectedReleaseDropdown = this.sidebarInput('Affected Release');
    this.statusDropdown          = this.sidebarInput('Status');
    this.teamDropdown            = this.sidebarInput('Team');
    this.severityDropdown        = this.sidebarInput('Severity');
    this.priorityDropdown        = this.sidebarInput('Priority');
    this.assignedToDropdown      = this.sidebarInput('Assigned To');
    this.businessUserDropdown    = this.sidebarInput('Business User');
    this.createdByDropdown       = this.sidebarInput('Created By');
    this.submittedAfterInput     = page.locator('#submittedAfter');
    this.submittedBeforeInput    = page.locator('#submittedBefore');

    // ── Right panel ──────────────────────────────────────────────────────────
    this.mainArea           = page.locator('.test-execution-frame-2');
    this.createDefectButton = page.getByRole('button', { name: 'CREATE DEFECT' });
    this.headerLabels       = this.mainArea.locator('.text-wrapper-15');
    this.defectIdCells      = this.mainArea.locator('.text-wrapper-14');
    this.noDefectsMessage   = this.mainArea.getByText('No defects found. Use the filters to search for defects.');

    this.pagination        = page.locator('.PaginationTest');
    this.paginationSummary = this.pagination.locator('.pagination-text');
    this.pageNumber        = this.pagination.locator('.text-wrapper-9');
    this.firstPageButton   = this.pagination.getByAltText('First Page', { exact: true });
    this.previousButton    = this.pagination.getByAltText('Previous', { exact: true });
    this.nextButton        = this.pagination.getByAltText('Next', { exact: true });
    this.lastPageButton    = this.pagination.getByAltText('Last Page', { exact: true });
  }

  // ─── Sidebar field helpers ────────────────────────────────────────────────

  /** The `.input-with-label` group in the sidebar whose label span exactly matches `label`. */
  sidebarField(label: string): Locator {
    return this.sidebar
      .locator('.input-with-label')
      .filter({ has: this.page.getByText(label, { exact: true }) });
  }

  /** The input control inside the named sidebar field. */
  sidebarInput(label: string): Locator {
    return this.sidebarField(label).locator('input');
  }

  // ─── Navigation / load ────────────────────────────────────────────────────

  async open(): Promise<void> {
    await this.defectTabLink.click();
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForURL(/\/defect/);
    await this.mainArea.waitFor({ state: 'visible' });
    await this.createDefectButton.waitFor({ state: 'visible' });
    await this.headerLabels.first().waitFor({ state: 'visible' });
    await this.paginationSummary.waitFor({ state: 'visible' });
  }

  /**
   * Ensures the defect grid is populated. On a cold load the Defect tab can be opened
   * before the project context is established and render an empty grid that does not
   * recover on its own; a reload re-runs the defect query against the now-warm context
   * and brings the seeded defects in. Retries the reload a few times before giving up.
   */
  async ensureDefectsLoaded(maxAttempts = 3): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.waitForResults(30000);
      if ((await this.getDefectRowCount()) > 0) return;

      await this.page.reload();
      await this.waitForPageLoad();
    }
    await expect(this.defectIdCells.first()).toBeVisible({ timeout: 30000 });
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  async getTotalEntries(): Promise<number> {
    const text = (await this.paginationSummary.innerText()).trim();
    const match = text.match(/Total\s+(\d+)\s+Entries/i);
    return match ? Number(match[1]) : 0;
  }

  async getPaginationText(): Promise<string> {
    return (await this.paginationSummary.innerText()).trim();
  }

  async getDefectRowCount(): Promise<number> {
    return this.defectIdCells.count();
  }

  async getDefectIdsOnPage(): Promise<string[]> {
    const count = await this.defectIdCells.count();
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = (await this.defectIdCells.nth(i).getAttribute('title')) ?? '';
      if (id) ids.push(id.trim());
    }
    return ids;
  }

  async getFirstDefectId(): Promise<string> {
    return (await this.defectIdCells.first().getAttribute('title'))?.trim() ?? '';
  }

  /** Reads the Summary cell (2nd column) of the data row that owns the given Defect ID. */
  async getSummaryForDefect(defectId: string): Promise<string> {
    const row = this.mainArea
      .locator('.testlistrow')
      .filter({ has: this.page.locator(`.text-wrapper-14[title="${defectId}"]`) });
    return (await row.locator('p').first().innerText()).trim();
  }

  async getColumnHeaders(): Promise<string[]> {
    return (await this.headerLabels.allInnerTexts()).map(t => t.trim());
  }

  /** Opens the New Defect form via the right-panel CREATE DEFECT button. */
  async openCreateDefectForm(): Promise<void> {
    await this.createDefectButton.click();
    await this.page.locator('.defect-breadcrumbs').waitFor({ state: 'visible', timeout: 20000 });
  }

  /** Opens an existing defect's details by clicking its Defect-ID cell. */
  async openDefectById(defectId: string): Promise<void> {
    await this.mainArea.locator(`.text-wrapper-14[title="${defectId}"]`).click();
    await this.page.locator('.defect-breadcrumbs').waitFor({ state: 'visible', timeout: 20000 });
  }

  async getCurrentPageNumber(): Promise<number> {
    return Number((await this.pageNumber.innerText()).trim());
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async fillSummaryOrId(value: string): Promise<void> {
    // Blazor enables SEARCH off the input's change binding. A plain `fill()` raises `input` but not
    // always `change` (notably right after the grid re-renders following a create), which can leave
    // SEARCH disabled. Clearing then typing real keystrokes generates the trusted input/change
    // events Blazor reliably handles, so the button enables; a final dispatch is belt-and-braces.
    await this.summaryDefectIdInput.click();
    await this.summaryDefectIdInput.fill('');
    await this.summaryDefectIdInput.pressSequentially(value, { delay: 10 });
    await this.summaryDefectIdInput.evaluate((el) => {
      el.dispatchEvent(new Event('change', { bubbles: true }));
      (el as HTMLElement).blur();
    });
  }

  /** Clicks SEARCH (must be enabled) and waits for the grid to settle on results or the empty state. */
  async clickSearch(): Promise<void> {
    await expect(this.searchButton).toBeEnabled();
    await this.searchButton.click();
    // The grid re-queries over SignalR and keeps the previous rows mounted until the
    // new result set streams in. Give that re-render a moment before reading results,
    // so assertions don't latch onto the stale (pre-filter) rows.
    await this.page.waitForTimeout(2000);
    await this.waitForResults();
  }

  async clickClear(): Promise<void> {
    await expect(this.clearButton).toBeEnabled();
    await this.clearButton.click();
    await this.waitForResults();
  }

  async searchBySummaryOrId(value: string): Promise<void> {
    await this.fillSummaryOrId(value);
    await this.clickSearch();
  }

  /**
   * Searches by an (assumed unique) summary and returns the matching defect's ID, RE-ISSUING the
   * search until the grid actually settles on the filtered result. This is deliberately robust for
   * just-created defects: (a) the grid keeps the previous (stale) rows mounted while the filtered set
   * streams in over SignalR, and (b) a freshly-created defect can take a few seconds to become
   * searchable in qTest. Each attempt clears the box and re-types the summary so Blazor re-binds the
   * value (re-typing the same text would not re-enable SEARCH), then checks the first row's summary.
   */
  async searchAndGetDefectIdBySummary(summary: string): Promise<string> {
    await expect(async () => {
      await this.fillSummaryOrId(summary);
      await this.clickSearch();
      const id = await this.getFirstDefectId();
      expect(id).toMatch(/^DF-\d+$/);
      expect(await this.getSummaryForDefect(id)).toContain(summary);
    }).toPass({ timeout: 90000, intervals: [3000, 5000, 8000] });
    return this.getFirstDefectId();
  }

  /** Waits until the grid has either at least one defect row or the no-defects message. */
  async waitForResults(timeout = 15000): Promise<void> {
    await expect(async () => {
      const rows  = await this.defectIdCells.count();
      const empty = await this.noDefectsMessage.isVisible().catch(() => false);
      expect(rows > 0 || empty).toBeTruthy();
    }).toPass({ timeout });
  }

  /** Opens the named searchable dropdown if it is not already open. */
  async openDropdown(label: string): Promise<void> {
    const list = this.sidebarField(label).locator('.searchable-dropdown-list');
    if (!(await list.isVisible().catch(() => false))) {
      await this.sidebarInput(label).click();
      await list.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  async getDropdownOptions(label: string): Promise<string[]> {
    await this.openDropdown(label);
    return (await this.sidebarField(label).locator('.searchable-dropdown-item').allInnerTexts())
      .map(t => t.trim());
  }

  /** Opens the named dropdown and selects the option whose text exactly matches `value`. */
  async selectDropdownValue(label: string, value: string): Promise<void> {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const field = this.sidebarField(label);
    const list = field.locator('.searchable-dropdown-list');
    const item = field.locator('.searchable-dropdown-item').filter({ hasText: new RegExp(`^${escaped}$`) });

    // The options stream in from qTest when the dropdown opens; under load that fetch can
    // briefly return nothing ("No results found"). (Re)open and wait until the target
    // option is actually present, toggling closed between attempts so each pass re-fetches.
    await expect(async () => {
      if (!(await list.isVisible().catch(() => false))) {
        await this.sidebarInput(label).click();
        await list.waitFor({ state: 'visible', timeout: 5000 });
      }
      await this.page.waitForTimeout(500);
      if ((await item.count()) === 0) {
        await this.sidebarInput(label).click().catch(() => {});
        await list.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
        throw new Error(`Dropdown "${label}" has not loaded option "${value}" yet`);
      }
    }).toPass({ timeout: 25000 });

    await item.first().click();
    // The list collapses once a value is committed.
    await expect(this.sidebarInput(label)).toHaveValue(value);
  }

  /** Types a value into the named dropdown's search box without committing a selection. */
  async typeInDropdown(label: string, text: string): Promise<void> {
    await this.openDropdown(label);
    await this.sidebarInput(label).fill(text);
    await this.page.waitForTimeout(800); // let the dropdown re-filter its options
  }

  /**
   * Sets a native date input (Submitted After / Submitted Before) and commits it to the
   * Blazor model. `fill()` alone updates the value but does not raise the `change` event
   * Blazor binds to, so SEARCH stays disabled and no filter is applied — the input/change/
   * blur dispatch below mimics a real user edit so the SEARCH button enables.
   */
  private async setDateField(input: Locator, date: string): Promise<void> {
    await input.fill(date);
    await input.evaluate((el) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      (el as HTMLElement).blur();
    });
    await this.page.waitForTimeout(300);
  }

  async setSubmittedAfter(date: string): Promise<void> {
    await this.setDateField(this.submittedAfterInput, date);
  }

  async setSubmittedBefore(date: string): Promise<void> {
    await this.setDateField(this.submittedBeforeInput, date);
  }

  // ─── Pagination ─────────────────────────────────────────────────────────────

  private static readonly PAGE_SIZE = 10;

  /** Last page number for the current result set (page size 10). */
  async getLastPageNumber(): Promise<number> {
    return Math.ceil((await this.getTotalEntries()) / DefectTabPage.PAGE_SIZE);
  }

  /** A pagination control is disabled when the app renders it with `cursor: default`. */
  async isPaginationControlDisabled(alt: 'First Page' | 'Previous' | 'Next' | 'Last Page'): Promise<boolean> {
    const cursor = await this.pagination
      .getByAltText(alt, { exact: true })
      .evaluate((el) => getComputedStyle(el).cursor);
    return cursor === 'default';
  }

  private async waitForPageNumber(n: number): Promise<void> {
    await expect.poll(() => this.getCurrentPageNumber(), { timeout: 15000 }).toBe(n);
  }

  async goToNextPage(): Promise<void> {
    const current = await this.getCurrentPageNumber();
    await this.nextButton.click();
    await this.waitForPageNumber(current + 1);
  }

  async goToPreviousPage(): Promise<void> {
    const current = await this.getCurrentPageNumber();
    await this.previousButton.click();
    await this.waitForPageNumber(current - 1);
  }

  async goToLastPage(): Promise<void> {
    await this.lastPageButton.click();
    await this.waitForPageNumber(await this.getLastPageNumber());
  }

  async goToFirstPage(): Promise<void> {
    await this.firstPageButton.click();
    await this.waitForPageNumber(1);
  }

  async getDropdownListText(label: string): Promise<string> {
    return (await this.sidebarField(label).locator('.searchable-dropdown-list').innerText()).trim();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async verifyDefectPageDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/defect/);
    await expect(this.defectTabLink).toHaveAttribute('aria-current', 'page');
    await expect(this.mainArea).toBeVisible();
  }

  /** Verifies every left-panel filter control is present (SEARCH/CLEAR may be disabled). */
  async verifyLeftPanelControls(): Promise<void> {
    await expect(this.searchButton).toBeVisible();
    await expect(this.clearButton).toBeVisible();
    await expect(this.projectsDropdown).toBeVisible();
    await expect(this.summaryDefectIdInput).toBeVisible();
    await expect(this.affectedReleaseDropdown).toBeVisible();
    await expect(this.statusDropdown).toBeVisible();
    await expect(this.teamDropdown).toBeVisible();
    await expect(this.severityDropdown).toBeVisible();
    await expect(this.priorityDropdown).toBeVisible();
    await expect(this.assignedToDropdown).toBeVisible();
    await expect(this.businessUserDropdown).toBeVisible();
    await expect(this.createdByDropdown).toBeVisible();
    await expect(this.submittedAfterInput).toBeVisible();
    await expect(this.submittedBeforeInput).toBeVisible();
  }

  /** Verifies a project is selected in the Projects dropdown (non-empty value). */
  async verifyProjectSelected(): Promise<void> {
    // The Projects field value streams in asynchronously after the page mounts, so wait
    // for it to hold any non-whitespace value rather than reading it eagerly.
    await expect(this.projectsDropdown).toHaveValue(/\S/, { timeout: 15000 });
  }

  async verifyCreateDefectButtonVisible(): Promise<void> {
    await expect(this.createDefectButton).toBeVisible();
  }

  /** Verifies the grid columns are present in the exact documented order. */
  async verifyGridColumns(expected: string[]): Promise<void> {
    await expect(this.headerLabels).toHaveText(expected);
  }

  async verifyDefectsLoaded(): Promise<void> {
    await expect(this.defectIdCells.first()).toBeVisible({ timeout: 15000 });
    expect(await this.getDefectRowCount()).toBeGreaterThan(0);
  }

  async verifyPaginationVisible(): Promise<void> {
    await expect(this.paginationSummary).toBeVisible();
    expect(await this.getPaginationText()).toMatch(/Total\s+\d+\s+Entries/);
  }

  async verifyDefectVisible(defectId: string): Promise<void> {
    await expect(this.mainArea.locator(`.text-wrapper-14[title="${defectId}"]`)).toBeVisible();
  }

  async verifyNoDefectsMessage(): Promise<void> {
    await expect(this.noDefectsMessage).toBeVisible();
    expect(await this.getTotalEntries()).toBe(0);
  }

  /** All defect rows on the page report the given Status (4th column). */
  async verifyAllRowsHaveStatus(status: string): Promise<void> {
    // Retry the whole read+assert: the grid can briefly keep stale (pre-filter) rows
    // mounted while the filtered result set streams in over SignalR.
    await expect(async () => {
      const ids = await this.getDefectIdsOnPage();
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        const cell = this.mainArea
          .locator('.testlistrow', { has: this.page.locator(`.text-wrapper-14[title="${id}"]`) })
          .locator('> *')
          .nth(3);
        expect((await cell.innerText()).trim()).toMatch(new RegExp(status, 'i'));
      }
    }).toPass({ timeout: 15000 });
  }

  // Zero-based index of each filterable column among a data row's direct children
  // (`.testlistrow > *`): DF-id[0], Summary[1], Affected Release[2], Status[3], Team[4],
  // Severity[5], Priority[6], Assigned To[7], Business User[8].
  private static readonly COLUMN_INDEX: Record<string, number> = {
    Status: 3,
    Team: 4,
    Severity: 5,
    Priority: 6,
    'Assigned To': 7,
    'Business User': 8,
  };

  /**
   * Reads the named column's value for the first loaded defect row that has a non-empty
   * value, so a "valid" filter can be driven by a value that genuinely owns defects
   * (returns null if no loaded row has a value in that column).
   */
  async getFirstNonEmptyColumnValue(label: string): Promise<string | null> {
    const idx = DefectTabPage.COLUMN_INDEX[label];
    for (const id of await this.getDefectIdsOnPage()) {
      const cell = this.mainArea
        .locator('.testlistrow', { has: this.page.locator(`.text-wrapper-14[title="${id}"]`) })
        .locator('> *')
        .nth(idx);
      const value = (await cell.innerText()).trim();
      if (value) return value;
    }
    return null;
  }

  /** Every loaded defect row reports `value` in the named column (retries while the grid settles). */
  async verifyAllRowsMatchColumn(label: string, value: string): Promise<void> {
    const idx = DefectTabPage.COLUMN_INDEX[label];
    await expect(async () => {
      const ids = await this.getDefectIdsOnPage();
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        const cell = this.mainArea
          .locator('.testlistrow', { has: this.page.locator(`.text-wrapper-14[title="${id}"]`) })
          .locator('> *')
          .nth(idx);
        expect((await cell.innerText()).trim()).toBe(value);
      }
    }).toPass({ timeout: 15000 });
  }
}
