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

  async getActiveProject(): Promise<string> {
    const text = await this.projectSwitcher.innerText();
    return text.replace('▼', '').trim();
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
