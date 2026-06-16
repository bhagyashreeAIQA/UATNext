import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Microsoft login page locators
  private readonly emailInput = () =>
    this.page.getByRole('textbox', { name: 'Enter your email, phone, or Skype.' });
  private readonly nextButton = () =>
    this.page.getByRole('button', { name: 'Next' });
  private readonly passwordInput = () =>
    this.page.getByRole('textbox', { name: /Enter the password for/ });
  private readonly signInButton = () =>
    this.page.getByRole('button', { name: 'Sign in' });
  private readonly staySignedInYes = () =>
    this.page.getByRole('button', { name: 'Yes' });
  private readonly staySignedInHeading = () =>
    this.page.getByRole('heading', { name: 'Stay signed in?' });

  constructor(page: Page) {
    this.page = page;
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl);
    // Wait for either the Microsoft login page or the app (if already authenticated via storageState)
    await this.page.waitForURL(
      url =>
        /login\.microsoftonline\.com/.test(url.toString()) ||
        /webapp-v1-blazor-uatnext-dev\.azurewebsites\.net/.test(url.toString()),
    );
  }

  isOnLoginPage(): boolean {
    return /login\.microsoftonline\.com/.test(this.page.url());
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput().waitFor({ state: 'visible' });
    await this.emailInput().fill(email);
    await this.nextButton().click();
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput().waitFor({ state: 'visible' });
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async handleStaySignedIn(): Promise<void> {
    try {
      await this.staySignedInHeading().waitFor({ state: 'visible', timeout: 5000 });
      await this.staySignedInYes().click();
    } catch {
      // Prompt not shown — already handled or SSO bypassed it
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.handleStaySignedIn();
    await this.page.waitForURL(/webapp-v1-blazor-uatnext-dev\.azurewebsites\.net/);
  }

  async verifyOnLoginPage(): Promise<void> {
    await expect(this.emailInput()).toBeVisible();
  }
}
