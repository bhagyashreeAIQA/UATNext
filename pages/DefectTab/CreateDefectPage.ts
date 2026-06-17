import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object for the DEFECT-tab "New Defect" / defect-details form.
 *
 * The form opens from the DEFECT tab's CREATE DEFECT button (`#createTestCaseButton`) or by
 * clicking a Defect ID in the grid; it replaces the right-panel grid (the left filter panel stays
 * mounted). It shares its DOM with the Test-Run-Execution Create-Defect popup, but on the DEFECT
 * tab there is NO test-case context, so — unlike the execution-page form — none of the dropdowns are
 * pre-populated (Status/Type/Severity/Priority/Module all start blank), and Affected Release/Build
 * is the only field marked with a "*". The CREATE flow saves via `#createDefect`; editing an
 * existing defect saves via `#updateDefect` (verified against the live app, 2026-06-17).
 *
 * Anchors:
 *  - Header / breadcrumb: `.defect-breadcrumbs` — "New Defect" for create, "DF-<n>" for edit.
 *  - SAVE (create) `#createDefect`, SAVE (update) `#updateDefect`, CLOSE `#closeButton`.
 *  - Summary `textarea#DefSummary`; Description `textarea:not(#DefSummary)` (pre-filled template).
 *  - Each labelled dropdown is an `input.searchable-dropdown-input` with a unique "-- Select X --"
 *    placeholder; options render as `.searchable-dropdown-item` inside the same
 *    `.defect-form-text-field` card (the current value's item carries class `selected`). The option
 *    lists stream in from qTest when a dropdown opens and can transiently return empty under load,
 *    so selection (re)opens-and-waits until the target item is present.
 *  - Attachment drop zone `#drop-area` with a BROWSE FILE button backed by hidden `#defectFileInput`.
 *  - Unsaved-changes confirmation: a popup reading "You have unsaved changes. Are you sure you want
 *    to proceed?" with YES / NO buttons (NO keeps the form + data, YES discards and returns to grid).
 */
export class CreateDefectPage {
  private readonly page: Page;

  // Form-field placeholders (each a unique `input.searchable-dropdown-input` placeholder).
  static readonly PLACEHOLDER = {
    affectedRelease: '-- Select Affected Release/Build --',
    module:          '-- Select Module --',
    targetRelease:   '-- Select Target Release --',
    team:            '-- Select Team --',
    severity:        '-- Select Severity --',
    reason:          '-- Select Reason --',
    status:          '-- Select Status --',
    businessUser:    '-- Select Business User --',
    fixedRelease:    '-- Select Fixed Release --',
    category:        '-- Select Category --',
    priority:        '-- Select Priority --',
    rootCause:       '-- Select Root Cause --',
    type:            '-- Select Type --',
    environment:     '-- Select Environment --',
    assignedTo:      '-- Select Assigned To User --',
  } as const;

  readonly breadcrumb: Locator;
  readonly saveCreateButton: Locator;
  readonly saveUpdateButton: Locator;
  readonly closeButton: Locator;
  readonly summaryInput: Locator;
  readonly descriptionInput: Locator;
  readonly dropArea: Locator;
  readonly fileInput: Locator;
  readonly browseFileButton: Locator;
  readonly linkedTestRunsSection: Locator;
  readonly confirmYesButton: Locator;
  readonly confirmNoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.breadcrumb       = page.locator('.defect-breadcrumbs');
    this.saveCreateButton = page.locator('#createDefect');
    this.saveUpdateButton = page.locator('#updateDefect');
    this.closeButton      = page.locator('#closeButton');
    this.summaryInput     = page.locator('#DefSummary');
    this.descriptionInput = page.locator('textarea:not(#DefSummary)').first();
    this.dropArea         = page.locator('#drop-area');
    this.fileInput        = page.locator('#defectFileInput');
    this.browseFileButton = this.dropArea.locator('button', { hasText: /BROWSE FILE/i });
    this.linkedTestRunsSection = page.getByText('Linked Test Runs', { exact: true }).first();
    this.confirmYesButton = page.getByRole('button', { name: 'YES', exact: true });
    this.confirmNoButton  = page.getByRole('button', { name: 'NO', exact: true });
  }

  // ─── Open / close ─────────────────────────────────────────────────────────

  /** Waits until the create form is mounted (breadcrumb "New Defect" + SAVE). */
  async waitForCreateFormOpen(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible({ timeout: 20000 });
    await expect(this.saveCreateButton).toBeVisible();
    await expect(this.summaryInput).toBeVisible();
  }

  /** Waits until an existing-defect edit form is mounted (breadcrumb "DF-…" + update SAVE). */
  async waitForEditFormOpen(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible({ timeout: 20000 });
    await expect(this.saveUpdateButton).toBeVisible();
    await expect(this.summaryInput).toBeVisible();
  }

  async getBreadcrumbText(): Promise<string> {
    return (await this.breadcrumb.innerText()).replace(/\s+/g, ' ').trim();
  }

  // ─── Field accessors ──────────────────────────────────────────────────────

  private dropdownInput(placeholder: string): Locator {
    return this.page.locator(`input.searchable-dropdown-input[placeholder="${placeholder}"]`);
  }

  private dropdownCard(placeholder: string): Locator {
    return this.page.locator('.defect-form-text-field').filter({ has: this.dropdownInput(placeholder) });
  }

  /** True if a dropdown for the given placeholder is present in the form. */
  async hasDropdown(placeholder: string): Promise<boolean> {
    return (await this.dropdownInput(placeholder).count()) > 0;
  }

  async getDropdownValue(placeholder: string): Promise<string> {
    return (await this.dropdownInput(placeholder).inputValue()).replace(/\s+/g, ' ').trim();
  }

  async getSummaryValue(): Promise<string> {
    return (await this.summaryInput.inputValue()).trim();
  }

  async getDescriptionValue(): Promise<string> {
    return (await this.descriptionInput.inputValue()).trim();
  }

  // ─── Field actions ────────────────────────────────────────────────────────

  async fillSummary(text: string): Promise<void> {
    await this.summaryInput.click();
    await this.summaryInput.fill(text);
    await expect(this.summaryInput).toHaveValue(text);
  }

  /**
   * Selects the first not-already-selected option of a dropdown (works for the huge Module/Team/
   * user lists without enumerating every option) and asserts the chosen value is retained.
   * (Re)opens between attempts because the qTest option fetch can briefly return empty under load.
   * Returns the selected value (empty string if no option ever became available).
   */
  async selectFirstAvailable(placeholder: string): Promise<string> {
    const input = this.dropdownInput(placeholder);
    const items = this.dropdownCard(placeholder).locator('.searchable-dropdown-item:not(.selected)');
    for (let attempt = 0; attempt < 5; attempt++) {
      await input.scrollIntoViewIfNeeded();
      await input.click();
      try {
        await items.first().waitFor({ state: 'visible', timeout: 3000 });
        const value = (await items.first().innerText()).replace(/\s+/g, ' ').trim();
        await items.first().click();
        await expect(input).toHaveValue(/\S/, { timeout: 5000 });
        return value;
      } catch {
        await input.click().catch(() => undefined); // toggle closed, re-fetch next pass
        await this.page.waitForTimeout(600);
      }
    }
    return '';
  }

  /**
   * Fills the fields needed for a successful Create Defect save. On the DEFECT tab nothing is
   * pre-populated and validation is enforced field-by-field (Affected Release/Build, Reason,
   * Business User, etc.), so every dropdown that loads options is given a value. `skip` lets a
   * caller deliberately leave a field blank (e.g. Team for the Team-optional case). Returns the
   * map of fields it actually populated.
   */
  async fillRequiredForSave(opts: { summary: string; skip?: string[] } = { summary: '' }): Promise<Record<string, string>> {
    const skip = new Set(opts.skip ?? []);
    if (opts.summary) await this.fillSummary(opts.summary);
    const selected: Record<string, string> = {};
    // Order roughly follows the form's own validation order so the save passes in one click.
    // Environment is intentionally omitted: it is optional (a save succeeds with it blank) and its
    // option list is slow/unreliable to load on the DEFECT tab, so attempting it only wastes time.
    const order: (keyof typeof CreateDefectPage.PLACEHOLDER)[] = [
      'affectedRelease', 'reason', 'severity', 'status', 'priority', 'type',
      'module', 'category', 'rootCause', 'team', 'businessUser', 'assignedTo',
      'targetRelease', 'fixedRelease',
    ];
    for (const key of order) {
      if (skip.has(key)) continue;
      const ph = CreateDefectPage.PLACEHOLDER[key];
      selected[key] = await this.selectFirstAvailable(ph);
    }
    return selected;
  }

  // ─── Attachment ───────────────────────────────────────────────────────────

  /** Attaches a file via the hidden `#defectFileInput` (BROWSE FILE chooser backing input). */
  async attachFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  /** Asserts a file name is shown in the attachment drop zone. */
  async verifyAttachmentListed(fileName: string): Promise<void> {
    await expect(this.dropArea).toContainText(fileName, { timeout: 15000 });
  }

  /**
   * Asserts the over-10MB rejection: a toast and the inline drop-zone validation message, both of
   * which name the rejected file (e.g. "Error: File 'big.pdf' exceeds the 10MB limit.").
   */
  async verifyFileTooLargeMessage(fileName: string): Promise<void> {
    const message = new RegExp(`File '${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' exceeds the 10\\s*mb limit`, 'i');
    await expect(this.toast(message)).toBeVisible({ timeout: 15000 });
    await expect(this.dropArea).toContainText(message, { timeout: 15000 });
  }

  // ─── Save / validation ────────────────────────────────────────────────────

  /** Any toast/notification text matching `message` (transient — assert promptly after the action). */
  toast(message: RegExp): Locator {
    return this.page.getByText(message).first();
  }

  /** Clicks the create SAVE without waiting for navigation (toast may be transient). */
  async clickCreateSave(): Promise<void> {
    await this.saveCreateButton.click({ noWaitAfter: true });
  }

  /** Clicks the update SAVE (edit form) without waiting for navigation. */
  async clickUpdateSave(): Promise<void> {
    await this.saveUpdateButton.click({ noWaitAfter: true });
  }

  async verifyCreatedSuccessToast(): Promise<void> {
    await expect(this.toast(/defect created successfully/i)).toBeVisible({ timeout: 20000 });
  }

  async verifyUpdatedSuccessToast(): Promise<void> {
    await expect(this.toast(/defect updated successfully/i)).toBeVisible({ timeout: 20000 });
  }

  /** Asserts a "Please select a valid <Field>." style validation toast appears. */
  async verifyValidationToast(): Promise<void> {
    await expect(this.toast(/please select a valid|cannot be blank|please fill/i)).toBeVisible({ timeout: 15000 });
  }

  /** The create form is still mounted (i.e. the save was blocked / no defect created). */
  async verifyStillOnCreateForm(): Promise<void> {
    await expect(this.saveCreateButton).toBeVisible();
    await expect(this.breadcrumb).toBeVisible();
  }

  // ─── Close + unsaved-changes confirmation ───────────────────────────────────

  /** Clicks CLOSE; if there are unsaved changes a confirmation popup appears. */
  async clickClose(): Promise<void> {
    await this.closeButton.click({ noWaitAfter: true });
  }

  async verifyUnsavedChangesPopup(): Promise<void> {
    await expect(this.page.getByText(/You have unsaved changes\. Are you sure you want to proceed\?/i))
      .toBeVisible({ timeout: 10000 });
    await expect(this.confirmYesButton).toBeVisible();
    await expect(this.confirmNoButton).toBeVisible();
  }

  /** Clicks NO on the confirmation popup (stays on the form, keeps entered data). */
  async confirmNo(): Promise<void> {
    await this.confirmNoButton.click();
    await expect(this.saveCreateButton).toBeVisible();
  }

  /** Clicks YES on the confirmation popup (discards changes, returns to the defect grid). */
  async confirmYes(): Promise<void> {
    await this.confirmYesButton.click({ noWaitAfter: true });
    await this.breadcrumb.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => undefined);
  }

  /** Closes the form, accepting the unsaved-changes popup if it appears. */
  async closeDiscardingIfPrompted(): Promise<void> {
    await this.clickClose();
    if (await this.confirmYesButton.isVisible().catch(() => false)) {
      await this.confirmYes();
    }
    await this.breadcrumb.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => undefined);
  }

  // ─── Presence assertions (Def_TC_036 / Def_TC_041) ──────────────────────────

  /**
   * Verifies the full set of New-Defect / details fields documented for Def_TC_036 / Def_TC_041:
   * SAVE, CLOSE, Summary, Description, every dropdown, BROWSE FILE and the Linked Test Run section.
   * `edit` selects the update SAVE button (details page) instead of the create SAVE button.
   */
  async verifyAllFieldsPresent(edit = false): Promise<void> {
    await expect(edit ? this.saveUpdateButton : this.saveCreateButton).toBeVisible();
    await expect(this.closeButton).toBeVisible();
    await expect(this.summaryInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
    for (const ph of Object.values(CreateDefectPage.PLACEHOLDER)) {
      await expect(this.dropdownInput(ph), `dropdown "${ph}"`).toBeVisible();
    }
    await expect(this.browseFileButton).toBeVisible();
    await expect(this.linkedTestRunsSection).toBeVisible();
  }

  /** True if the named field's label carries a mandatory "*" marker. */
  async isFieldMandatory(label: string): Promise<boolean> {
    return this.page.evaluate((lbl) => {
      const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
      return [...document.querySelectorAll('span.defect-text-wrapper-2')]
        .filter(s => norm(s.textContent) === '*')
        .some(s => norm(s.parentElement?.textContent).includes(lbl));
    }, label);
  }
}
