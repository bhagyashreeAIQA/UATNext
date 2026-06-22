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

  /** Clicks a Release node by name and waits for its Test Run grid to load. */
  async selectRelease(name: string): Promise<void> {
    await this.releaseTree.getByText(name, { exact: true }).click();
    await expect(this.gridRows.first()).toBeVisible({ timeout: 30000 });
  }

  // ─── Right panel / grid ─────────────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return this.gridRows.count();
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
}
