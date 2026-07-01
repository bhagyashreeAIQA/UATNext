import { Page, expect, Locator } from '@playwright/test';

// The test-run grid renders 10 columns (the 9 documented columns plus "Business User").
const EXPECTED_GRID_COLUMN_COUNT = 10;

// The grid paginates at 10 rows per page (observed: 95 entries → 10 pages, last page 5 rows).
const EXECUTE_GRID_PAGE_SIZE = 10;

// Both inline-editable assignee cells reuse the same `.assign-cell` markup, so they are
// addressed by their 1-based column position: "Assigned To" is the 4th cell and the
// separate "Business User" the 5th.
const ASSIGNED_TO_COLUMN  = 4;
const BUSINESS_USER_COLUMN = 5;

export class ExecuteTabPage {
  private readonly page: Page;

  // Sidebar
  readonly workspaceLabel: Locator;
  readonly workspaceDropdownWrapper: Locator;
  readonly workspaceInput: Locator;
  readonly workspaceChevron: Locator;
  readonly workspaceDropdownList: Locator;
  readonly workspaceDropdownItems: Locator;
  readonly closeSidebarButton: Locator;
  readonly projectTreeList: Locator;

  // Project selector (header bar)
  readonly projectDropdownContainer: Locator;
  readonly projectSelector: Locator;
  readonly projectDropdownMenu: Locator;
  readonly projectDropdownItems: Locator;

  // Releases (sidebar tree)
  readonly releasesContainer: Locator;
  readonly releaseItems: Locator;
  readonly activeRelease: Locator;

  // Test cycles (nested under an expanded release)
  readonly testCycleItems: Locator;

  // Test suites (nested under an expanded cycle)
  readonly suiteItems: Locator;

  // Test suites proper (depth-3 leaf suites nested under an expanded second-layer module)
  readonly testSuiteItems: Locator;

  // Test run panel – filter
  readonly viewAllRadio: Locator;
  readonly assignedToMeRadio: Locator;
  readonly othersRadio: Locator;
  readonly assigneeGroup: Locator;
  readonly statusFilterInput: Locator;

  // Test run panel – search + status + empty-state
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly statusDropdownItems: Locator;
  readonly noResultsMessage: Locator;

  // Test run panel – pagination
  readonly paginationContainer: Locator;
  readonly firstPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly lastPageButton: Locator;
  readonly currentPageIndicator: Locator;

  // Test run panel – table
  readonly testRunTable: Locator;
  readonly testRunHeaderRow: Locator;
  readonly testRunRows: Locator;
  readonly totalEntriesLabel: Locator;

