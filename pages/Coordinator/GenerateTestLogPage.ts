import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object for the Coordinator → Generate Test Log screen (`/generate-test-log`).
 *
 * The COORDINATOR tab is permission-gated (the account needs the coordinator role) and hosts two
 * sub-tabs, "Generate Test Log" (default) and "Bulk Execution". The Generate Test Log screen has a
 * left panel (Test Case search → Version + Test Runs → GENERATE TEST LOG / CLEAR) and a right panel
 * that, after GENERATE, shows a read-only "Last Log" grid (previous execution) above an editable
 * "New Log" grid. Selectors verified against the live app (2026-06-18).
 *
 * Build notes / deviations from the documented spec:
 *  - The search icon (`i.fas.fa-search`) is decorative (`pointer-events:none`) — search is triggered
 *    by pressing Enter in the Test Case field, not by clicking the icon.
 *  - CLEAR starts DISABLED (the spec says enabled); it enables once a field is populated.
 *  - The New Log step Status options are Passed / Failed / Incomplete / Blocked / Unexecuted (the
 *    spec lists a 7-item superset that also has Retest / In Progress — not present in this build).
 *  - An invalid Test Case PID shows "Error fetching test runs. Please try again." (the spec wording
 *    is "No test runs found").
 *  - The UATNext Dev BU has no executable test data, so these tests run against the default
 *    qConnect - Sample Project BU where approved test cases with runs exist (see EXPECTED note).
 */
export class GenerateTestLogPage {
  private readonly page: Page;

  // Nav / sub-tabs
  readonly coordinatorTab: Locator;
  readonly generateTestLogSubTab: Locator;
  readonly bulkExecutionSubTab: Locator;

  // Left panel
  readonly generateButton: Locator;
  readonly clearButton: Locator;
  readonly testCaseInput: Locator;
  readonly searchIcon: Locator;
  readonly testCaseVersionInput: Locator;
  readonly testRunsInput: Locator;

  // Right panel
  readonly logsFrame: Locator;
  readonly lastLogTable: Locator;
  readonly newLogTable: Locator;
  readonly lastLogHeading: Locator;
  readonly newLogHeading: Locator;
  readonly lastLogStatus: Locator;
  readonly newLogStatus: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.coordinatorTab        = page.getByRole('link', { name: 'COORDINATOR' });
    this.generateTestLogSubTab = page.locator('button.sidebar-tab', { hasText: 'Generate Test Log' });
    this.bulkExecutionSubTab   = page.locator('button.sidebar-tab', { hasText: 'Bulk Execution' });

    // The GENERATE TEST LOG *action* button shares `.test-execution-button` with the New Log SAVE
    // button (`#createnewlog`); pin it by its (upper-case) label to avoid matching SAVE or the
    // title-case "Generate Test Log" sub-tab.
    this.generateButton       = page.locator('button.test-execution-button', { hasText: 'GENERATE TEST LOG' });
    this.clearButton          = page.locator('button.clear-button');
    this.testCaseInput        = page.locator('input[placeholder^="Enter test case pid"]');
    this.searchIcon           = page.locator('i.fas.fa-search.search-icon');
    this.testCaseVersionInput = page.locator('input.content-2[readonly]');
    this.testRunsInput        = page.locator('input[placeholder="Please Select"]');

