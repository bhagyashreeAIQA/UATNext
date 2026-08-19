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
    await this.page.waitForURL(/webapp-v1-blazor-uatnext-stg\.azurewebsites\.net\//);
  }

  /**
   * Navigates to the Author Test Cases tab.
   * Retries the click until the URL stabilizes on /author.
   *
   * A workspace switch can land on a tab whose default active project (observed: "CorePlus") is not
   * configured for that feature, which renders a full-page ".no-releases-overlay" modal ("The project
   * is not yet fully configured. Please contact to your coordinator.") that intercepts EVERY click on
   * the page, including this nav link — so blindly retrying the click just fights the overlay for the
   * full timeout. When the overlay is up, a direct URL navigation bypasses the stuck tab instead.
   */
  async navigateToAuthorTab(): Promise<void> {
    await expect.poll(async () => {
      if (await this.page.locator('.no-releases-overlay').isVisible().catch(() => false)) {
        await this.page.goto('/author');
      } else {
        await this.authorTestCasesTab.click().catch(() => undefined);
      }
      await this.page.waitForTimeout(1000); // give SPA time
      return this.page.url().includes('/author');
    }, { timeout: 30000, intervals: [1000, 2000] }).toBe(true);
  }

  async navigateToDefectTab(): Promise<void> {
    await this.defectTab.click();
    await this.page.waitForURL(/\/defect/);
  }

  async navigateToCoordinatorTab(): Promise<void> {
    await this.coordinatorTab.click();
    await this.page.waitForURL(/\/(coordinator|generate-test-log)/);
  }

  async getActiveProject(): Promise<string> {
    const text = await this.page.locator('.project-dropdown-container').first().innerText();
    return text.split('\n')[0].replace('▼', '').trim();
  }

  /**
   * Switches the header Workspace/Business-Unit dropdown to `name`.
   * Selecting a workspace reloads the app, so this waits for the home tabs to re-render.
   * Ensures navigation back to Author tab if needed.
   */
  async switchWorkspace(name: string): Promise<void> {
    if ((await this.getActiveProject()) === name) return;
    const toggle = this.page.locator('.project-dropdown-container');
    await toggle.click();
    await this.page.locator('.project-dropdown-container').getByText(name, { exact: true })
      .click({ timeout: 10000 });
    await expect.poll(() => this.getActiveProject(), { timeout: 20000 }).toBe(name);
    await this.waitForPageLoad();

    // Defensive: if reload dropped us back to Execute, re-click Author
    if (!this.page.url().includes('/author')) {
      await this.navigateToAuthorTab();
    }
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
