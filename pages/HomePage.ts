import { Page, expect, Locator } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  readonly appLogo: Locator;
  readonly appTitle: Locator;
  readonly versionLabel: Locator;
  readonly projectSwitcher: Locator;
  readonly authorTestCasesTab: Locator;
  readonly executeTestCasesTab: Locator;
  readonly defectTab: Locator;
  readonly coordinatorTab: Locator;
  readonly userAvatar: Locator;
  readonly helpButton: Locator;
  readonly logoutOption: Locator;

  constructor(page: Page) {
    this.page = page;

    this.appLogo       = page.locator('a[href="/"]').first();
    this.appTitle      = page.getByRole('link', { name: 'UATNext' });
    this.versionLabel  = page.locator('text=/\\d+\\.\\d+\\.\\d+\\.\\d+/');
    this.projectSwitcher = page.locator('text=/.*▼$/');
    this.authorTestCasesTab  = page.getByRole('link', { name: 'AUTHOR TEST CASES' });
    this.executeTestCasesTab = page.getByRole('link', { name: 'EXECUTE TEST CASES' });
    this.defectTab           = page.getByRole('link', { name: 'DEFECT' });
    // The COORDINATOR tab is only present for accounts granted the coordinator permission.
    this.coordinatorTab      = page.getByRole('link', { name: 'COORDINATOR' });
    this.userAvatar    = page.locator('[id*="chevron-logout"]');
    this.helpButton    = page.getByRole('button', { name: 'Help?' });
    this.logoutOption  = page.getByText('Logout');
  }

  async waitForPageLoad(): Promise<void> {
    await this.executeTestCasesTab.waitFor({ state: 'visible' });
  }

  async navigateToExecuteTab(): Promise<void> {
    await this.executeTestCasesTab.click();
    await this.page.waitForURL(/webapp-v1-blazor-uatnext-dev\.azurewebsites\.net\//);
  }

  async navigateToAuthorTab(): Promise<void> {
    await this.authorTestCasesTab.click();
    await this.page.waitForURL(/\/author/);
  }

  async navigateToDefectTab(): Promise<void> {
    await this.defectTab.click();
    await this.page.waitForURL(/\/defect/);
  }

  /** Opens the COORDINATOR tab, which lands on the Generate Test Log screen (`/generate-test-log`). */
  async navigateToCoordinatorTab(): Promise<void> {
    await this.coordinatorTab.click();
    await this.page.waitForURL(/\/generate-test-log/);
  }

  async getActiveProject(): Promise<string> {
    // Read the workspace/BU switcher container directly (the `text=/▼$/` matcher is unreliable — the
    // ▼ glyph sits in a child node). The first line is the current value; when the dropdown is open
    // the options follow on later lines, so take the first line and strip the chevron.
    const text = await this.page.locator('.project-dropdown-container').first().innerText();
    return text.split('\n')[0].replace('▼', '').trim();
  }

  /**
   * Switches the header Workspace/Business-Unit dropdown to `name` (e.g. "UATNext Dev"). Selecting a
   * workspace reloads the app to the home page, so this waits for the home tabs to re-render.
   */
  async switchWorkspace(name: string): Promise<void> {
    if ((await this.getActiveProject()) === name) return;
    const toggle = this.page.locator('.project-dropdown-container');
    await toggle.click();
    await this.page.locator('.project-dropdown-container').getByText(name, { exact: true })
      .click({ timeout: 10000 });
    await expect.poll(() => this.getActiveProject(), { timeout: 20000 }).toBe(name);
    await this.waitForPageLoad();
  }

  async verifyHomePageLoaded(): Promise<void> {
    await expect(this.appTitle).toBeVisible();
    await expect(this.executeTestCasesTab).toBeVisible();
    await expect(this.authorTestCasesTab).toBeVisible();
    await expect(this.defectTab).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.userAvatar.click();
    await this.logoutOption.waitFor({ state: 'visible' });
    await this.logoutOption.click();
  }
}
