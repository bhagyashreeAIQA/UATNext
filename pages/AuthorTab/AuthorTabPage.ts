import { Page, expect, Locator } from '@playwright/test';

export class AuthorTabPage {
  private readonly page: Page;

  // Tab link
  readonly authorTabLink: Locator;

  // Sidebar filters
  readonly sidebar: Locator;
  readonly projectsDropdown: Locator;
  readonly epicDropdown: Locator;
  readonly featureDropdown: Locator;
  readonly teamDropdown: Locator;
  readonly searchBox: Locator;

  // Requirements table
  readonly requirementsTableHeader: Locator;
  readonly requirementsTableRows: Locator;
  readonly columnId: Locator;
  readonly columnAdoId: Locator;
  readonly columnRequirement: Locator;
  readonly paginationSummary: Locator;

  constructor(page: Page) {
    this.page = page;

    this.authorTabLink           = page.getByRole('link', { name: 'AUTHOR TEST CASES' });

    // Sidebar — two .module-selection exist (expanded + collapsed); target the expanded one
    this.sidebar                 = page.locator('.module-selection:not(.collapsed)');
    this.projectsDropdown        = page.locator('.module-selection:not(.collapsed) #sidebar-project');
    this.epicDropdown            = page.locator('.module-selection').getByText('Epic').locator('..').locator('input');
    this.featureDropdown         = page.locator('.module-selection').getByText('Feature').locator('..').locator('input');
    this.teamDropdown            = page.locator('.module-selection').getByText('Team').locator('..').locator('input');
    this.searchBox               = page.getByRole('searchbox', { name: 'Search Requirements by PID/ADO ID/Title' });

    // Requirements table
    this.requirementsTableHeader = page.locator('#requirements-table-row').first();
    this.requirementsTableRows   = page.locator('.frame-3 .tree-view-table-row');
    this.columnId                = page.locator('.table-left-cell').getByText('ID').first();
    this.columnAdoId             = page.locator('.table-left-cell-2').getByText('ADO ID');
    this.columnRequirement       = page.locator('.table-left-cell-3').getByText('Requirement');
    this.paginationSummary       = page.locator('p').filter({ hasText: /Total \d+ Entries/ }).first();
  }

  // ─── Wait helpers ───────────────────────────────────────────────────────────

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForURL(/\/author/);
    await this.requirementsTableHeader.waitFor({ state: 'visible' });
    await this.requirementsTableRows.first().waitFor({ state: 'visible' });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  async getRequirementRowCount(): Promise<number> {
    return this.requirementsTableRows.count();
  }

  async getPaginationText(): Promise<string> {
    return (await this.paginationSummary.innerText()).trim();
  }

  // ─── Assertions ─────────────────────────────────────────────────────────────

  async verifyTabIsActive(): Promise<void> {
    await expect(this.authorTabLink).toHaveAttribute('aria-current', 'page');
    await expect(this.page).toHaveURL(/\/author/);
  }

  async verifySidebarVisible(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
    await expect(this.projectsDropdown).toBeVisible();
    await expect(this.searchBox).toBeVisible();
  }

  async verifyRequirementsTableVisible(): Promise<void> {
    await expect(this.requirementsTableHeader).toBeVisible();
    await expect(this.columnId).toBeVisible();
    await expect(this.columnAdoId).toBeVisible();
    await expect(this.columnRequirement).toBeVisible();
  }

  async verifyRequirementsLoaded(): Promise<void> {
    const count = await this.getRequirementRowCount();
    expect(count).toBeGreaterThan(0);
  }

  async verifyPaginationVisible(): Promise<void> {
    await expect(this.paginationSummary).toBeVisible();
    const text = await this.getPaginationText();
    expect(text).toMatch(/Total \d+ Entries/);
  }

  async verifyAuthorPageFullyLoaded(): Promise<void> {
    await this.verifyTabIsActive();
    await this.verifySidebarVisible();
    await this.verifyRequirementsTableVisible();
    await this.verifyRequirementsLoaded();
    await this.verifyPaginationVisible();
  }
}
