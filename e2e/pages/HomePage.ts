import { type Page, type Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator("h1").first();
  }

  async goto() {
    await this.page.goto("/");
  }

  async getTitle() {
    return await this.title.textContent();
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
