import { type Page, type Locator, expect } from "@playwright/test";

export interface LoginCredentials {
  email: string;
  password: string;
}

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly generalError: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly registerLink: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[class*="text-red"]');
    this.generalError = page.locator('[role="alert"]');
    this.pageTitle = page.locator("h2").filter({ hasText: "Zaloguj się" });
    this.pageDescription = page.locator("p").filter({ hasText: "Wprowadź swoje dane" });
    this.registerLink = page.locator('a[href="/auth/register"]');
    this.loadingSpinner = page.locator(".spinner, [data-test-id='spinner']");
  }

  async goto() {
    await this.page.goto("/auth/login");
  }

  async waitForLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }

  async login(credentials: LoginCredentials) {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  async loginAndWaitForRedirect(credentials: LoginCredentials) {
    await this.login(credentials);
    // Wait for either success redirect or error message
    await Promise.race([
      this.page.waitForURL("/dashboard", { timeout: 10000 }),
      this.generalError.waitFor({ state: "visible", timeout: 5000 }),
    ]);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submitForm() {
    await this.loginButton.click();
  }

  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.generalError.isVisible()) {
      return await this.generalError.textContent();
    }
    return null;
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  async goToRegister() {
    await this.registerLink.click();
  }

  // Assertion helpers
  async expectPageToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageDescription).toBeVisible();
  }

  async expectErrorToBeVisible(expectedMessage?: string) {
    await expect(this.generalError).toBeVisible();
    if (expectedMessage) {
      await expect(this.generalError).toContainText(expectedMessage);
    }
  }

  async expectErrorToBeHidden() {
    await expect(this.generalError).not.toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loginButton).toBeDisabled();
  }

  async expectNormalState() {
    await expect(this.loadingSpinner).not.toBeVisible();
    await expect(this.loginButton).not.toBeDisabled();
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL("/auth/login");
    await this.expectPageToBeVisible();
  }
}
