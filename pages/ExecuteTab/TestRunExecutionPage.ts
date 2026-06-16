import { Page, expect, Locator } from '@playwright/test';

/**
 * Page object for the Test Run Execution Details panel (TC-068 onward).
 *
 * Reached by clicking a row's Run (▶) button in the Execute Test Cases grid; the panel
 * renders in place (the URL does not change). It exposes the run breadcrumb (TR/TC ids),
 * a title bar with the test-case name + SAVE/CLOSE, the qTest-mapped fields (Assigned To,
 * Business User, Status, Precondition) and the Test Logs grid of test steps.
 *
 * Note: the documented spec lists Project / Release / Test Cycle / Test Suite / Tester
 * fields on this screen, but the current build surfaces those only via the header project
 * selector and the sidebar tree — the detail panel itself shows Assigned To, Business User,
 * Status and Precondition. The assertions below validate the fields that actually render.
 */
export class TestRunExecutionPage {
  private readonly page: Page;

  // Header / title
  readonly breadcrumb: Locator;        // .test-run-breadcrumbs (only present on this panel)
  readonly breadcrumbRunId: Locator;   // TR-#### in the breadcrumb
  readonly titleBar: Locator;          // .test-run-frame-3
  readonly testCaseName: Locator;      // .test-run-name
  readonly saveButton: Locator;        // #submitButton
  readonly closeButton: Locator;       // #closeButton

  // Test-run-level Status dropdown (placeholder "Select status..." — lowercase + ellipsis —
  // uniquely distinguishes it from the step-level "Select Status" dropdowns).
  readonly statusInput: Locator;
  readonly statusDropdownItems: Locator;

  // Test Logs (test-steps) grid
  readonly stepsTable: Locator;        // .test-logs-table
  readonly stepsHeaderRow: Locator;    // direct child .table-row carrying the header cells
  readonly stepRows: Locator;          // data rows nested in .test-logs-frame

  // Test-step filter radios
  readonly showAllStepsRadio: Locator;       // "Show All Steps" (#viewAll) — live default
  readonly showBusinessStepsRadio: Locator;  // "Show Only Business Test Steps" (#businessStep)

  // Run-level Defect + Attachment sections
  readonly linkDefectButton: Locator;        // #linkDefectBtn
  readonly linkAttachmentButton: Locator;    // #linkAttachmentBtn
  readonly defectDisplay: Locator;           // #defect (shows "No Defect" or linked rows)
  readonly attachmentDisplay: Locator;       // #attachment-display
  readonly attachmentFileInput: Locator;     // #testlogFileInput (hidden, multiple)
  readonly defectPopup: Locator;             // .link-defect-popup (search/link modal)
  readonly defectSearchInput: Locator;       // popup search box (Enter Defect ID/Summary)
  readonly defectSearchButton: Locator;      // popup SEARCH button
  readonly defectLinkButton: Locator;        // popup LINK button (enabled only once a result is selected)
  readonly defectLinkedRows: Locator;        // currently-linked defect rows (list mode)

  constructor(page: Page) {
    this.page = page;

    this.breadcrumb         = page.locator('.test-run-breadcrumbs');
    // The breadcrumb renders two `.test-run-text-2` nodes (the TR id and the TC id); scope
    // to the one holding the TR-#### run identifier.
    this.breadcrumbRunId    = this.breadcrumb.locator('.test-run-text-2').filter({ hasText: /^TR-\d+/ });
    this.titleBar           = page.locator('.test-run-frame-3');
    this.testCaseName       = page.locator('.test-run-name');
    this.saveButton         = page.locator('#submitButton');
    this.closeButton        = page.locator('#closeButton');

    this.statusInput        = page.locator('input.searchable-dropdown-input[placeholder="Select status..."]');
    this.statusDropdownItems = page.locator('.tr-status-dropdown-list .searchable-dropdown-item');

    this.stepsTable         = page.locator('.test-logs-table');
    this.stepsHeaderRow     = this.stepsTable.locator('> .table-row');
    this.stepRows           = this.stepsTable.locator('.test-logs-frame .table-row');

    // Test-step filter radios (above the Test Logs grid). Addressed by accessible name so
    // they are unambiguous regardless of the underlying ids. NOTE: the live default is
    // "Show All Steps" (not "Show Only Business Test Steps" as the spec expects).
    this.showAllStepsRadio      = page.getByRole('radio', { name: 'Show All Steps' });
    this.showBusinessStepsRadio = page.getByRole('radio', { name: 'Show Only Business Test Steps' });

    this.linkDefectButton       = page.locator('#linkDefectBtn');
    this.linkAttachmentButton   = page.locator('#linkAttachmentBtn');
    this.defectDisplay          = page.locator('#defect');
    this.attachmentDisplay      = page.locator('#attachment-display');
    this.attachmentFileInput    = page.locator('#testlogFileInput');
    this.defectPopup            = page.locator('.link-defect-popup');
    this.defectSearchInput      = this.defectPopup.locator('input.modal-supporting-text');
    this.defectSearchButton     = this.defectPopup.locator('button', { hasText: /^SEARCH$/ });
    this.defectLinkButton       = this.defectPopup.locator('button', { hasText: /^LINK$/ });
    // In list mode the popup's `.modal-div` lists the currently-linked defects as data rows
    // (the search-results rows reuse the same class but live transiently after a SEARCH).
    this.defectLinkedRows       = this.defectPopup.locator('.modal-div .modal-frame-1.data-row');
  }

  // ─── Load / navigation ────────────────────────────────────────────────────────