  // Tab header (active state verification)
  readonly executeTabLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.executeTabLink            = page.getByRole('link', { name: 'EXECUTE TEST CASES' });
    this.projectDropdownContainer  = page.locator('.project-dropdown-container');
    this.projectSelector           = page.locator('.project-selector');
    this.projectDropdownMenu       = page.locator('.project-dropdown-menu');
    this.projectDropdownItems      = page.locator('.project-dropdown-item');
    this.releasesContainer         = page.locator('#project ul.sidebar-tree');
    this.releaseItems              = page.locator('#project ul.sidebar-tree li .releases');
    this.activeRelease             = page.locator('#project .releases.active');
    // Depth-1 only: direct children of a release's ul (excludes modules/suites which are deeper)
    this.testCycleItems            = page.locator('#project ul.sidebar-tree > li > ul > li > .test-cycle-row');
    // Depth-2: modules/sub-suites that appear after a depth-1 cycle is expanded
    this.suiteItems                = page.locator('#project ul.sidebar-tree > li > ul > li > ul > li > .test-cycle-row');
    // Depth-3: leaf Test Suites that appear after a depth-2 module is expanded. Unlike the
    // cycle levels these render with the `.test-suite-row` class, not `.test-cycle-row`.
    this.testSuiteItems            = page.locator('#project ul.sidebar-tree > li > ul > li > ul > li > ul > li > .test-suite-row');
    this.viewAllRadio              = page.getByRole('radio', { name: 'View All' });
    this.assignedToMeRadio         = page.locator('#assignToMe');
    this.othersRadio               = page.locator('#others');
    this.assigneeGroup             = page.locator('.test-execution-component');
    // Status dropdown in the filter bar; placeholder "All" disambiguates it from the
    // disabled "Select user" input that shares the same searchable-dropdown class.
    this.statusFilterInput         = page.locator('input.test-execution-text[placeholder="All"]');
    this.searchInput               = page.getByRole('textbox', { name: /Search for test cases/i });
    this.searchButton              = page.getByRole('button', { name: 'SEARCH' });
    this.clearButton               = page.getByRole('button', { name: 'CLEAR' });
    this.statusDropdownItems       = page.locator('.searchable-dropdown-item');
    this.noResultsMessage          = page.getByText(/No matching results found/i);
    // Pagination controls live in .PaginationTest; each arrow is an <img> with a distinct
    // alt. Disabled arrows keep cursor:default / opacity:0.5 but remain in the DOM.
    this.paginationContainer       = page.locator('.PaginationTest');
    this.firstPageButton           = this.paginationContainer.getByAltText('First Page', { exact: true });
    this.previousPageButton        = this.paginationContainer.getByAltText('Previous', { exact: true });
    this.nextPageButton            = this.paginationContainer.getByAltText('Next', { exact: true });
    this.lastPageButton            = this.paginationContainer.getByAltText('Last Page', { exact: true });
    this.currentPageIndicator      = page.locator('.pagination-item .text-wrapper-9').first();
    this.testRunTable              = page.locator('#testRunsWithCaseDetailsTable');
    this.testRunHeaderRow          = page.locator('.testlistrow.header');
    this.testRunRows               = page.locator('.testlistrow:not(.header)');
    this.totalEntriesLabel         = page.locator('.PaginationTest p');
    this.workspaceLabel           = page.locator('.execute-div').filter({ hasText: 'Projects' });
    this.workspaceDropdownWrapper = page.locator('#sidebar-project');
    this.workspaceInput           = page.locator('#sidebar-project input.searchable-dropdown-input');
    this.workspaceChevron         = page.locator('#sidebar-project img');
    this.workspaceDropdownList    = page.locator('#sidebar-project .searchable-dropdown-list');
    this.workspaceDropdownItems   = page.locator('#sidebar-project .searchable-dropdown-item');
    this.closeSidebarButton       = page.getByAltText('Close Sidebar');
    this.projectTreeList          = page.locator('.execute-input-with-label').locator('~ ul, ~ list').first();
  }

  // ─── Wait helpers ───────────────────────────────────────────────────────────

  async waitForSidebarLoad(): Promise<void> {
    await this.workspaceDropdownWrapper.waitFor({ state: 'visible' });
    // Blazor populates the input asynchronously via SignalR; wait until it has a value
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector<HTMLInputElement>('#sidebar-project input.searchable-dropdown-input');
        return el !== null && el.value.trim() !== '';
      },
      { timeout: 15000 },
    );
  }

  async waitForDropdownOpen(): Promise<void> {
    await this.workspaceDropdownList.waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.workspaceDropdownItems.first()).toBeVisible();
  }

  async waitForDropdownClosed(): Promise<void> {
    await this.workspaceDropdownList.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async waitForProjectTreeRefresh(previousItemCount: number): Promise<void> {
    // After selecting a workspace, Blazor re-renders the project tree.
    // We wait for the tree to have at least one item again.
    await this.page.waitForFunction(
      (count) => {
        const items = document.querySelectorAll('li .searchable-dropdown-input, ul li');
        return items.length >= count;
      },
      previousItemCount || 1,
      { timeout: 10000 },
    );
  }

  // ─── Workspace dropdown actions ─────────────────────────────────────────────

  async openWorkspaceDropdown(): Promise<void> {
    await this.workspaceChevron.click();
    await this.waitForDropdownOpen();
  }

  async getWorkspaceOptions(): Promise<string[]> {
    const count = await this.workspaceDropdownItems.count();
    const options: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.workspaceDropdownItems.nth(i).innerText()).trim();
      if (text) options.push(text);
    }
    return options;
  }

  async selectWorkspaceOption(optionName: string): Promise<void> {
    const option = this.workspaceDropdownItems.filter({ hasText: optionName });
    await option.waitFor({ state: 'visible' });
    await option.click();
    await this.waitForDropdownClosed();
  }

  async selectDifferentWorkspace(currentValue: string): Promise<string> {
    const options = await this.getWorkspaceOptions();
    const alternative = options.find(o => o !== currentValue);
    const toSelect = alternative ?? options[0];
    await this.selectWorkspaceOption(toSelect);
    return toSelect;
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  async getWorkspaceValue(): Promise<string> {
    return this.workspaceInput.inputValue();
  }

  async isWorkspaceLabelVisible(): Promise<boolean> {
    return this.workspaceLabel.isVisible();
  }

  async isWorkspaceDropdownVisible(): Promise<boolean> {
    return this.workspaceDropdownWrapper.isVisible();
  }

  async isExecuteTabActive(): Promise<boolean> {
    const ariaAttr = await this.executeTabLink.getAttribute('aria-current');
    const classAttr = await this.executeTabLink.getAttribute('class');
    return ariaAttr === 'page' || (classAttr ?? '').includes('active');
  }

  // ─── Assertions ─────────────────────────────────────────────────────────────

  async verifyExecuteTabIsActive(): Promise<void> {
    await expect(this.executeTabLink).toHaveAttribute('aria-current', 'page');
  }

  async verifyWorkspaceLabelVisible(): Promise<void> {
    await expect(this.workspaceLabel).toBeVisible();
  }

  async verifyWorkspaceDropdownVisible(): Promise<void> {
    await expect(this.workspaceDropdownWrapper).toBeVisible();
    await expect(this.workspaceInput).toBeVisible();
    await expect(this.workspaceChevron).toBeVisible();
  }

  async verifyWorkspaceAutoFilled(expectedValue: string): Promise<void> {
    const actualValue = await this.getWorkspaceValue();
    expect(actualValue).toBe(expectedValue);
  }

  async verifyWorkspaceNotEmpty(): Promise<void> {
    const value = await this.getWorkspaceValue();
    expect(value.trim()).not.toBe('');
  }

  async verifyDropdownIsOpen(): Promise<void> {
    await expect(this.workspaceDropdownList).toBeVisible();
    await expect(this.workspaceDropdownItems.first()).toBeVisible();
  }

  async verifyDropdownIsClosed(): Promise<void> {
    await expect(this.workspaceDropdownList).toBeHidden();
  }

  async verifyDropdownHasOptions(expectedOptions: string[]): Promise<void> {
    const actual = await this.getWorkspaceOptions();
    for (const option of expectedOptions) {
      expect(actual).toContain(option);
    }
  }

  async verifyAtLeastOneOptionVisible(): Promise<void> {
    const count = await this.workspaceDropdownItems.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyWorkspaceUpdatedTo(expectedValue: string): Promise<void> {
    await expect(this.workspaceInput).toHaveValue(expectedValue);
  }

  async verifySidebarRefreshed(): Promise<void> {
    // After workspace selection, the sidebar project tree re-renders via Blazor SignalR.
    // Verify the workspace input still holds a value (not reset) as a signal that
    // the component completed its refresh cycle.
    await this.waitForSidebarLoad();
    await this.verifyWorkspaceNotEmpty();
  }

  // ─── Project selector (header) ──────────────────────────────────────────────

  async getProjectValue(): Promise<string> {
    // The firstChild text node holds the project name; the trailing " ▼" is a sibling node.
    return this.page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('.project-selector');
      return el ? ((el.firstChild as Text).textContent ?? '').trim() : '';
    });
  }

  async verifyProjectTextVisible(): Promise<void> {
    await expect(this.projectDropdownContainer).toBeVisible();
    await expect(this.projectSelector).toBeVisible();
  }

  async verifyProjectAutoFilled(expectedValue: string): Promise<void> {
    await expect(this.projectSelector).toContainText(expectedValue);
  }

  async verifyProjectNotEmpty(): Promise<void> {
    const value = await this.getProjectValue();
    expect(value.trim()).not.toBe('');
  }

  // ─── Project dropdown actions ────────────────────────────────────────────────

  async openProjectDropdown(): Promise<void> {
    await this.projectSelector.click();
    // .project-dropdown-menu is only mounted in the DOM while the list is open
    await this.projectDropdownMenu.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getProjectDropdownOptions(): Promise<string[]> {
    const count = await this.projectDropdownItems.count();
    const options: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.projectDropdownItems.nth(i).innerText()).trim();
      if (text) options.push(text);
    }
    return options;
  }

  async selectProjectOption(projectName: string): Promise<void> {
    const option = this.projectDropdownItems.filter({ hasText: projectName });
    await option.waitFor({ state: 'visible' });
    await option.click();
    // Menu is removed from the DOM after selection
    await this.projectDropdownMenu.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async selectDifferentProject(currentValue: string): Promise<string> {
    const options = await this.getProjectDropdownOptions();
    const alternative = options.find(o => o !== currentValue);
    const toSelect = alternative ?? options[0];
    await this.selectProjectOption(toSelect);
    return toSelect;
  }

  // ─── Project dropdown assertions ─────────────────────────────────────────────

  async verifyProjectDropdownOpen(): Promise<void> {
    await expect(this.projectDropdownMenu).toBeVisible();
    await expect(this.projectDropdownItems.first()).toBeVisible();
  }

  async verifyProjectDropdownClosed(): Promise<void> {
    await expect(this.projectDropdownMenu).toBeHidden();
  }

  async verifyProjectDropdownHasAtLeastOneOption(): Promise<void> {
    const count = await this.projectDropdownItems.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyProjectDropdownContains(expectedOptions: string[]): Promise<void> {
    const actual = await this.getProjectDropdownOptions();
    for (const option of expectedOptions) {
      expect(actual).toContain(option);
    }
  }

  async verifyProjectUpdatedTo(expectedValue: string): Promise<void> {
    await expect(this.projectSelector).toContainText(expectedValue);
  }

  // ─── Releases assertions ──────────────────────────────────────────────────────

  async waitForProjectSwitchComplete(previousWorkspace: string): Promise<void> {
    // After switching projects, Blazor reloads the sidebar module dropdown and release list
    // via SignalR. Wait until the workspace input shows a value different from the old
    // project's workspace — this is the reliable signal that the switch completed.
    await this.page.waitForFunction(
      (prev) => {
        const input = document.querySelector<HTMLInputElement>('#sidebar-project input.searchable-dropdown-input');
        return input !== null && input.value.trim() !== '' && input.value.trim() !== prev;
      },
      previousWorkspace,
      { timeout: 15000 },
    );
  }

  async waitForReleasesLoad(): Promise<void> {
    await this.releasesContainer.waitFor({ state: 'visible', timeout: 10000 });
    await this.releaseItems.first().waitFor({ state: 'visible', timeout: 10000 });
    // Blazor streams release items over SignalR in batches; wait until the count
    // stops changing across two consecutive 500 ms polls before continuing.
    await this.page.waitForFunction(() => {
      const key = '__uatnext_releaseCount';
      const curr = document.querySelectorAll('#project ul.sidebar-tree li .releases').length;
      const prev = Number(sessionStorage.getItem(key) ?? '-1');
      sessionStorage.setItem(key, String(curr));
      // 2 s between polls gives Blazor's SignalR stream time to deliver all items
      return curr > 0 && curr === prev;
    }, { timeout: 15000, polling: 2000 });
    await this.page.evaluate(() => sessionStorage.removeItem('__uatnext_releaseCount'));
  }

  async getReleaseItems(): Promise<string[]> {
    const count = await this.releaseItems.count();
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.releaseItems.nth(i).innerText()).trim();
      if (text) items.push(text);
    }
    return items;
  }

  async verifyReleasesVisible(): Promise<void> {
    await expect(this.releasesContainer).toBeVisible();
    await expect(this.releaseItems.first()).toBeVisible();
  }

  async verifyAtLeastOneRelease(): Promise<void> {
    const count = await this.releaseItems.count();
    expect(count).toBeGreaterThan(0);
  }

  // ─── Release expand actions ───────────────────────────────────────────────────

  async expandReleaseByIndex(index: number): Promise<void> {
    await this.releaseItems.nth(index).click();
  }

  async expandFirstReleaseWithTestCycles(): Promise<void> {
    // Iterate from last → first so projects that order newest-first (P01 last) are
    // reached early. On each attempt, click the release and wait for test cycles to
    // appear; collapse and retry on the next one if none appear.
    //
    // Under SignalR load the cycle data can stream in slowly, so the whole sweep is
    // retried a second time (re-clicking a release re-requests its children) and a
    // reconnect overlay is cleared before each click.
    for (let pass = 0; pass < 2; pass++) {
      const count = await this.releaseItems.count();
      for (let i = count - 1; i >= 0; i--) {
        await this.waitForReconnectIfNeeded();
        await this.releaseItems.nth(i).click();
        const found = await this.testCycleItems.first()
          .waitFor({ state: 'visible', timeout: 20000 })
          .then(() => true)
          .catch(() => false);
        if (found) return;
        // Collapse the active release before trying the next one
        if (await this.activeRelease.isVisible()) {
          await this.activeRelease.click();
        }
      }
    }
    throw new Error('No release with test cycles was found in the current project');
  }

  async waitForTestCyclesToLoad(): Promise<void> {
    // After clicking a release, Blazor renders test cycles inside a nested <ul>
    await this.testCycleItems.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async getTestCycleNames(): Promise<string[]> {
    const count = await this.testCycleItems.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.testCycleItems.nth(i).innerText()).trim();
      if (text) names.push(text);
    }
    return names;
  }

  async clickFirstTestCycle(): Promise<void> {
    await this.testCycleItems.first().click();
  }

  // ─── By-name tree navigation (deterministic Release → Cycle → Module) ──────────
  // Unlike the "first with data" probes above, these target a specific node by its label so a
  // test can drive an exact path (e.g. Testdata_Release_P01 → Testdata_Cycle_1 → Dealer Master).

  /** Selects a project from the sidebar Projects dropdown and waits for its release tree. */
  async selectSidebarProject(projectName: string): Promise<void> {
    await this.openWorkspaceDropdown();
    await this.selectWorkspaceOption(projectName);
    await this.waitForReleasesLoad();
  }

  /** Expands the release whose label contains `name` and waits for its depth-1 cycles. */
  async expandReleaseByName(name: string): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.releaseItems.filter({ hasText: name }).first().click();
    await this.testCycleItems.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  /** Expands the depth-1 cycle whose label contains `name` and waits for its depth-2 modules. */
  async expandCycleByName(name: string): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.testCycleItems.filter({ hasText: name }).first().click();
    await this.suiteItems.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  /** Clicks the depth-2 module whose label contains `name` and waits for its grid shell. */
  async clickModuleByName(name: string): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.suiteItems.filter({ hasText: name }).first().click();
    await this.waitForGridContainerReady();
  }

  // ─── Release expand assertions ────────────────────────────────────────────────

  async verifyReleaseExpanded(): Promise<void> {
    // The clicked release gains the 'active' class and its caret rotates to 90°
    await expect(this.activeRelease).toBeVisible();
  }

  async verifyTestCyclesVisible(): Promise<void> {
    await expect(this.testCycleItems.first()).toBeVisible();
    const count = await this.testCycleItems.count();
    expect(count).toBeGreaterThan(0);
  }

  // ─── Test run panel actions ───────────────────────────────────────────────────

  async selectViewAll(): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.viewAllRadio.click();
    await expect(this.viewAllRadio).toBeChecked();
  }

  async waitForReconnectIfNeeded(): Promise<void> {
    // Blazor SignalR reconnect overlay: "Rejoin failed... trying again in N seconds"
    // Wait up to 60 s for it to disappear before continuing.
    const rejoinText = this.page.getByText(/Rejoin failed/i);
    try {
      const visible = await rejoinText.isVisible();
      if (visible) {
        await rejoinText.waitFor({ state: 'hidden', timeout: 60000 });
      }
    } catch {
      // modal wasn't present or already gone
    }
  }

  async waitForTestRunsToRefresh(): Promise<void> {
    // If a SignalR reconnect overlay appeared, wait for it first
    await this.waitForReconnectIfNeeded();
    // Wait for at least one data row to become visible after a suite/cycle is selected
    await this.testRunRows.first().waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Waits for the test-run grid to finish (re)loading without a fixed sleep. The grid streams
   * over SignalR and, once settled, renders exactly `min(total, pageSize=10)` rows; this also
   * requires the pagination total to hold steady across consecutive reads so a still-streaming
   * grid (whose count is mid-update) is not mistaken for a settled one. Tolerates an empty grid.
   */
  async waitForGridSettled(timeout = 30000): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.totalEntriesLabel.waitFor({ state: 'visible', timeout });
    let prevText = ' ';
    let stable = 0;
    await expect(async () => {
      // Combined signature of total + row count; the two update independently during Blazor
      // re-renders, so the grid is settled only once their combination stops changing.
      const sig = (await this.getTotalEntriesText()) + '|' + (await this.testRunRows.count());
      stable = sig === prevText ? stable + 1 : 0;
      prevText = sig;
      expect(stable).toBeGreaterThanOrEqual(2); // total unchanged across 3 reads → streaming done
    }).toPass({ timeout, intervals: [400, 500, 600, 700] });
  }

  /**
   * Settles the grid after switching to View All during a suite/module probe, returning the
   * resulting visible row count. A suite WITH runs is detected the moment View All's count
   * differs from the pre-toggle (Assigned-to-me) total — so populated suites return promptly,
   * with no fixed delay. A genuinely EMPTY suite never changes the total, so it is only accepted
   * once the (unchanged) total has held steady across several reads. Re-clicks View All if a
   * Blazor re-render reverts the radio mid-stream.
   */
  private async waitForViewAllProbeSettled(beforeText: string): Promise<number> {
    await this.waitForReconnectIfNeeded();
    // Phase 1: make View All "stick" (a Blazor re-render can revert the radio); re-click gently
    // until it stays checked, so the data poll below is not disrupted by re-click re-renders.
    await expect(async () => {
      if (!(await this.viewAllRadio.isChecked())) await this.viewAllRadio.click();
      await expect(this.viewAllRadio).toBeChecked();
    }).toPass({ timeout: 30000, intervals: [800, 1200, 1600] });
    let prevText = ' ';
    let stable = 0;
    await expect(async () => {
      const text = await this.getTotalEntriesText();
      const total = await this.getTotalEntries();
      const rowCount = await this.testRunRows.count();
      const sig = text + '|' + rowCount;
      stable = sig === prevText ? stable + 1 : 0;
      prevText = sig;
      // Populated suite: View All's count differs from the Assigned-to-me total AND rows have
      // rendered (the count label can update a beat before the rows) → return at once.
      const populated = text !== beforeText && total > 0 && rowCount > 0;
      // Empty suite: the count never changes, so only accept it once the (unchanged) total has
      // held steady long enough that a populated suite's data would already have streamed in —
      // hence a wide stability window (~6 s under load) as the floor.
      const settledEmpty = stable >= 6;
      expect(populated || settledEmpty).toBe(true);
    }).toPass({ timeout: 60000, intervals: [600, 800, 1000, 1000, 1200, 1200] });
    return this.testRunRows.count();
  }

  async getTestRunCount(): Promise<number> {
    return this.testRunRows.count();
  }

  async getTotalEntries(): Promise<number> {
    const text = await this.totalEntriesLabel.innerText();
    const match = text.match(/Total (\d+) Entries/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // ─── Test run panel assertions ────────────────────────────────────────────────

  async verifyTestRunTableVisible(): Promise<void> {
    await expect(this.testRunTable).toBeVisible();
    await expect(this.testRunHeaderRow).toBeVisible();
  }

  async verifyTestRunsLoaded(): Promise<void> {
    const count = await this.getTestRunCount();
    expect(count).toBeGreaterThan(0);
  }

  async verifyTotalEntriesPositive(): Promise<void> {
    const total = await this.getTotalEntries();
    expect(total).toBeGreaterThan(0);
  }

  // ─── Suite actions (TC-007) ───────────────────────────────────────────────────

  async expandFirstCycleWithSuites(): Promise<void> {
    // Click depth-1 cycles until one reveals depth-2 suite/module items.
    const count = await this.testCycleItems.count();
    for (let i = 0; i < count; i++) {
      await this.testCycleItems.nth(i).click();
      const found = await this.suiteItems.first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (found) return;
    }
    throw new Error('No cycle with sub-suites was found in the current release');
  }

  async clickFirstSuite(): Promise<void> {
    await this.suiteItems.first().click();
  }

  async clickFirstSuiteWithTestRuns(): Promise<void> {
    // Not every suite has test runs; iterate until one shows rows under View All.
    // Inspection result: Sales Ops=0, Dealer Services=13, Dealer Master=48, Distribution=0.
    // Clicking a module resets the radio to "Assigned to me"; wait for the grid to settle, then
    // re-select View All and wait for that data to settle — both deterministic (no fixed sleep).
    const count = await this.suiteItems.count();
    for (let i = 0; i < count; i++) {
      await this.suiteItems.nth(i).click();
      await this.waitForGridSettled();                       // Assigned-to-me view settles
      const before = await this.getTotalEntriesText();
      await this.viewAllRadio.click();
      const rows = await this.waitForViewAllProbeSettled(before);
      if (rows > 0) return;
    }
    throw new Error('No suite with test runs found under View All filter');
  }

  async getSuiteCount(): Promise<number> {
    return this.suiteItems.count();
  }

  // ─── Depth-3 Test Suite actions (TC-047) ──────────────────────────────────────

  /**
   * Depth-3 Test Suites (`.test-suite-row`) are nested inside a depth-2 module's <li>.
   * Returns the suites that belong to the module at `moduleIndex`, scoped to that module so
   * suites from other already-expanded modules are not picked up.
   */
  private suitesForModule(moduleIndex: number): Locator {
    return this.suiteItems.nth(moduleIndex)
      .locator('xpath=..')                       // the module's <li>
      .locator('> ul > li > .test-suite-row');   // its leaf Test Suites
  }

  /**
   * Expands each depth-2 module in turn and probes its depth-3 Test Suites under View All
   * until one shows test runs, then leaves the grid on that suite (View All, runs > 0).
   *
   * The logged-in user owns no runs in these modules, so a suite must be confirmed under
   * View All. Clicking any node resets the Assignee radio to "Assigned to me", so after each
   * suite click we wait for the grid to settle, re-select View All, then wait for that data to
   * settle — both deterministic (rows match total) — mirroring `clickFirstSuiteWithTestRuns`.
   */
  async clickFirstTestSuiteWithTestRuns(): Promise<void> {
    const moduleCount = await this.suiteItems.count();
    for (let m = 0; m < moduleCount; m++) {
      await this.waitForReconnectIfNeeded();
      await this.suiteItems.nth(m).click();   // expand the module to reveal its Test Suites
      const suites = this.suitesForModule(m);
      const hasSuites = await suites.first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (!hasSuites) continue;

      const suiteCount = await suites.count();
      for (let s = 0; s < suiteCount; s++) {
        await suites.nth(s).click();
        await this.waitForGridSettled();                     // Assigned-to-me view settles
        const before = await this.getTotalEntriesText();
        await this.viewAllRadio.click();
        const rows = await this.waitForViewAllProbeSettled(before);
        if (rows > 0) return;
      }
    }
    throw new Error('No Test Suite with test runs was found under View All filter');
  }

  async getTestSuiteCount(): Promise<number> {
    return this.testSuiteItems.count();
  }

  async verifyTestSuiteListIsEnabled(): Promise<void> {
    await expect(this.testSuiteItems.first()).toBeVisible();
    const count = await this.testSuiteItems.count();
    expect(count).toBeGreaterThan(0);
  }

  // ─── Suite assertions (TC-007) ────────────────────────────────────────────────

  async verifyViewAllIsDefaultSelected(): Promise<void> {
    await expect(this.viewAllRadio).toBeChecked();
  }

  async verifyCycleListIsEnabled(): Promise<void> {
    await expect(this.testCycleItems.first()).toBeVisible();
    const count = await this.testCycleItems.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifySuiteListIsEnabled(): Promise<void> {
    await expect(this.suiteItems.first()).toBeVisible();
    const count = await this.suiteItems.count();
    expect(count).toBeGreaterThan(0);
  }

  // ─── Release navigation for filter change (TC-007 Step 7) ────────────────────

  async getActiveReleaseName(): Promise<string> {
    // After clicking a cycle or suite, the release may lose its .active class.
    // The expanded release is the one whose nested list contains visible cycle rows.
    const expandedReleaseLi = this.page.locator('#project ul.sidebar-tree > li').filter({
      has: this.page.locator('.test-cycle-row'),
    });
    return (await expandedReleaseLi.locator('.releases').first().innerText()).trim();
  }

  async selectDifferentReleaseWithCycles(currentReleaseName: string): Promise<string> {
    // Try each release (last → first) skipping the current one; return the first
    // that exposes test cycles. Falls back to re-selecting the current release.
    const count = await this.releaseItems.count();
    for (let i = count - 1; i >= 0; i--) {
      const name = (await this.releaseItems.nth(i).innerText()).trim();
      if (name === currentReleaseName) continue;
      await this.releaseItems.nth(i).click();
      const hasCycles = await this.testCycleItems.first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      if (hasCycles) return name;
      if (await this.activeRelease.isVisible()) await this.activeRelease.click();
    }
    // No alternative found — collapse and re-expand the current release
    if (await this.activeRelease.isVisible()) await this.activeRelease.click();
    await this.releaseItems.filter({ hasText: currentReleaseName }).first().click();
    await this.testCycleItems.first().waitFor({ state: 'visible', timeout: 20000 });
    return currentReleaseName;
  }

  // ─── Grid container wait (TC-009) ─────────────────────────────────────────────

  async waitForGridContainerReady(): Promise<void> {
    // Reach the grid without depending on data rows: the "Assigned to me" default
    // can legitimately return 0 entries, so wait for the table + pagination shell.
    await this.waitForReconnectIfNeeded();
    await this.testRunTable.waitFor({ state: 'visible', timeout: 30000 });
    await this.testRunHeaderRow.waitFor({ state: 'visible', timeout: 30000 });
    // The cycle's data continues streaming over SignalR after the shell appears; wait for the
    // grid to settle (rendered rows match the total) rather than a fixed delay, so a late
    // re-render has completed before any interaction.
    await this.waitForGridSettled();
  }

  // ─── Filter section assertions (TC-008) ───────────────────────────────────────

  async verifyFilterSectionVisible(): Promise<void> {
    // Project (header selector), Assignee radios, and the Status dropdown make up
    // the filter section that sits above the grid.
    await expect(this.projectSelector).toBeVisible();      // Project
    await expect(this.assigneeGroup).toBeVisible();        // Assignee group
    await expect(this.assignedToMeRadio).toBeVisible();    // Assigned to me
    await expect(this.viewAllRadio).toBeVisible();         // View All
    await expect(this.statusFilterInput).toBeVisible();    // Status
  }

  // ─── Grid header / data assertions (TC-008) ───────────────────────────────────

  async verifyGridPresent(): Promise<void> {
    await expect(this.testRunTable).toBeVisible();
    await expect(this.testRunHeaderRow).toBeVisible();
  }

  async getGridHeaderLabels(): Promise<string[]> {
    const text = await this.testRunHeaderRow.first().innerText();
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  }

  async verifyGridHeaders(expectedColumns: string[]): Promise<void> {
    const actual = await this.getGridHeaderLabels();
    for (const column of expectedColumns) {
      expect(actual).toContain(column);
    }
  }

  async verifyEachRowHasReadableData(): Promise<void> {
    // Each row must render correct, readable data without blank identifier cells.
    // Validate the two identifier columns (Test Run ID = col 0, Test Case ID = col 1)
    // for every visible row, asserting their documented TR-/TC- formats.
    const rowCount = await this.testRunRows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i++) {
      const cells = await this.testRunRows.nth(i).locator('> *').allInnerTexts();
      expect(cells.length).toBeGreaterThanOrEqual(EXPECTED_GRID_COLUMN_COUNT);
      expect(cells[0].trim()).toMatch(/^TR-\d+/);   // Test Run ID
      expect(cells[1].trim()).toMatch(/^TC-\d+/);   // Test Case ID
    }
  }

  // ─── Assignee radio operations (TC-009) ───────────────────────────────────────

  async verifyAssignedToMeSelectedByDefault(): Promise<void> {
    await expect(this.assignedToMeRadio).toBeChecked();
    await expect(this.viewAllRadio).not.toBeChecked();
    await expect(this.othersRadio).not.toBeChecked();
  }

  async getTotalEntriesText(): Promise<string> {
    return (await this.totalEntriesLabel.innerText()).trim();
  }

  async selectViewAllAndWaitForRefresh(previousTotalText: string): Promise<void> {
    await this.selectAssigneeAndWaitForRefresh(this.viewAllRadio, previousTotalText);
  }

  async selectAssignedToMeAndWaitForRefresh(previousTotalText: string): Promise<void> {
    await this.selectAssigneeAndWaitForRefresh(this.assignedToMeRadio, previousTotalText);
  }

  private async selectAssigneeAndWaitForRefresh(radio: Locator, previousTotalText: string): Promise<void> {
    // Toggling an Assignee radio re-queries the grid over SignalR without a page reload.
    // While the data streams, a Blazor re-render can momentarily reset the radio back to
    // "Assigned to me", so we retry: click the radio if it isn't checked, and only succeed
    // once it stays checked AND the pagination total has changed from its pre-toggle value.
    await this.waitForReconnectIfNeeded();
    await expect(async () => {
      if (!(await radio.isChecked())) {
        await radio.click();
      }
      await expect(radio).toBeChecked();
      const total = await this.getTotalEntriesText();
      expect(total).not.toBe(previousTotalText);
    }).toPass({ timeout: 60000, intervals: [1000, 2000, 3000] });
  }

  // ─── Assignee "Assigned To / Business User" (Others) + Select User (TC-136 to TC-142) ─
  // The Assignee filter has three radios: #assignToMe (default), #viewAll, #others
  // ("Assigned To / Business User"). The "Select user" typeahead is disabled until #others is
  // chosen; it loads matching users only after a search term is typed.

  private get selectUserInput(): Locator {
    return this.page.locator('input.test-execution-text.searchable-dropdown-input[placeholder="Select user"]');
  }

  /** Asserts all three Assignee options are visible (TC-136). */
  async verifyAssigneeOptionsVisible(): Promise<void> {
    await expect(this.assigneeGroup).toBeVisible();
    await expect(this.assignedToMeRadio).toBeVisible();
    await expect(this.viewAllRadio).toBeVisible();
    await expect(this.othersRadio).toBeVisible();
    await expect(this.page.getByText(/Assigned To \/ Business User/i).first()).toBeVisible();
  }

  async isSelectUserEnabled(): Promise<boolean> {
    return this.selectUserInput.isEnabled().catch(() => false);
  }

  async verifySelectUserDisabled(): Promise<void> {
    await expect(this.selectUserInput).toBeDisabled();
  }

  async verifySelectUserEnabled(): Promise<void> {
    await expect(this.selectUserInput).toBeEnabled();
  }

  /** Selects the "Assigned To / Business User" (#others) radio and waits for Select User to enable. */
  async selectAssignedToBusinessUser(): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await expect(async () => {
      if (!(await this.othersRadio.isChecked())) await this.othersRadio.click();
      await expect(this.othersRadio).toBeChecked();
      await expect(this.selectUserInput).toBeEnabled();
    }).toPass({ timeout: 30000, intervals: [1000, 2000] });
  }

  /** Opens the Select User typeahead (it is the search field itself). */
  async openSelectUserDropdown(): Promise<void> {
    await this.selectUserInput.click();
  }

  // The Select User typeahead renders its options with a dedicated class (NOT the generic
  // `.searchable-dropdown-item`), inside `.user-filter-searchable-dropdown-list`.
  private get selectUserOptions(): Locator {
    return this.page.locator('.user-filter-searchable-dropdown-item');
  }

  /**
   * Types `term` into the Select User typeahead and returns the offered option texts WITHOUT
   * selecting one. The list streams in (and can lag a keystroke behind the fill under load per
   * the SignalR timing gotcha), so the options are polled until the set stops changing before
   * being read. Never presses Enter/ArrowDown — doing so selects an option and collapses the
   * list, leaving nothing to read.
   */
  async getSelectUserOptions(term: string): Promise<string[]> {
    await this.selectUserInput.click();
    await this.selectUserInput.fill(term);
    // Poll until the option set settles (or stays empty), so a mid-stream / lagged read is not
    // mistaken for the final result.
    let prev = ' ';
    let stable = 0;
    await expect(async () => {
      const now = (await this.selectUserOptions.allInnerTexts()).join('|');
      stable = now === prev ? stable + 1 : 0;
      prev = now;
      expect(stable).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000, intervals: [300, 400, 500] }).catch(() => undefined);
    return (await this.selectUserOptions.allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /**
   * Searches the Select User typeahead for `term`, selects the first matching option (or the one
   * matching `optionText`), waits for the grid to refresh, and returns the chosen option text.
   */
  async selectUserAndWaitForRefresh(term: string, optionText?: string): Promise<string> {
    const before = await this.getTotalEntriesText().catch(() => '');
    await this.selectUserInput.click();
    await this.selectUserInput.fill(term);
    await this.selectUserOptions.first().waitFor({ state: 'visible', timeout: 10000 });
    const target = this.selectUserOptions.filter({ hasText: optionText ?? term }).first();
    const chosen = (await target.innerText()).replace(/\s+/g, ' ').trim();
    await target.click();
    // The grid re-queries over SignalR; wait until the total changes from its pre-filter value.
    await expect(async () => {
      expect(await this.getTotalEntriesText()).not.toBe(before);
    }).toPass({ timeout: 30000, intervals: [1000, 2000] }).catch(() => undefined);
    await this.waitForGridSettled().catch(() => undefined);
    return chosen;
  }

  /**
   * Returns a value that can be filtered on via the "Assigned To / Business User" typeahead: the first
   * grid row's non-empty Assigned To name (some rows have a BLANK assignee — deriving blindly from row
   * 0 yields an empty term that then filters an arbitrary user with no runs), falling back to the first
   * non-empty Business User. Assigned To names are preferred (the typeahead resolves them cleanly).
   * Throws if no row carries either field.
   */
  async deriveFilterableAssignee(): Promise<string> {
    const count = await this.testRunRows.count();
    for (let i = 0; i < count; i++) {
      const a = (await this.getAssignedToDisplay(i)).trim();
      if (a) return a;
    }
    for (let i = 0; i < count; i++) {
      const b = (await this.getBusinessUserDisplay(i)).trim();
      if (b) return b;
    }
    throw new Error('No grid row has an Assigned To or Business User to filter by');
  }

  /**
   * Asserts every visible grid row matches `user` either as its Assigned To or its Business User
   * (the "Assigned To / Business User" filter matches either field). Requires ≥1 row.
   */
  async verifyAllRowsMatchUser(user: string): Promise<void> {
    // The grid re-queries over SignalR after a filter and is transiently empty mid-refresh — poll for
    // rows to arrive before asserting, so we don't read a still-refreshing (0-row) grid.
    await expect
      .poll(() => this.testRunRows.count(), { message: 'filtered grid should have at least one row', timeout: 15000 })
      .toBeGreaterThan(0);
    const count = await this.testRunRows.count();
    for (let i = 0; i < count; i++) {
      const assignee = (await this.getAssignedToDisplay(i)).trim();
      const businessUser = (await this.getBusinessUserDisplay(i)).trim();
      expect(
        assignee === user || businessUser === user,
        `row ${i} should match "${user}" (assignee="${assignee}", businessUser="${businessUser}")`,
      ).toBe(true);
    }
  }

  // ─── Row helpers (TC-012) ─────────────────────────────────────────────────────

  async getRowCells(rowIndex: number): Promise<string[]> {
    return this.testRunRows.nth(rowIndex).locator('> *').allInnerTexts();
  }

  async getFirstRowTestRunId(): Promise<string> {
    return (await this.getRowCells(0))[0].trim();
  }

  async getFirstRowTestCaseId(): Promise<string> {
    return (await this.getRowCells(0))[1].trim();
  }

  // ─── Search (TC-012, TC-013, TC-014) ──────────────────────────────────────────

  async searchTestRun(term: string): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.waitForReconnectIfNeeded();
  }

  async getSearchValue(): Promise<string> {
    return this.searchInput.inputValue();
  }

  async verifySearchResultsMatch(term: string): Promise<void> {
    // Every visible row must carry the searched term in its Test Run ID or Test Case ID.
    // Wrapped in toPass so the grid's SignalR refresh has time to apply the search.
    await expect(async () => {
      const rowCount = await this.testRunRows.count();
      expect(rowCount).toBeGreaterThan(0);
      for (let i = 0; i < rowCount; i++) {
        const cells = await this.getRowCells(i);
        const identifiers = `${cells[0]} ${cells[1]}`;   // Test Run ID + Test Case ID
        expect(identifiers).toContain(term);
      }
    }).toPass({ timeout: 30000, intervals: [1000, 2000, 3000] });
  }

  // ─── Empty state (TC-013) ─────────────────────────────────────────────────────

  async verifyNoResultsMessageVisible(): Promise<void> {
    await expect(this.noResultsMessage).toBeVisible();
  }

  // ─── Clear / reset filters (TC-014) ───────────────────────────────────────────

  async clearFilters(): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.clearButton.click();
    // CLEAR resets to the default Assignee selection; wait for that to take effect.
    await expect(this.assignedToMeRadio).toBeChecked({ timeout: 30000 });
  }

  async verifyDefaultStateRestored(): Promise<void> {
    // After CLEAR: search empty, Assigned-to-me selected, View All unselected, Status = All.
    await expect(this.searchInput).toHaveValue('');
    await expect(this.assignedToMeRadio).toBeChecked();
    await expect(this.viewAllRadio).not.toBeChecked();
    await expect(this.statusFilterInput).toHaveValue('All');
  }

  // ─── Status dropdown (TC-015) ─────────────────────────────────────────────────

  async openStatusDropdown(): Promise<void> {
    await this.statusFilterInput.click();
    await expect(this.statusDropdownItems.first()).toBeVisible({ timeout: 10000 });
  }

  async getStatusOptions(): Promise<string[]> {
    const texts = await this.statusDropdownItems.allInnerTexts();
    return texts.map(t => t.trim()).filter(Boolean);
  }

  async verifyStatusOptions(expectedStatuses: string[]): Promise<void> {
    const actual = await this.getStatusOptions();
    for (const status of expectedStatuses) {
      expect(actual).toContain(status);
    }
  }

  async selectStatus(status: string): Promise<void> {
    // The status options live in an always-rendered list. Resolve the target by its
    // trimmed text and click it by index: `filter({ hasText: /^All$/ })` intermittently
    // fails to match the "All" option once a status is selected, whereas allInnerTexts()
    // reports the option text reliably.
    if ((await this.statusDropdownItems.count()) === 0) {
      await this.openStatusDropdown();
    }
    const options = (await this.statusDropdownItems.allInnerTexts()).map(t => t.trim());
    const index = options.indexOf(status);
    if (index === -1) {
      throw new Error(`Status option "${status}" not found. Available: ${options.join(', ')}`);
    }
    await this.statusDropdownItems.nth(index).click();
    await expect(this.statusFilterInput).toHaveValue(status, { timeout: 10000 });
  }

  async getCurrentStatusValue(): Promise<string> {
    return this.statusFilterInput.inputValue();
  }

  async verifyAllRowsHaveStatus(status: string): Promise<void> {
    // The Status column is the 6th cell (index 5) of each row. After a status filter is
    // applied, every visible row must report exactly that status; retry while the grid
    // refreshes over SignalR.
    await expect(async () => {
      const rowCount = await this.testRunRows.count();
      expect(rowCount).toBeGreaterThan(0);
      const statuses = await this.testRunRows.evaluateAll(
        rows => rows.map(r => (r.children[5]?.textContent ?? '').trim()),
      );
      for (const s of statuses) {
        expect(s).toBe(status);
      }
    }).toPass({ timeout: 30000, intervals: [1000, 2000, 3000] });
  }

  // ─── Page reload recovery (TC-010) ────────────────────────────────────────────

  async reloadPage(): Promise<void> {
    // A hard reload keeps the project/workspace selection and the Execute tab active,
    // but clears the expanded release/cycle and the grid; callers must re-select them.
    await this.page.reload();
    await this.waitForReconnectIfNeeded();
  }

  // ─── Status filter clear / empty-status (TC-016, TC-017) ──────────────────────

  async clearStatusFilter(): Promise<void> {
    // Selecting the "All" option removes the status constraint and restores the grid to
    // whatever other filters remain applied.
    await this.selectStatus('All');
  }

  async selectFirstEmptyStatus(statuses: string[]): Promise<string> {
    // Iterate the offered statuses and stop at the first one whose grid is empty, so the
    // test does not depend on which specific status currently has no runs.
    for (const status of statuses) {
      await this.selectStatus(status);
      await this.waitForGridSettled(); // grid re-queries over SignalR; wait for it to settle
      if (await this.getTotalEntries() === 0) {
        return status;
      }
    }
    throw new Error('No status without test runs was found under the current filters');
  }

  async selectFirstNonEmptyStatus(statuses: string[]): Promise<{ status: string; count: number }> {
    // Iterate the offered statuses and stop at the first one that has runs, so the test
    // does not depend on which specific status currently holds data.
    for (const status of statuses) {
      await this.selectStatus(status);
      await this.waitForGridSettled(); // grid re-queries over SignalR; wait for it to settle
      const count = await this.getTotalEntries();
      if (count > 0) {
        return { status, count };
      }
    }
    throw new Error('No status with test runs was found under the current filters');
  }

  // ─── Pagination (TC-018, TC-019) ──────────────────────────────────────────────

  async verifyPaginationControlsVisible(): Promise<void> {
    await expect(this.paginationContainer).toBeVisible();
    await expect(this.totalEntriesLabel).toBeVisible();
    await expect(this.firstPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.lastPageButton).toBeVisible();
    await expect(this.currentPageIndicator).toBeVisible();
  }

  async getCurrentPageNumber(): Promise<number> {
    return parseInt((await this.currentPageIndicator.innerText()).trim(), 10);
  }

  private async clickPaginationAndWait(button: Locator, expectedPage: number | 'changed'): Promise<void> {
    const before = await this.getCurrentPageNumber();
    await this.waitForReconnectIfNeeded();
    await button.click();
    await this.page.waitForFunction(
      ({ prev, target }) => {
        const el = document.querySelector('.pagination-item .text-wrapper-9');
        if (el === null) return false;
        const current = parseInt((el.textContent ?? '').trim(), 10);
        return target === 'changed' ? current !== prev : current === target;
      },
      { prev: before, target: expectedPage },
      { timeout: 30000 },
    );
    // Allow the row data for the new page to stream in.
    await this.testRunRows.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
  }

  async goToNextPage(): Promise<void> {
    await this.clickPaginationAndWait(this.nextPageButton, 'changed');
  }

  async goToPreviousPage(): Promise<void> {
    await this.clickPaginationAndWait(this.previousPageButton, 'changed');
  }

  async goToFirstPage(): Promise<void> {
    await this.clickPaginationAndWait(this.firstPageButton, 1);
  }

  async goToLastPage(): Promise<void> {
    // The last page number equals ceil(total / pageSize).
    const total = await this.getTotalEntries();
    const lastPage = Math.max(1, Math.ceil(total / EXECUTE_GRID_PAGE_SIZE));
    await this.clickPaginationAndWait(this.lastPageButton, lastPage);
  }

  async verifyDisplayedCountMatchesRows(): Promise<void> {
    // The pagination total drives how many rows render: a full page (page size) when more
    // runs remain, or exactly the total when it fits on a single page.
    const total = await this.getTotalEntries();
    expect(total).toBeGreaterThan(0);
    const rows = await this.getTestRunCount();
    expect(rows).toBe(Math.min(total, EXECUTE_GRID_PAGE_SIZE));
  }

  // ─── Inline assignee edit – Assigned To & Business User (TC-060 to TC-067) ─────
  // The grid renders an editable "Assigned To" (4th cell) and a separate "Business User"
  // (5th cell); both reuse the `.assign-cell` markup, so each pencil is targeted by column
  // position rather than class. Clicking the pencil swaps the read-only name for a
  // searchable dropdown and a Cancel (✖) button; the Save (✔) button is added once a valid
  // assignee is chosen. Assignee options render in a page-level `.assign-user-searchable-
  // dropdown-list`, not inside the row. The methods below operate on a generic cell so the
  // Assigned To and Business User flows share one implementation.

  private assignCell(rowIndex: number, column: number): Locator {
    return this.testRunRows.nth(rowIndex).locator(`> div:nth-child(${column})`);
  }

  private assignedToCell(rowIndex = 0): Locator {
    return this.assignCell(rowIndex, ASSIGNED_TO_COLUMN);
  }

  private businessUserCell(rowIndex = 0): Locator {
    return this.assignCell(rowIndex, BUSINESS_USER_COLUMN);
  }

  // ── Generic cell operations (shared by both columns) ──────────────────────────

  private async openEditorIn(cell: Locator): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await cell.locator('button.assign-icon-button[title="Edit assignee"]').click();
    await expect(cell.locator('input.assign-search-input')).toBeVisible();
  }

  private async verifyEditorOpenIn(cell: Locator): Promise<void> {
    // The dropdown is editable and the Cancel (✖) action is offered immediately.
    await expect(cell.locator('input.assign-search-input')).toBeVisible();
    await expect(cell.locator('button.assign-cancel[title="Cancel"]')).toBeVisible();
  }

  private assigneeOptions(): Locator {
    return this.page.locator('.assign-user-searchable-dropdown-list .searchable-dropdown-item');
  }

  /** Opens the dropdown in `cell` and returns every offered option (placeholder included). */
  private async readAssigneeOptionsIn(cell: Locator): Promise<string[]> {
    await cell.locator('input.assign-search-input').click();
    await expect(this.assigneeOptions().first()).toBeVisible({ timeout: 10000 });
    return (await this.assigneeOptions().allInnerTexts()).map(t => t.trim()).filter(Boolean);
  }

  /**
   * Opens the dropdown and selects a real user (skipping the "Please Select" placeholder),
   * optionally excluding `exclude`. Returns the chosen name.
   *
   * The dropdown lists the cell's *current* assignee as its first option, so picking the
   * first user can re-select the existing value — which is a no-op and leaves the Save (✔)
   * action hidden (Save renders only on an actual change). To stay robust regardless of the
   * cell's starting value, if Save does not appear after the first pick the method reselects
   * the next distinct user. The change is only persisted on Save.
   */
  private async selectAssigneeIn(cell: Locator, exclude = ''): Promise<string> {
    const input   = cell.locator('input.assign-search-input');
    const saveBtn = cell.locator('button.assign-save[title="Save"]');

    const pickExcluding = async (skip: string[]): Promise<string> => {
      await input.click();
      await input.fill('');   // reset any prior search text so the full user list renders
      await expect(this.assigneeOptions().first()).toBeVisible({ timeout: 10000 });
      let candidate = this.assigneeOptions().filter({ hasNotText: 'Please Select' });
      for (const s of skip) if (s) candidate = candidate.filter({ hasNotText: s });
      const target = candidate.first();
      const name = (await target.innerText()).trim();
      await target.click();
      await expect(input).toHaveValue(name);
      return name;
    };

    const skip = exclude ? [exclude] : [];
    let chosen = await pickExcluding(skip);
    const saveShown = await saveBtn.waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (!saveShown) {
      // First pick matched the current assignee — choose a different user to force a change.
      chosen = await pickExcluding([...skip, chosen]);
    }
    return chosen;
  }

  private async verifySaveCancelIn(cell: Locator): Promise<void> {
    await expect(cell.locator('button.assign-save[title="Save"] i.assign-save-icon')).toBeVisible();       // ✔ Save
    await expect(cell.locator('button.assign-cancel[title="Cancel"] i.assign-cancel-icon')).toBeVisible(); // ✖ Cancel
  }

  private async cancelEditIn(cell: Locator): Promise<void> {
    // Reverts the editor without persisting; the pencil (read-only) icon returns.
    await cell.locator('button.assign-cancel[title="Cancel"]').click();
    await expect(cell.locator('i.assign-edit-icon')).toBeVisible();
  }

  private async saveEditIn(cell: Locator): Promise<void> {
    // Commits the selection; the editor collapses back to the read-only pencil state.
    await cell.locator('button.assign-save[title="Save"]').click();
    await expect(cell.locator('i.assign-edit-icon')).toBeVisible();
  }

  private async displayValueIn(cell: Locator): Promise<string> {
    return (await cell.locator('.assign-username').innerText()).trim();
  }

  private async verifyNoClearControlIn(cell: Locator): Promise<void> {
    // The editor offers only a searchable input + Cancel — there is no clear/remove
    // affordance, neither on the field nor inside the opened user list.
    await expect(
      cell.locator('button[title="Clear"], button[title="Remove"], .assign-clear, .assign-remove, .searchable-dropdown-clear'),
    ).toHaveCount(0);
    await cell.locator('input.assign-search-input').click();
    const list = this.page.locator('.assign-user-searchable-dropdown-list');
    await expect(list.locator('.searchable-dropdown-item').first()).toBeVisible({ timeout: 10000 });
    await expect(
      list.locator('[title*="Clear"], [title*="Remove"], .clear-selection, .remove-selection'),
    ).toHaveCount(0);
  }

  // ── Assigned To (TC-060, TC-061, TC-062, TC-063, TC-067) ──────────────────────

  async verifyAssignedToColumnVisible(): Promise<void> {
    await expect(this.testRunHeaderRow).toContainText('Assigned To');
    await expect(this.assignedToCell(0)).toBeVisible();
  }

  async openAssignedToEditor(rowIndex = 0): Promise<void> {
    await this.openEditorIn(this.assignedToCell(rowIndex));
  }

  async verifyAssignedToEditorOpen(rowIndex = 0): Promise<void> {
    await this.verifyEditorOpenIn(this.assignedToCell(rowIndex));
  }

  async getAssignedToOptions(rowIndex = 0): Promise<string[]> {
    return this.readAssigneeOptionsIn(this.assignedToCell(rowIndex));
  }

  async selectAssigneeInEditor(rowIndex = 0): Promise<string> {
    return this.selectAssigneeIn(this.assignedToCell(rowIndex));
  }

  async selectDifferentAssigneeInEditor(rowIndex = 0, exclude = ''): Promise<string> {
    return this.selectAssigneeIn(this.assignedToCell(rowIndex), exclude);
  }

  async verifySaveAndCancelIconsVisible(rowIndex = 0): Promise<void> {
    await this.verifySaveCancelIn(this.assignedToCell(rowIndex));
  }

  async cancelAssignedToEdit(rowIndex = 0): Promise<void> {
    await this.cancelEditIn(this.assignedToCell(rowIndex));
  }

  async saveAssignedToEdit(rowIndex = 0): Promise<void> {
    await this.saveEditIn(this.assignedToCell(rowIndex));
  }

  async getAssignedToDisplay(rowIndex = 0): Promise<string> {
    return this.displayValueIn(this.assignedToCell(rowIndex));
  }

  async verifyAssignedToDisplay(expected: string, rowIndex = 0): Promise<void> {
    await expect(this.assignedToCell(rowIndex).locator('.assign-username')).toHaveText(expected);
  }

  async verifyNoClearOptionInAssignedToEditor(rowIndex = 0): Promise<void> {
    await this.verifyNoClearControlIn(this.assignedToCell(rowIndex));
  }

  // ── Business User (TC-064, TC-065, TC-066) ────────────────────────────────────

  async verifyBusinessUserColumnVisible(): Promise<void> {
    await expect(this.testRunHeaderRow).toContainText('Business User');
    await expect(this.businessUserCell(0)).toBeVisible();
  }

  async openBusinessUserEditor(rowIndex = 0): Promise<void> {
    await this.openEditorIn(this.businessUserCell(rowIndex));
  }

  async verifyBusinessUserEditorOpen(rowIndex = 0): Promise<void> {
    await this.verifyEditorOpenIn(this.businessUserCell(rowIndex));
  }

  async selectBusinessUserInEditor(rowIndex = 0): Promise<string> {
    return this.selectAssigneeIn(this.businessUserCell(rowIndex));
  }

  async selectDifferentBusinessUserInEditor(rowIndex = 0, exclude = ''): Promise<string> {
    return this.selectAssigneeIn(this.businessUserCell(rowIndex), exclude);
  }

  async verifyBusinessUserSaveAndCancelIconsVisible(rowIndex = 0): Promise<void> {
    await this.verifySaveCancelIn(this.businessUserCell(rowIndex));
  }

  async cancelBusinessUserEdit(rowIndex = 0): Promise<void> {
    await this.cancelEditIn(this.businessUserCell(rowIndex));
  }

  async saveBusinessUserEdit(rowIndex = 0): Promise<void> {
    await this.saveEditIn(this.businessUserCell(rowIndex));
  }

  async getBusinessUserDisplay(rowIndex = 0): Promise<string> {
    return this.displayValueIn(this.businessUserCell(rowIndex));
  }

  async verifyBusinessUserDisplay(expected: string, rowIndex = 0): Promise<void> {
    await expect(this.businessUserCell(rowIndex).locator('.assign-username')).toHaveText(expected);
  }

  // ─── Run button → Test Run Execution Details (TC-068) ─────────────────────────
  // The Action cell (10th column) holds a play-icon Run button that opens the execution
  // details panel in place (no URL change).

  private runButton(rowIndex = 0): Locator {
    return this.testRunRows.nth(rowIndex).locator('button.runButton');
  }

  async verifyRunButtonVisible(rowIndex = 0): Promise<void> {
    await expect(this.runButton(rowIndex)).toBeVisible();
  }

  async clickRunButton(rowIndex = 0): Promise<void> {
    await this.waitForReconnectIfNeeded();
    await this.runButton(rowIndex).click();
  }

  async getRowTestRunId(rowIndex = 0): Promise<string> {
    return (await this.getRowCells(rowIndex))[0].trim();
  }

  async getRowTestCaseName(rowIndex = 0): Promise<string> {
    return (await this.getRowCells(rowIndex))[2].trim();
  }
}