    this.logsFrame      = page.locator('.test-logs-frame').first();
    this.lastLogTable   = page.locator('.last-log-table');
    this.newLogTable    = page.locator('.new-log-table');
    this.lastLogHeading = page.getByText('Last Log', { exact: true }).first();
    this.newLogHeading  = page.getByText('New Log', { exact: true }).first();
    this.lastLogStatus  = page.locator('#last-log-status-display input');
    this.newLogStatus   = page.locator('#new-log-status-dropdown input');
    this.saveButton     = page.locator('#createnewlog');
  }

  // ─── Navigation / load ──────────────────────────────────────────────────────

  async waitForScreenLoad(): Promise<void> {
    await this.page.waitForURL(/\/(coordinator|generate-test-log)/);
    await expect(this.testCaseInput).toBeVisible({ timeout: 20000 });
    await expect(this.generateButton).toBeVisible();
  }

  /**
   * Ensures the Generate Test Log sub-tab (not Bulk Execution) is active and its Test Case search
   * panel is rendered. Under some Business Units the COORDINATOR screen lands on the Bulk Execution
   * sub-tab — which has no Test Case search field — so click back to Generate Test Log if the search
   * field is absent. Polled because the screen can briefly show one sub-tab before settling on the
   * remembered one.
   */
  async ensureGenerateTestLogSubTab(): Promise<void> {
    await this.page.waitForURL(/\/(coordinator|generate-test-log)/);
    await expect(async () => {
      if (!(await this.testCaseInput.isVisible().catch(() => false))) {
        await this.generateTestLogSubTab.click({ timeout: 5000 }).catch(() => undefined);
      }
      await expect(this.testCaseInput).toBeVisible({ timeout: 5000 });
      await expect(this.generateButton).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 30000, intervals: [1000, 2000, 3000] });
  }

  // ─── Left-panel state getters ─────────────────────────────────────────────────

  async getTestCaseValue(): Promise<string> { return (await this.testCaseInput.inputValue()).trim(); }
  async getVersionValue(): Promise<string> { return (await this.testCaseVersionInput.inputValue()).trim(); }
  async getSelectedTestRun(): Promise<string> { return (await this.testRunsInput.inputValue()).trim(); }

  /** A button rendered with the `disabled` class (the app's disabled styling) or the DOM attribute. */
  private async isButtonDisabled(button: Locator): Promise<boolean> {
    return button.evaluate((el) => (el as HTMLButtonElement).disabled || el.className.includes('disabled'));
  }
  async isGenerateDisabled(): Promise<boolean> { return this.isButtonDisabled(this.generateButton); }
  async isClearDisabled(): Promise<boolean> { return this.isButtonDisabled(this.clearButton); }

  /** The GENERATE button's enabled "call to action" colour is orange (rgb(255, 183, 0)). */
  async getGenerateButtonColor(): Promise<string> {
    return this.generateButton.evaluate((el) => getComputedStyle(el).backgroundColor);
  }

  // ─── Search ───────────────────────────────────────────────────────────────────

  /**
   * Types a Test Case PID and triggers the search with Enter (the search icon is decorative).
   * On a cold start the project context can still be settling when the first Enter fires and the
   * search returns nothing, so the Enter is re-issued until the screen settles — either the Version
   * field populates (valid PID) or a no-runs/error message appears (invalid PID). This keeps both the
   * valid and invalid search paths reliable without masking a genuinely non-resolving PID.
   */
  /**
   * Types a PID with real keystrokes and triggers the search with Enter (one attempt). Real
   * keystrokes matter: Blazor binds the PID off the input/change events, and a plain fill() can leave
   * the bound value empty so the Enter-triggered search runs with no PID.
   */
  async searchTestCase(pid: string): Promise<void> {
    await this.testCaseInput.click();
    await this.testCaseInput.fill('');
    await this.testCaseInput.pressSequentially(pid, { delay: 15 });
    await this.testCaseInput.press('Enter');
  }

  /**
   * Searches a valid PID, RE-ISSUING the search until the Version field populates. The search is slow
   * and brittle on a cold context (the in-flight request can re-render and clear the input, and a
   * transient "Error fetching test runs" toast can flash even for a valid PID before the result
   * arrives), so each attempt re-types the full PID + Enter and waits specifically for the Version.
   */
  async searchValidTestCase(pid: string): Promise<void> {
    await expect(async () => {
      await this.searchTestCase(pid);
      await this.page.waitForTimeout(2500);
      expect((await this.testCaseVersionInput.inputValue()).trim()).not.toBe('');
    }).toPass({ timeout: 60000, intervals: [2000, 4000, 6000] });
  }

  /**
   * Searches an invalid PID and waits for the no-result state: a no-runs/error message with the
   * Version field staying empty.
   */
  async searchInvalidTestCase(pid: string): Promise<void> {
    const errorMessage = this.page.getByText(/error fetching test runs|no test runs found|not found/i).first();
    await expect(async () => {
      await this.searchTestCase(pid);
      await this.page.waitForTimeout(2500);
      expect(await errorMessage.isVisible().catch(() => false)).toBe(true);
      expect((await this.testCaseVersionInput.inputValue()).trim()).toBe('');
    }).toPass({ timeout: 60000, intervals: [2000, 4000, 6000] });
  }

  /** Waits until the search has populated the Version field (proof the test case resolved). */
  async waitForVersionPopulated(): Promise<void> {
    await expect(this.testCaseVersionInput).toHaveValue(/\S/, { timeout: 20000 });
  }

  // ─── Test Runs dropdown ─────────────────────────────────────────────────────────

  private testRunsList(): Locator {
    return this.testRunsInput.locator('xpath=ancestor::*[contains(@class,"searchable-dropdown-wrapper")][1]')
      .locator('.searchable-dropdown-item');
  }

  async openTestRunsDropdown(): Promise<void> {
    await this.testRunsInput.click();
    await expect(this.testRunsList().first()).toBeVisible({ timeout: 15000 });
  }

  async getTestRunOptions(): Promise<string[]> {
    await this.openTestRunsDropdown();
    return (await this.testRunsList().allInnerTexts()).map(t => t.trim()).filter(Boolean);
  }

  /**
   * Test Run options, or `[]` when the dropdown has no items. Unlike `getTestRunOptions`, this does
   * not throw when the current Business Unit's copy of the test case carries no runs (used by
   * GTL_TC_013 to assert another BU's runs are unreachable).
   */
  async getTestRunOptionsSafe(): Promise<string[]> {
    try {
      await this.testRunsInput.click();
      await expect(this.testRunsList().first()).toBeVisible({ timeout: 8000 });
      return (await this.testRunsList().allInnerTexts()).map(t => t.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  async selectTestRun(run: string): Promise<void> {
    await this.openTestRunsDropdown();
    await this.testRunsList().filter({ hasText: run }).first().click();
    await expect(this.testRunsInput).toHaveValue(run);
  }

  /** Selects the first available test run and returns its id. */
  async selectFirstTestRun(): Promise<string> {
    await this.openTestRunsDropdown();
    const first = this.testRunsList().first();
    const value = (await first.innerText()).trim();
    await first.click();
    await expect(this.testRunsInput).toHaveValue(value);
    return value;
  }

  // ─── Generate / Clear ───────────────────────────────────────────────────────────

  async clickGenerate(): Promise<void> {
    await this.generateButton.click();
    // Wait for the New Log grid rather than the `.test-logs-frame` wrapper: when the selected run has
    // never been executed the Last Log's frame renders empty/hidden and `.first()` resolves to it, but
    // the New Log is always populated after a generate.
    await expect(this.newLogTable.first()).toBeVisible({ timeout: 30000 });
  }

  async clickClear(): Promise<void> {
    await this.clearButton.click();
  }

  // ─── Right-panel grids ────────────────────────────────────────────────────────

  /** Column headers of a log grid (`which` = 'last' | 'new'). */
  async getColumnHeaders(which: 'last' | 'new'): Promise<string[]> {
    const table = which === 'last' ? this.lastLogTable : this.newLogTable;
    return (await table.locator('.test-log-header .table-header-cell').allInnerTexts())
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /** Per-step Status inputs of a log grid (Last Log = read-only, New Log = editable). */
  stepStatusInputs(which: 'last' | 'new'): Locator {
    const table = which === 'last' ? this.lastLogTable : this.newLogTable;
    return table.locator('input.test-run-text');
  }

  async getStepCount(which: 'last' | 'new'): Promise<number> {
    const table = which === 'last' ? this.lastLogTable : this.newLogTable;
    return table.locator('.table-row-cell.step-number').count();
  }

  /**
   * Waits for a generated log's step rows to stream in. `clickGenerate` returns once the log table
   * mounts, but Blazor streams the step rows a beat later (SignalR), so assertions that read step data
   * immediately can see zero rows. Poll the step count until the rows arrive.
   */
  async waitForSteps(which: 'last' | 'new', timeout = 20000): Promise<void> {
    await expect.poll(() => this.getStepCount(which), { timeout }).toBeGreaterThan(0);
  }

  /** Actual-result cells of a log grid. */
  actualResultCells(which: 'last' | 'new'): Locator {
    const table = which === 'last' ? this.lastLogTable : this.newLogTable;
    return table.locator('.table-row-cell-actual-result');
  }

  async getStepStatusValues(which: 'last' | 'new'): Promise<string[]> {
    const inputs = this.stepStatusInputs(which);
    const n = await inputs.count();
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push((await inputs.nth(i).inputValue()).trim());
    return out;
  }

  /** Opens the New Log step Status dropdown at `index` and returns its options. */
  async getNewLogStepStatusOptions(index = 0): Promise<string[]> {
    const wrapper = this.newLogTable.locator('.test-run-input-3.searchable-dropdown-wrapper').nth(index);
    await wrapper.locator('input').click();
    const items = wrapper.locator('.searchable-dropdown-item');
    await expect(items.first()).toBeVisible({ timeout: 10000 });
    return (await items.allInnerTexts()).map(t => t.trim()).filter(Boolean);
  }

  /** Selects a Status value for a New Log step. */
  async selectNewLogStepStatus(index: number, status: string): Promise<void> {
    const wrapper = this.newLogTable.locator('.test-run-input-3.searchable-dropdown-wrapper').nth(index);
    await wrapper.locator('input').click();
    await wrapper.locator('.searchable-dropdown-item').filter({ hasText: status }).first().click();
    await expect(wrapper.locator('input')).toHaveValue(status);
  }

  // The New Log Actual Result cell is a TinyMCE rich-text editor (a `.testcase-prototype` div that,
  // on click, mounts a `.tox-tinymce` iframe backed by a hidden textarea) — the same control the
  // Execute page uses. Text is typed into the iframe body, then flushed to the bound textarea so
  // Blazor's two-way binding (and SAVE) sees it; the editor↔Blazor sync is otherwise racy.

  /** Types an Actual Result value into a New Log step via its TinyMCE editor. */
  async enterNewLogActualResult(index: number, text: string): Promise<void> {
    const cell = this.actualResultCells('new').nth(index);
    await cell.locator('.testcase-prototype').click();
    const body = cell.frameLocator('iframe.tox-edit-area__iframe').locator('body');
    await body.waitFor({ state: 'visible', timeout: 10000 });
    await body.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
    await this.page.keyboard.type(text);
    // Blur, then force the editor to flush into its textarea and notify Blazor.
    await this.newLogHeading.click().catch(() => undefined);
    await this.flushActualEditor(cell);
    await expect(async () => {
      const committed = await cell.evaluate(el => {
        const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
        return ta ? ta.value : '';
      });
      if (!committed.includes(text)) await this.flushActualEditor(cell);
      expect(committed).toContain(text);
    }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
  }

  private async flushActualEditor(cell: Locator): Promise<void> {
    await cell.evaluate(el => {
      const tinymce = (window as unknown as { tinymce?: { triggerSave?: () => void } }).tinymce;
      tinymce?.triggerSave?.();
      const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
      if (ta) {
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }).catch(() => undefined);
  }

  async getNewLogActualResultText(index: number): Promise<string> {
    return (await this.actualResultCells('new').nth(index).innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Whether a New Log Actual Result cell still shows its "Click to add actual result" placeholder. */
  async newLogActualHasPlaceholder(index: number): Promise<boolean> {
    return (await this.actualResultCells('new').nth(index).locator('em').count()) > 0;
  }

  // ─── Save ───────────────────────────────────────────────────────────────────────

  async clickSave(): Promise<void> {
    await this.saveButton.click({ noWaitAfter: true });
  }

  async verifySaveSuccessMessage(message: RegExp): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 20000 });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  async verifyCoordinatorTabActive(): Promise<void> {
    await expect(this.coordinatorTab).toHaveClass(/active/);
    await expect(this.coordinatorTab).toHaveAttribute('aria-current', 'page');
  }

  async verifyGenerateTestLogSubTabActive(): Promise<void> {
    await expect(this.generateTestLogSubTab).toHaveClass(/active/);
  }

  /** Right panel shows no generated log (Last/New tables absent). */
  async verifyRightPanelBlank(): Promise<void> {
    await expect(this.logsFrame).toHaveCount(0);
  }
}