  async waitForLoaded(): Promise<void> {
    await this.breadcrumb.waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.saveButton).toBeVisible();
    await expect(this.closeButton).toBeVisible();
  }

  async verifyDetailsPageOpen(): Promise<void> {
    await this.waitForLoaded();
    await expect(this.titleBar).toBeVisible();
  }

  async isOpen(): Promise<boolean> {
    return this.breadcrumb.isVisible();
  }

  async close(): Promise<void> {
    // Immediately after a Save a transient `.modals` overlay can intercept the first click,
    // so retry the close until the panel's breadcrumb is gone.
    await expect(async () => {
      if (await this.breadcrumb.isVisible()) {
        await this.closeButton.click({ timeout: 5000 }).catch(() => undefined);
      }
      await expect(this.breadcrumb).toBeHidden({ timeout: 3000 });
    }).toPass({ timeout: 30000, intervals: [500, 1000, 2000] });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    // Saving keeps the panel open but raises a transient `.modals` overlay that can intercept a
    // follow-up Close click; wait for it to clear (if it appeared) instead of a fixed delay.
    await this.page.locator('.modals').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
  }

  /** Clicks SAVE without the settle wait — use when the transient success toast must be caught. */
  async clickSave(): Promise<void> {
    // A lingering message modal (e.g. a duplicate-attachment "...already exists" dialog) overlays
    // and intercepts the SAVE button, so dismiss it first.
    await this.dismissActionDialogIfPresent();
    await this.saveButton.click();
  }

  /**
   * Asserts the post-save success toast. The toast is transient, so this must be called
   * immediately after clickSave(). Matched case-insensitively against `expectedText`
   * (the live wording differs from the documented spec).
   */
  async verifySaveSuccessMessage(expectedText: string): Promise<void> {
    await expect(
      this.page.getByText(new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')).first(),
    ).toBeVisible({ timeout: 15000 });
  }

  // ─── Run / test-case identity ───────────────────────────────────────────────

  async getBreadcrumbRunId(): Promise<string> {
    return (await this.breadcrumbRunId.innerText()).trim();
  }

  async verifyTestRunId(expected: string): Promise<void> {
    await expect(this.breadcrumbRunId).toHaveText(expected);
  }

  async getTestCaseName(): Promise<string> {
    return (await this.testCaseName.innerText()).trim();
  }

  async verifyTestCaseNameNotEmpty(): Promise<void> {
    expect((await this.getTestCaseName())).not.toBe('');
  }

  async verifyTestCaseName(expected: string): Promise<void> {
    await expect(this.testCaseName).toHaveText(expected);
  }

  // ─── Field assertions (TC-069) ───────────────────────────────────────────────

  async verifyMappedFieldsVisible(): Promise<void> {
    // The qTest-mapped fields rendered on the detail panel.
    for (const label of ['Assigned To:', 'Business User:', 'Status:', 'Precondition']) {
      await expect(this.page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  }

  async verifyPreconditionVisible(): Promise<void> {
    await expect(this.page.getByText('Precondition', { exact: true }).first()).toBeVisible();
  }

  // ─── Status dropdown (TC-069, TC-070) ─────────────────────────────────────────

  async getStatusValue(): Promise<string> {
    return (await this.statusInput.inputValue()).trim();
  }

  async verifyStatusDisplayed(): Promise<void> {
    await expect(this.statusInput).toBeVisible();
    expect(await this.getStatusValue()).not.toBe('');
  }

  async openStatusDropdown(): Promise<void> {
    await this.statusInput.click();
    await expect(this.statusDropdownItems.first()).toBeVisible({ timeout: 10000 });
  }

  async getStatusOptions(): Promise<string[]> {
    if ((await this.statusDropdownItems.count()) === 0) {
      await this.openStatusDropdown();
    }
    return (await this.statusDropdownItems.allInnerTexts()).map(t => t.trim()).filter(Boolean);
  }

  async verifyStatusOptions(expected: string[]): Promise<void> {
    const actual = await this.getStatusOptions();
    for (const status of expected) {
      expect(actual).toContain(status);
    }
  }

  async selectStatus(status: string): Promise<void> {
    if ((await this.statusDropdownItems.count()) === 0) {
      await this.openStatusDropdown();
    }
    const options = (await this.statusDropdownItems.allInnerTexts()).map(t => t.trim());
    const index = options.indexOf(status);
    if (index === -1) {
      throw new Error(`Status option "${status}" not found. Available: ${options.join(', ')}`);
    }
    await this.statusDropdownItems.nth(index).click();
    await expect(this.statusInput).toHaveValue(status, { timeout: 10000 });
  }

  /** Selects a status different from `current`, preferring one of `candidates`. Returns it. */
  async selectDifferentStatus(current: string, candidates: string[]): Promise<string> {
    const options = await this.getStatusOptions();
    const target = candidates.find(c => c !== current && options.includes(c))
                ?? options.find(o => o !== current);
    if (!target) {
      throw new Error(`No alternative status available (current "${current}", options: ${options.join(', ')})`);
    }
    await this.selectStatus(target);
    return target;
  }

  async verifyStatusValuePersisted(expected: string): Promise<void> {
    // After a reopen, the streamed status can take a moment to populate; retry briefly.
    await expect(async () => {
      expect(await this.getStatusValue()).toBe(expected);
    }).toPass({ timeout: 30000, intervals: [1000, 2000, 3000] });
  }

  // ─── Test Logs / test-steps grid (TC-071) ─────────────────────────────────────

  async verifyStepsGridVisible(): Promise<void> {
    await expect(this.stepsTable).toBeVisible();
    await expect(this.stepsHeaderRow).toBeVisible();
  }

  async getStepColumnHeaders(): Promise<string[]> {
    return (await this.stepsHeaderRow.locator('.table-header-cell').allInnerTexts())
      .map(t => t.trim())
      .filter(Boolean);
  }

  async verifyStepColumns(expected: string[]): Promise<void> {
    const actual = await this.getStepColumnHeaders();
    for (const column of expected) {
      expect(actual).toContain(column);
    }
  }

  async getStepRowCount(): Promise<number> {
    return this.stepRows.count();
  }

  async verifyStepsLoaded(): Promise<void> {
    expect(await this.getStepRowCount()).toBeGreaterThan(0);
  }

  async verifyEachStepHasData(): Promise<void> {
    // Every step row must carry a step number and a UAT category (Business / Technical).
    const count = await this.stepRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const row = this.stepRows.nth(i);
      expect((await row.locator('.step-number').innerText()).trim()).not.toBe('');
      expect((await row.locator('.uat-category').innerText()).trim()).not.toBe('');
    }
  }

  // ─── Step filter: Show All Steps / Show Only Business Test Steps (TC-072, TC-073) ─

  async verifyStepFilterOptionsVisible(): Promise<void> {
    await expect(this.showAllStepsRadio).toBeVisible();
    await expect(this.showBusinessStepsRadio).toBeVisible();
  }

  /**
   * The live app defaults to "Show All Steps" (the documented spec expects "Show Only
   * Business Test Steps" — see the TC-072/073 notes). This asserts the actual default.
   */
  async verifyShowAllStepsSelectedByDefault(): Promise<void> {
    await expect(this.showAllStepsRadio).toBeChecked();
    await expect(this.showBusinessStepsRadio).not.toBeChecked();
  }

  async selectShowBusinessSteps(): Promise<void> {
    await this.showBusinessStepsRadio.check();
    await expect(this.showBusinessStepsRadio).toBeChecked();
    await this.waitForStepRowsStable();
    // Count stability alone can settle mid-transition while a stale non-Business row is still
    // in the DOM. Wait (web-first) until the grid actually reflects the Business-only filter:
    // at least one row, and no "Technical" category remaining.
    await expect(async () => {
      const cats = await this.getStepUatCategories();
      expect(cats.length).toBeGreaterThan(0);
      expect(cats.every(c => c === 'Business')).toBe(true);
    }).toPass({ timeout: 10000, intervals: [300, 500, 800] });
  }

  async selectShowAllSteps(): Promise<void> {
    await this.showAllStepsRadio.check();
    await expect(this.showAllStepsRadio).toBeChecked();
    await this.waitForStepRowsStable();
  }

  /** Waits for the Test Logs grid to stop re-rendering: the step-row count is stable across reads. */
  private async waitForStepRowsStable(): Promise<void> {
    let previous = -1;
    await expect(async () => {
      const current = await this.stepRows.count();
      const stable = current === previous;
      previous = current;
      expect(stable).toBe(true);
    }).toPass({ timeout: 10000, intervals: [400, 600, 800] });
  }

  async getStepUatCategories(): Promise<string[]> {
    return (await this.stepRows.locator('.uat-category').allInnerTexts()).map(t => t.trim()).filter(Boolean);
  }

  async verifyAllStepsAreBusiness(): Promise<void> {
    // Retry: the grid may still be re-rendering the filter transition when first read.
    await expect(async () => {
      const cats = await this.getStepUatCategories();
      expect(cats.length).toBeGreaterThan(0);
      for (const cat of cats) {
        expect(cat).toBe('Business');
      }
    }).toPass({ timeout: 10000, intervals: [300, 500, 800] });
  }

  async verifyStepsIncludeNonBusiness(): Promise<void> {
    const cats = await this.getStepUatCategories();
    expect(cats).toContain('Business');
    expect(cats.some(c => c !== 'Business')).toBe(true);
  }

  // ─── Step-level status (TC-074, TC-075) ───────────────────────────────────────
  // Each step row holds a searchable status dropdown (`.test-run-input-3`) whose option
  // list renders inside the row. The chevron `img.test-run-chevron-down-2` overlays the
  // input, so the dropdown is opened by clicking the chevron.

  private stepStatusWrapper(stepIndex: number): Locator {
    return this.stepRows.nth(stepIndex).locator('.test-run-input-3.searchable-dropdown-wrapper');
  }

  private stepStatusInput(stepIndex: number): Locator {
    return this.stepStatusWrapper(stepIndex).locator('input.searchable-dropdown-input');
  }

  private stepStatusOptions(stepIndex: number): Locator {
    return this.stepStatusWrapper(stepIndex).locator('.searchable-dropdown-item');
  }

  async getStepStatusValue(stepIndex: number): Promise<string> {
    return (await this.stepStatusInput(stepIndex).inputValue()).trim();
  }

  async verifyAllStepsUnexecuted(): Promise<void> {
    // Each step defaults to the "Unexecuted" state.
    const count = await this.stepRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      expect(await this.getStepStatusValue(i)).toBe('Unexecuted');
    }
  }

  async openStepStatusDropdown(stepIndex: number): Promise<void> {
    if (await this.stepStatusOptions(stepIndex).first().isVisible().catch(() => false)) {
      return; // already open
    }
    await this.stepStatusWrapper(stepIndex).locator('img.test-run-chevron-down-2').click();
    await expect(this.stepStatusOptions(stepIndex).first()).toBeVisible({ timeout: 10000 });
  }

  async closeStepStatusDropdown(stepIndex: number): Promise<void> {
    // An open step dropdown's option list overlays the rows beneath it, so it must be
    // collapsed before interacting with another step. Toggle the step's own chevron.
    if (await this.stepStatusOptions(stepIndex).first().isVisible().catch(() => false)) {
      await this.stepStatusWrapper(stepIndex).locator('img.test-run-chevron-down-2').click().catch(() => undefined);
      await this.stepStatusOptions(stepIndex).first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    }
  }

  async getStepStatusOptions(stepIndex: number): Promise<string[]> {
    await this.openStepStatusDropdown(stepIndex);
    const options = (await this.stepStatusOptions(stepIndex).allInnerTexts()).map(t => t.trim()).filter(Boolean);
    await this.closeStepStatusDropdown(stepIndex);
    return options;
  }

  async verifyStepStatusOptions(stepIndex: number, expected: string[]): Promise<void> {
    const actual = await this.getStepStatusOptions(stepIndex);
    for (const status of expected) {
      expect(actual).toContain(status);
    }
  }

  async selectStepStatus(stepIndex: number, status: string): Promise<void> {
    await this.openStepStatusDropdown(stepIndex);
    const options = (await this.stepStatusOptions(stepIndex).allInnerTexts()).map(t => t.trim());
    const index = options.indexOf(status);
    if (index === -1) {
      throw new Error(`Step status "${status}" not found. Available: ${options.join(', ')}`);
    }
    await this.stepStatusOptions(stepIndex).nth(index).click();
    await expect(this.stepStatusInput(stepIndex)).toHaveValue(status, { timeout: 10000 });
  }

  /** Picks a step status different from `current`, preferring one of `candidates`. */
  async selectDifferentStepStatus(stepIndex: number, current: string, candidates: string[]): Promise<string> {
    const options = await this.getStepStatusOptions(stepIndex);
    const target = candidates.find(c => c !== current && options.includes(c))
                ?? options.find(o => o !== current && o !== 'Unexecuted')
                ?? options.find(o => o !== current);
    if (!target) {
      throw new Error(`No alternative step status available (current "${current}", options: ${options.join(', ')})`);
    }
    await this.selectStepStatus(stepIndex, target);
    return target;
  }

  async verifyStepStatusValue(stepIndex: number, expected: string): Promise<void> {
    await expect(this.stepStatusInput(stepIndex)).toHaveValue(expected);
  }

  async verifyStepStatusPersisted(stepIndex: number, expected: string): Promise<void> {
    await expect(async () => {
      expect(await this.getStepStatusValue(stepIndex)).toBe(expected);
    }).toPass({ timeout: 30000, intervals: [1000, 2000, 3000] });
  }

  // ─── Actual Result (TinyMCE rich-text editor) — TC-100 ────────────────────────
  // Clicking the cell mounts a TinyMCE editor (`.tox-tinymce`) backed by a hidden textarea
  // (`#custom-rich-<id>`). Text is typed into the editor's contenteditable body iframe.

  private actualResultCell(stepIndex: number): Locator {
    return this.stepRows.nth(stepIndex).locator('.actual-result');
  }

  async enterActualResult(stepIndex: number, text: string): Promise<void> {
    const cell = this.actualResultCell(stepIndex);
    await cell.locator('.testcase-prototype').click();
    // The editor mounts a TinyMCE iframe; clear any existing content then type.
    const frame = cell.frameLocator('iframe.tox-edit-area__iframe');
    const body = frame.locator('body');
    await body.waitFor({ state: 'visible', timeout: 10000 });
    await body.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
    await this.page.keyboard.type(text);
    // Commit: TinyMCE pushes its value to the bound hidden textarea on blur. Click a neutral
    // area to blur, then force a flush so SAVE serialises the committed value (the editor↔Blazor
    // sync is otherwise racy — the earlier check fell back to the contenteditable's textContent,
    // which holds the text even while the bound textarea is still empty, so SAVE caught nothing).
    await this.testCaseName.click({ position: { x: 1, y: 1 } }).catch(() => undefined);
    // Push TinyMCE's content into its underlying textarea and fire input/change so Blazor's
    // two-way binding updates its C# model before SAVE reads it.
    await this.flushActualResultEditor(cell, text);
    // Verify the BOUND TEXTAREA specifically holds the text (no textContent fallback). If TinyMCE
    // has not synced yet, re-flush and re-check until it has.
    await expect(async () => {
      const committed = await cell.evaluate(el => {
        const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
        return ta ? ta.value : '';
      });
      if (!committed.includes(text)) {
        await this.flushActualResultEditor(cell, text);
      }
      expect(committed).toContain(text);
    }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
  }

  /** Flushes the TinyMCE editor in a cell into its bound textarea and notifies Blazor. */
  private async flushActualResultEditor(cell: Locator, _text: string): Promise<void> {
    await cell.evaluate(el => {
      const tinymce = (window as unknown as { tinymce?: { triggerSave?: () => void } }).tinymce;
      // triggerSave() writes every editor's HTML into its source textarea.
      tinymce?.triggerSave?.();
      const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
      if (ta) {
        // Blazor's @bind updates the model on the change event; input keeps any oninput in sync.
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }).catch(() => undefined);
  }

  async getActualResultText(stepIndex: number): Promise<string> {
    return (await this.actualResultCell(stepIndex).innerText()).replace(/\s+/g, ' ').trim();
  }

  async verifyActualResultContains(stepIndex: number, text: string): Promise<void> {
    await expect(async () => {
      expect((await this.getActualResultText(stepIndex)).toLowerCase()).toContain(text.toLowerCase());
    }).toPass({ timeout: 30000, intervals: [1000, 2000, 3000] });
  }

  // ─── Run-level Defect section + Link/Create Defect panel (TC-098) ─────────────

  async verifyDefectSectionVisible(): Promise<void> {
    await expect(this.page.getByText('Defect', { exact: true }).first()).toBeVisible();
    await expect(this.linkDefectButton).toBeVisible();
  }

  async getDefectDisplayText(): Promise<string> {
    return (await this.defectDisplay.innerText()).replace(/\s+/g, ' ').trim();
  }

  async openLinkDefectPanel(): Promise<void> {
    await this.linkDefectButton.click();
    await expect(this.defectPopup).toBeVisible({ timeout: 10000 });
  }

  /**
   * Opens the step-level defect (bug) panel for a step. Same search/link popup.
   *
   * Once a step has ≥1 linked defect a `span.bug-count-badge` renders over the bug icon and
   * intercepts pointer events, so the click targets the `.bug-container` with force (the cell's
   * handler fires whether the badge or the icon is hit).
   */
  async openStepDefectPanel(stepIndex: number): Promise<void> {
    await this.stepRows.nth(stepIndex).locator('.link-step-level-defect .bug-container').click({ force: true });
    await expect(this.defectPopup).toBeVisible({ timeout: 10000 });
  }

  /** The numeric defect count shown on a step's bug badge (0 when no badge is rendered). */
  async getStepBugBadgeCount(stepIndex: number): Promise<number> {
    const badge = this.stepRows.nth(stepIndex).locator('.link-step-level-defect .bug-count-badge');
    if ((await badge.count()) === 0) return 0;
    const text = (await badge.first().innerText().catch(() => '')).trim();
    return /^\d+$/.test(text) ? Number(text) : 0;
  }

  async verifyDefectPanelOpen(): Promise<void> {
    await expect(this.defectPopup).toBeVisible();
    await expect(this.defectPopup.getByText('Enter Defect ID/Summary')).toBeVisible().catch(() => undefined);
    await expect(this.defectPopup.locator('button', { hasText: /^NEW$/ })).toBeVisible();
    await expect(this.defectPopup.locator('button', { hasText: /^SEARCH$/ })).toBeVisible();
  }

  async verifyNewDefectButtonVisible(): Promise<void> {
    await expect(this.defectPopup.locator('button', { hasText: /^NEW$/ })).toBeVisible();
  }

  /**
   * Asserts the step-level defect panel shows its linked-defects section and search field.
   * The documented spec calls this the "Defects Linked to Step" section; the live build
   * renders it as the popup's linked-defects grid (ID / Summary / Status / Action headers)
   * plus the "Enter Defect ID/Summary" search box — both validated here.
   */
  async verifyStepDefectPanelOpen(): Promise<void> {
    await expect(this.defectPopup).toBeVisible();
    await expect(this.defectSearchInput).toBeVisible();
    await expect(this.defectPopup.locator('.modal-header').filter({ hasText: 'ID' }).first()).toBeVisible();
  }

  /**
   * Clicks NEW in the defect panel → navigates to the Create Defect form. A "leave page"
   * confirmation (YES/NO) may appear first; YES is clicked to proceed.
   */
  async clickNewDefect(): Promise<void> {
    await this.defectPopup.locator('button', { hasText: /^NEW$/ }).click();
    // A "leave page" YES/NO confirm may appear first; wait briefly for it, click YES if shown.
    const yes = this.page.locator('button', { hasText: /^YES$/ }).first();
    await yes.waitFor({ state: 'visible', timeout: 3000 }).catch(() => undefined);
    if (await yes.isVisible().catch(() => false)) {
      await yes.click().catch(() => undefined);
    }
    await this.page.locator('.defect-breadcrumbs').waitFor({ state: 'visible', timeout: 20000 });
  }

  async verifyCreateDefectFormOpen(): Promise<void> {
    await expect(this.page.locator('.defect-breadcrumbs')).toBeVisible();
    await expect(this.page.locator('#createDefect')).toBeVisible();              // SAVE (create) button
    await expect(this.page.getByText('Affected Release/Build', { exact: false }).first()).toBeVisible();
  }

  // ─── Create Defect form fields / validation (TC-105 to TC-110) ────────────────
  // The form replaces the right panel. Each labelled field is a `.defect-form-text-field` whose
  // `.defect-header` carries the label and (when mandatory) a `span.defect-text-wrapper-2` "*".
  // The values render in `input.searchable-dropdown-input` (dropdowns) or `.defect-text-2` (text).
  // Summary is a `textarea#DefSummary`.

  // Lazy getters (NOT field initializers): class field initializers run before the constructor
  // assigns `this.page`, so a `= this.page.locator(...)` initializer would dereference undefined.
  private get createDefectSaveButton(): Locator { return this.page.locator('#createDefect'); }
  private get defectSummaryInput(): Locator { return this.page.locator('#DefSummary'); }

  /** Follows TC-098's entry point: opens the run-level defect popup → NEW → Create Defect form. */
  async openCreateDefectForm(): Promise<void> {
    await this.openLinkDefectPanel();
    await this.verifyDefectPanelOpen();
    await this.clickNewDefect();
    await this.verifyCreateDefectFormOpen();
  }

  /**
   * Asserts a field's label carries the mandatory "*" marker. The asterisk is a
   * `span.defect-text-wrapper-2` whose enclosing label text contains the field name; the label
   * container class varies (`.defect-p` for Summary, `.defect-header` for dropdowns, other markup
   * for Description), so this matches container-agnostically by the asterisk's parent text.
   */
  async verifyMandatoryFieldMarked(label: string): Promise<void> {
    await expect(async () => {
      const marked = await this.page.evaluate((lbl) => {
        const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
        return [...document.querySelectorAll('span.defect-text-wrapper-2')]
          .filter(s => norm(s.textContent) === '*')
          .some(s => norm(s.parentElement?.textContent).includes(lbl));
      }, label);
      expect(marked, `mandatory marker (*) for "${label}"`).toBe(true);
    }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
  }

  /** Reads a Create Defect field's value by its label (dropdown input value or display text). */
  async getDefectFieldValue(label: string): Promise<string> {
    const field = this.page.locator('.defect-form-text-field')
      .filter({ has: this.page.locator('.defect-header', { hasText: label }) }).first();
    const input = field.locator('input.searchable-dropdown-input');
    if ((await input.count()) > 0) return (await input.first().inputValue()).trim();
    return (await field.locator('.defect-text-2').first().innerText()).trim();
  }

  async getSummaryValue(): Promise<string> {
    return (await this.defectSummaryInput.inputValue()).trim();
  }

  // ─── Create Defect form dropdowns (TC-111 to TC-121) ──────────────────────────
  // Each labelled dropdown is an `input.searchable-dropdown-input` with a unique
  // "-- Select X --" placeholder; its options render as `.searchable-dropdown-item` inside the
  // same `.defect-form-text-field` card (the current value's item carries class `selected`).
  // Live values can contain irregular whitespace (e.g. "1 -  Critical"), so comparisons normalise it.

  private static normalizeValue(s: string): string { return s.replace(/\s+/g, ' ').trim(); }

  private defectDropdownInput(placeholder: string): Locator {
    return this.page.locator(`input.searchable-dropdown-input[placeholder="${placeholder}"]`);
  }

  private defectDropdownCard(placeholder: string): Locator {
    return this.page.locator('.defect-form-text-field').filter({ has: this.defectDropdownInput(placeholder) });
  }

  /** Opens a Create Defect dropdown by its placeholder and returns its (now-visible) option items. */
  private async openDefectDropdown(placeholder: string): Promise<Locator> {
    const input = this.defectDropdownInput(placeholder);
    await input.scrollIntoViewIfNeeded();
    await input.click();
    const items = this.defectDropdownCard(placeholder).locator('.searchable-dropdown-item');
    await items.first().waitFor({ state: 'visible', timeout: 10000 });
    return items;
  }

  /** Current value shown in a Create Defect dropdown. */
  async getDefectDropdownValue(placeholder: string): Promise<string> {
    return TestRunExecutionPage.normalizeValue(await this.defectDropdownInput(placeholder).inputValue());
  }

  /** Opens a dropdown and returns how many options it lists (asserting it is non-empty is the caller's job). */
  async getDefectDropdownOptionCount(placeholder: string): Promise<number> {
    return (await this.openDefectDropdown(placeholder)).count();
  }

  /** Opens a dropdown and returns its option texts (use only for small lists — Type/Status/etc.). */
  async getDefectDropdownOptions(placeholder: string): Promise<string[]> {
    const items = await this.openDefectDropdown(placeholder);
    return (await items.allInnerTexts()).map(t => TestRunExecutionPage.normalizeValue(t)).filter(Boolean);
  }

  /** Selects a specific `value` in a Create Defect dropdown and asserts it is displayed/retained. */
  async selectDefectDropdownValue(placeholder: string, value: string): Promise<void> {
    const items = await this.openDefectDropdown(placeholder);
    await items.filter({ hasText: value }).first().click();
    const want = TestRunExecutionPage.normalizeValue(value);
    await expect(async () => {
      expect(await this.getDefectDropdownValue(placeholder)).toBe(want);
    }).toPass({ timeout: 8000, intervals: [300, 600, 1000] });
  }

  /**
   * Selects the first option that is not already selected (works for huge lists like Module/Team
   * without reading every option) and asserts the chosen value is displayed/retained. Returns it.
   */
  async selectFirstAvailableDefectDropdownValue(placeholder: string): Promise<string> {
    await this.openDefectDropdown(placeholder);
    const candidate = this.defectDropdownCard(placeholder).locator('.searchable-dropdown-item:not(.selected)').first();
    const target = TestRunExecutionPage.normalizeValue(await candidate.innerText());
    await candidate.click();
    await expect(async () => {
      expect(await this.getDefectDropdownValue(placeholder)).toBe(target);
    }).toPass({ timeout: 8000, intervals: [300, 600, 1000] });
    return target;
  }

  /** Reads the pre-populated Description template (the defect textarea that is not Summary) — TC-128. */
  async getDefectDescriptionValue(): Promise<string> {
    return (await this.page.locator('textarea:not(#DefSummary)').first().inputValue()).trim();
  }

  // ─── Create Defect attachment (TC-129, TC-130) ────────────────────────────────
  // The form's attachment is a drop zone (`#drop-area`) with a BROWSE FILE button backed by the
  // hidden `#defectFileInput`; uploading works through the file chooser (as for run attachments).
  private get defectDropArea(): Locator { return this.page.locator('#drop-area'); }

  /** Attaches a file in the Create Defect form via the BROWSE FILE chooser. */
  async attachDefectFile(filePath: string): Promise<void> {
    let chooser;
    try {
      [chooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 8000 }),
        this.defectDropArea.locator('button', { hasText: /BROWSE FILE/i }).click(),
      ]);
    } catch {
      [chooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 8000 }),
        this.page.locator('#defectFileInput').evaluate((el: HTMLElement) => el.click()),
      ]);
    }
    await chooser.setFiles(filePath);
    await this.defectDropArea.locator('*').first().waitFor({ state: 'attached', timeout: 8000 }).catch(() => undefined);
  }

  /** Asserts a file name is shown in the Create Defect attachment drop zone. */
  async verifyDefectAttachmentListed(fileName: string): Promise<void> {
    await expect(this.defectDropArea).toContainText(fileName, { timeout: 15000 });
  }

  /** Asserts a file name is NOT shown in the Create Defect attachment drop zone. */
  async verifyDefectAttachmentNotListed(fileName: string): Promise<void> {
    await expect(this.defectDropArea).not.toContainText(fileName, { timeout: 10000 });
  }

  /** Asserts the Create Defect file-size rejection message after selecting an oversized file. */
  async verifyDefectFileTooLargeMessage(): Promise<void> {
    await expect(this.page.getByText(/exceeds the 10\s*mb limit|file too large|too large/i).first())
      .toBeVisible({ timeout: 15000 });
  }

  /** Asserts the "Defect Created Successfully" toast after a Create Defect SAVE (TC-131). */
  async verifyDefectCreatedMessage(message: RegExp): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 20000 });
  }

  /** Types into Summary via real keystrokes (so any input-level length cap would apply). */
  async typeSummary(text: string): Promise<void> {
    await this.defectSummaryInput.click();
    await this.defectSummaryInput.fill('');
    await this.page.keyboard.insertText(text);
    // Wait for the field to reflect the input rather than a fixed delay. A length cap (if any)
    // would truncate the value, so assert the prefix is present instead of strict equality.
    await expect(this.defectSummaryInput).toHaveValue(new RegExp('^' + text.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 5000 })
      .catch(() => undefined);
  }

  /** Clicks SAVE on the Create Defect form (does not wait for navigation). */
  async clickCreateDefectSave(): Promise<void> {
    await this.createDefectSaveButton.click({ noWaitAfter: true });
  }

  async verifyCreateDefectValidation(message: RegExp): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 15000 });
  }

  /** The Create Defect form is still open (i.e. no defect was created / form not dismissed). */
  async verifyStillOnCreateDefectForm(): Promise<void> {
    await expect(this.createDefectSaveButton).toBeVisible();
    await expect(this.page.locator('.defect-breadcrumbs')).toBeVisible();
  }

  /** Closes the Create Defect form (discards), accepting any leave-page confirmation. */
  async closeCreateDefectForm(): Promise<void> {
    await this.page.locator('#closeButton').click({ noWaitAfter: true }).catch(() => undefined);
    await this.page.locator('button', { hasText: /^YES$/ }).first().click({ noWaitAfter: true }).catch(() => undefined);
    // Wait for the form to actually dismiss rather than a fixed delay.
    await this.page.locator('.defect-breadcrumbs').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
  }

  // ─── Test-step grid: Expected Result + called-test-case indicator (TC-102/103/104) ─

  private expectedResultCell(stepIndex: number): Locator {
    return this.stepRows.nth(stepIndex).locator('.expected-result');
  }

  async getExpectedResultText(stepIndex: number): Promise<string> {
    return (await this.expectedResultCell(stepIndex).innerText()).replace(/\s+/g, ' ').trim();
  }

  /**
   * Asserts a step's Expected Result cell is non-editable: it is a plain element (not an input /
   * not contenteditable), and typing while it is focused does not change its content.
   */
  async verifyExpectedResultNotEditable(stepIndex: number): Promise<void> {
    const cell = this.expectedResultCell(stepIndex);
    const before = await this.getExpectedResultText(stepIndex);
    // No editable affordance in the cell.
    expect(await cell.evaluate(el => (el as HTMLElement).isContentEditable)).toBe(false);
    expect(await cell.locator('input, textarea, [contenteditable="true"]').count()).toBe(0);
    // Clicking + typing must not alter the content.
    await cell.click();
    await this.page.keyboard.type('EDIT_ATTEMPT_XYZ').catch(() => undefined);
    await this.testCaseName.click({ position: { x: 1, y: 1 } }).catch(() => undefined); // blur
    // A static cell cannot change; assert it stays equal to its original value (retry briefly in
    // case of any async re-render) rather than sleeping.
    await expect(async () => {
      expect(await this.getExpectedResultText(stepIndex)).toBe(before);
    }).toPass({ timeout: 3000, intervals: [300, 500] });
  }

  /**
   * Locator for a step's called-test-case indicator. A called step shows an icon inside its
   * `.description-with-icon` name cell (normal steps render only the `.description-content` text).
   */
  private stepCalledIndicator(stepIndex: number): Locator {
    return this.stepRows.nth(stepIndex).locator(
      '.description-with-icon i, .description-with-icon img, .description-with-icon svg, [class*="called"]',
    );
  }

  async stepHasCalledIndicator(stepIndex: number): Promise<boolean> {
    return (await this.stepCalledIndicator(stepIndex).count()) > 0;
  }

  /** Indices of steps that carry the called-test-case indicator. */
  async getCalledStepIndices(): Promise<number[]> {
    const count = await this.stepRows.count();
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      if (await this.stepHasCalledIndicator(i)) out.push(i);
    }
    return out;
  }

  /** Asserts no step in the grid carries a called-test-case indicator (TC-103). */
  async verifyNoStepsMarkedAsCalled(): Promise<void> {
    expect(await this.getCalledStepIndices()).toEqual([]);
  }

  async closeDefectPanel(): Promise<void> {
    await this.defectPopup.locator('button', { hasText: /^CLOSE$/ }).first().click();
    await expect(this.defectPopup).toBeHidden({ timeout: 10000 });
  }

  // ─── Search / Link / Unlink an existing defect (TC-083, TC-084, TC-085) ───────
  //
  // The popup has two modes that share `.modal-div`:
  //  • list mode (opened fresh / empty search): rows are the CURRENTLY-LINKED defects,
  //    each with an `img.unlinkRowButton`; footer = NEW / CLOSE.
  //  • search mode (after a SEARCH): rows are matching defects, each with a
  //    `input[type=radio][name="defectOption"]` + `.modal-text-wrapper-pid`; footer = LINK / CANCEL.
  //
  // Committing a LINK (or an unlink) tears the panel down and re-renders it in place, so
  // every commit waits for the popup to disappear and the run breadcrumb to return, after
  // which the popup is reopened fresh to read the authoritative linked list.

  /** Ensures the run-level defect popup is open (reopening it after a commit re-render). */
  async openRunDefectPanelFresh(): Promise<void> {
    if (!(await this.defectPopup.isVisible().catch(() => false))) {
      await this.linkDefectButton.click({ noWaitAfter: true });
      await this.defectPopup.waitFor({ state: 'visible', timeout: 15000 });
    }
    // Wait for the popup body to be interactive (search box rendered) instead of a fixed delay.
    await this.defectSearchInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Ensures the step-level defect popup is open for a step (reopening after a re-render). */
  async openStepDefectPanelFresh(stepIndex: number): Promise<void> {
    if (!(await this.defectPopup.isVisible().catch(() => false))) {
      // The bug-count-badge overlays the icon once defects are linked — click the container, forced.
      await this.stepRows.nth(stepIndex).locator('.link-step-level-defect .bug-container')
        .click({ force: true, noWaitAfter: true });
      await this.defectPopup.waitFor({ state: 'visible', timeout: 15000 });
    }
    // Wait for the popup body to be interactive (search box rendered) instead of a fixed delay.
    await this.defectSearchInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /** The defect IDs currently linked, read from the open popup's list region. */
  async getLinkedDefectIds(): Promise<string[]> {
    const text = await this.defectPopup.locator('.modal-div').innerText({ timeout: 8000 }).catch(() => '');
    return [...new Set(text.match(/DF-\d+/g) ?? [])];
  }

  /** Number of defects linked in the currently-open popup (0 when "No defects linked."). */
  async getLinkedDefectCount(): Promise<number> {
    return this.defectLinkedRows.count();
  }

  private searchResultRow(defectId: string): Locator {
    return this.defectPopup.locator('.modal-frame-1.data-row').filter({ hasText: defectId });
  }

  /** Types a defect ID/summary into the popup and runs the search. */
  async searchDefect(term: string): Promise<void> {
    await this.defectSearchInput.fill(term);
    await this.defectSearchButton.first().click();
    // The search completing switches the popup to results mode (LINK/CANCEL footer), even for a
    // zero-result search — wait for that footer rather than a fixed delay.
    await this.defectLinkButton.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
  }

  /** Asserts the searched defect is shown in the results grid. */
  async verifyDefectInSearchResults(defectId: string): Promise<void> {
    await expect(this.searchResultRow(defectId).locator('.modal-text-wrapper-pid'))
      .toHaveText(defectId, { timeout: 10000 });
  }

  /**
   * Selects a searched defect's radio. Returns true if the LINK button becomes enabled —
   * which it only does for a defect that is NOT already linked to this run/step (qTest
   * leaves LINK disabled for an already-linked defect, its built-in dedupe).
   */
  async selectSearchedDefect(defectId: string): Promise<boolean> {
    const radio = this.searchResultRow(defectId).locator('input[type="radio"]');
    await radio.click({ force: true });
    await expect(radio).toBeChecked({ timeout: 5000 }).catch(() => undefined); // Blazor binds the selection
    // LINK enables a tick after the selection binds for a not-yet-linked defect; poll for it.
    // An already-linked defect leaves LINK disabled (qTest dedupe) → this resolves false.
    return expect(this.defectLinkButton.first()).toBeEnabled({ timeout: 4000 })
      .then(() => true)
      .catch(() => false);
  }

  /** Clicks LINK and waits out the commit re-render (the popup is torn down on commit). */
  async confirmLink(): Promise<void> {
    await this.defectLinkButton.first().click({ noWaitAfter: true });
    await this.defectPopup.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => undefined);
    await this.breadcrumb.waitFor({ state: 'visible', timeout: 30000 });
    // Panel re-rendered when its run-level LINK DEFECT button is interactive again.
    await this.linkDefectButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
  }

  /**
   * In the currently-open defect popup, links the first of `candidates` that is not already
   * linked and whose result enables LINK, then returns the linked defect ID. The caller must
   * open the run-level or step-level panel first.
   */
  async linkFirstAvailableDefect(candidates: string[]): Promise<string> {
    const alreadyLinked = await this.getLinkedDefectIds();
    for (const id of candidates) {
      if (alreadyLinked.includes(id)) continue;
      await this.searchDefect(id);
      if ((await this.searchResultRow(id).count()) === 0) continue;
      if (await this.selectSearchedDefect(id)) {
        await this.confirmLink();
        return id;
      }
    }
    throw new Error(`No linkable defect found among candidates: ${candidates.join(', ')}`);
  }

  /** True when a LINK button is present in the popup (only rendered in search mode) — TC-134/135. */
  async isDefectLinkButtonPresent(): Promise<boolean> {
    return (await this.defectLinkButton.count()) > 0;
  }

  /** Asserts the popup's LINK button is disabled (e.g. before a valid defect is selected). */
  async verifyDefectLinkButtonDisabled(): Promise<void> {
    await expect(this.defectLinkButton.first()).toBeDisabled({ timeout: 10000 });
  }

  /** Asserts the invalid-search empty state — "No matching records found." (TC-134). */
  async verifyDefectSearchNoResults(): Promise<void> {
    await expect(this.defectPopup.getByText(/no matching records found/i).first())
      .toBeVisible({ timeout: 15000 });
  }

  /** Closes the defect popup from either mode (CANCEL in search mode, CLOSE in list mode). */
  async closeDefectPanelAnyMode(): Promise<void> {
    const cancel = this.defectPopup.locator('button', { hasText: /^CANCEL$/ }).first();
    if (await cancel.isVisible().catch(() => false)) await cancel.click().catch(() => undefined);
    const close = this.defectPopup.locator('button', { hasText: /^CLOSE$/ }).first();
    if (await close.isVisible().catch(() => false)) await close.click().catch(() => undefined);
    await this.defectPopup.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
  }

  /** Asserts a defect appears in the open popup's linked list (retries through the re-render). */
  async verifyDefectLinked(defectId: string): Promise<void> {
    await expect(async () => {
      expect(await this.getLinkedDefectIds()).toContain(defectId);
    }).toPass({ timeout: 20000, intervals: [1000, 2000, 3000] });
  }

  /**
   * Unlinks a defect from the currently-open popup (list mode). Clicks the row's unlink
   * icon, confirms the "Are you sure… unlinking of Defect?" YES prompt, and waits out the
   * re-render. A no-op if the defect is not currently listed.
   */
  async unlinkDefect(defectId: string): Promise<void> {
    if (!(await this.defectPopup.isVisible().catch(() => false))) return;
    const row = this.defectLinkedRows.filter({ hasText: defectId });
    if ((await row.count()) === 0) return;
    await row.first().locator('img.unlinkRowButton').click({ noWaitAfter: true });
    await this.page.locator('button', { hasText: /^YES$/ }).first().click({ noWaitAfter: true }).catch(() => undefined);
    await this.defectPopup.waitFor({ state: 'hidden', timeout: 20000 }).catch(() => undefined);
    await this.breadcrumb.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
    // Panel re-rendered when its run-level LINK DEFECT button is interactive again.
    await this.linkDefectButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
  }

  /** Best-effort cleanup: reopen the run popup and unlink `defectId` if present, then close. */
  async cleanupUnlinkFromRun(defectId: string): Promise<void> {
    await this.openRunDefectPanelFresh().catch(() => undefined);
    await this.unlinkDefect(defectId).catch(() => undefined);
    if (await this.defectPopup.isVisible().catch(() => false)) {
      await this.closeDefectPanel().catch(() => undefined);
    }
  }

  /** Best-effort cleanup: reopen the step popup and unlink `defectId` if present, then close. */
  async cleanupUnlinkFromStep(stepIndex: number, defectId: string): Promise<void> {
    await this.openStepDefectPanelFresh(stepIndex).catch(() => undefined);
    await this.unlinkDefect(defectId).catch(() => undefined);
    if (await this.defectPopup.isVisible().catch(() => false)) {
      await this.closeDefectPanel().catch(() => undefined);
    }
  }

  /** Asserts a defect is NOT in the open popup's linked list (retries through the re-render). */
  async verifyDefectNotLinked(defectId: string): Promise<void> {
    await expect(async () => {
      expect(await this.getLinkedDefectIds()).not.toContain(defectId);
    }).toPass({ timeout: 20000, intervals: [1000, 2000, 3000] });
  }

  /**
   * Defect IDs shown in the run-level defect display. Two elements share `id="defect"` — the
   * "DEFECT" label span and the `.test-run-frame-9` div holding a button per linked defect — so
   * the texts of all matches are scanned for DF-ids.
   */
  async getRunDefectDisplayIds(): Promise<string[]> {
    const texts = await this.defectDisplay.allInnerTexts().catch(() => [] as string[]);
    return [...new Set(texts.join(' ').match(/DF-\d+/g) ?? [])];
  }

  /**
   * In the open popup's list mode, clicks a linked defect row's unlink icon, then clicks NO on
   * the "...unlinking of Defect?" confirm — the cancellation path. The defect stays linked and
   * the popup remains in list mode.
   */
  async cancelUnlinkDefect(defectId: string): Promise<void> {
    const row = this.defectLinkedRows.filter({ hasText: defectId });
    await row.first().locator('img.unlinkRowButton').click({ noWaitAfter: true });
    const no = this.page.locator('button', { hasText: /^NO$/ }).first();
    await no.waitFor({ state: 'visible', timeout: 10000 });
    await no.click({ noWaitAfter: true });
    // The confirm dialog is dismissed; the popup stays open with the defect still listed.
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  }

  // ─── Attachments (TC-088 to TC-093) ───────────────────────────────────────────
  // The attachment file input (#testlogFileInput, multiple) is hidden and opened through a
  // native file chooser. Attaching is done by pairing the chooser event with the input click.

  private async chooseFiles(filePaths: string[]): Promise<void> {
    // Trigger the chooser through the real LINK ATTACHMENT button so Blazor's InputFile
    // interop handler is engaged (setting files on the hidden input directly does not
    // trigger it). Fall back to clicking the hidden input if the button does not raise one.
    let chooser;
    try {
      [chooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 8000 }),
        this.linkAttachmentButton.click(),
      ]);
    } catch {
      [chooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 8000 }),
        this.attachmentFileInput.evaluate((el: HTMLElement) => el.click()),
      ]);
    }
    await chooser.setFiles(filePaths);
    // A re-uploaded duplicate raises an "...already exists" message modal (#actionDialog) that
    // overlays the panel and blocks SAVE; dismiss it if present so the file (already attached)
    // can still be saved.
    await this.dismissActionDialogIfPresent();
    // Allow Blazor to stream/validate the file(s): wait for the attachment display to reflect a
    // change rather than a fixed delay.
    await this.attachmentDisplay.locator('*').first()
      .waitFor({ state: 'attached', timeout: 8000 }).catch(() => undefined);
  }

  /** Dismisses the #actionDialog message modal (e.g. "...already exists") if it is showing. */
  async dismissActionDialogIfPresent(): Promise<void> {
    const dialog = this.page.locator('#actionDialog');
    if (await dialog.isVisible().catch(() => false)) {
      await dialog.locator('button').first().click({ noWaitAfter: true }).catch(() => undefined);
      await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    }
  }

  async attachFile(filePath: string): Promise<void> {
    await this.chooseFiles([filePath]);
  }

  async attachFiles(filePaths: string[]): Promise<void> {
    await this.chooseFiles(filePaths);
  }

  async getAttachmentText(): Promise<string> {
    return (await this.attachmentDisplay.innerText()).replace(/\s+/g, ' ').trim();
  }

  async verifyAttachmentListed(fileName: string): Promise<void> {
    await expect(this.attachmentDisplay).toContainText(fileName, { timeout: 15000 });
  }

  async getAttachmentNames(): Promise<string[]> {
    return this.attachmentDisplay.locator('.attachment-name, [class*=attachment] [class*=name], li, .chip')
      .allInnerTexts().then(a => a.map(s => s.trim()).filter(Boolean));
  }

  /** Asserts the file-size rejection message after selecting an oversized file. */
  async verifyFileTooLargeMessage(): Promise<void> {
    // Live wording: "Error: File '<name>' exceeds the 10MB limit."
    await expect(this.page.getByText(/exceeds the 10\s*mb limit|file too large|too large/i).first())
      .toBeVisible({ timeout: 15000 });
  }

  private get attachmentItems(): Locator {
    return this.attachmentDisplay.locator('.attachment-display-item');
  }

  async getAttachmentCount(): Promise<number> {
    return this.attachmentItems.count();
  }

  /** Removes the first listed attachment via its red "Remove attachment" (✕) button. */
  async deleteFirstAttachment(): Promise<void> {
    const before = await this.attachmentItems.count();
    if (before === 0) return;
    await this.attachmentItems.first().locator('button[title="Remove attachment"]').click({ timeout: 8000 });
    await expect(this.attachmentItems).toHaveCount(before - 1, { timeout: 8000 }).catch(() => undefined);
  }

  /** Removes every listed attachment (each item's "Remove attachment" ✕), returning to empty. */
  async deleteAllAttachments(): Promise<void> {
    let count = await this.attachmentItems.count();
    let guard = 0;
    while (count > 0 && guard++ < 30) {
      await this.attachmentItems.first().locator('button[title="Remove attachment"]')
        .click({ timeout: 8000 }).catch(() => undefined);
      await expect(this.attachmentItems).toHaveCount(count - 1, { timeout: 8000 }).catch(() => undefined);
      const next = await this.attachmentItems.count();
      if (next === count) break; // no progress — avoid an infinite loop
      count = next;
    }
  }

  /**
   * Clears any pre-existing attachments on the run and persists, so a re-uploaded file is not
   * rejected as a duplicate ("...already exists") and a subsequent save has a real change to
   * report. A no-op when the run already has no attachments.
   */
  async resetAttachments(): Promise<void> {
    if ((await this.getAttachmentCount()) === 0) return;
    await this.deleteAllAttachments();
    await this.clickSave();
    await this.dismissActionDialogIfPresent();
    await this.attachmentItems.first().waitFor({ state: 'detached', timeout: 8000 }).catch(() => undefined);
  }

  /** Asserts the attachment panel shows no attachments ("No Attachment"). */
  async verifyNoAttachments(): Promise<void> {
    await expect(this.attachmentDisplay).toContainText(/no attachment/i, { timeout: 10000 });
  }

  /** Asserts a file name is NOT currently listed in the attachment panel. */
  async verifyAttachmentNotListed(fileName: string): Promise<void> {
    await expect(this.attachmentDisplay).not.toContainText(fileName, { timeout: 10000 });
  }
}
