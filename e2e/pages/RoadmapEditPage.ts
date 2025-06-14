import { type Page, type Locator, expect } from "@playwright/test";

export class RoadmapEditPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly roadmapTitle: Locator;
  readonly roadmapItems: Locator;
  readonly addItemButton: Locator;
  readonly saveButton: Locator;
  readonly backToDashboardLink: Locator;
  readonly previewButton: Locator;
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1").filter({ hasText: "Edytuj Roadmapę" });
    this.roadmapTitle = page.locator('[data-test-id="roadmap-title"], .roadmap-title');
    this.roadmapItems = page.locator('[data-test-id="roadmap-item"], .roadmap-item');
    this.addItemButton = page.locator("button").filter({ hasText: "Dodaj" });
    this.saveButton = page.locator("button").filter({ hasText: "Zapisz" });
    this.backToDashboardLink = page.locator('a[href="/dashboard"]');
    this.previewButton = page.locator("button, a").filter({ hasText: "Podgląd" });
    this.loadingSpinner = page.locator('[data-test-id="loading-spinner"], .spinner');
    this.errorMessage = page.locator('[role="alert"], [data-test-id="error"]');
  }

  async waitForLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }

  async goToDashboard() {
    await this.backToDashboardLink.click();
  }

  async goToPreview() {
    await this.previewButton.click();
  }

  async addItem() {
    await this.addItemButton.click();
  }

  async saveChanges() {
    await this.saveButton.click();
  }

  async getRoadmapTitle(): Promise<string | null> {
    if (await this.roadmapTitle.isVisible()) {
      return await this.roadmapTitle.textContent();
    }
    return null;
  }

  async getItemCount(): Promise<number> {
    return await this.roadmapItems.count();
  }

  async getItemTitles(): Promise<string[]> {
    const items = await this.roadmapItems.all();
    const titles: string[] = [];

    for (const item of items) {
      const titleElement = item.locator("h3, .item-title").first();
      const title = await titleElement.textContent();
      if (title) {
        titles.push(title.trim());
      }
    }

    return titles;
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.hasError()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  // Assertion helpers
  async expectPageToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectToBeOnEditPage(roadmapId?: string) {
    if (roadmapId) {
      await expect(this.page).toHaveURL(new RegExp(`/roadmaps/${roadmapId}/edit`));
    } else {
      await expect(this.page).toHaveURL(/\/roadmaps\/.*\/edit/);
    }
    await this.expectPageToBeVisible();
  }

  async expectRoadmapTitleToContain(expectedTitle: string) {
    await expect(this.roadmapTitle).toContainText(expectedTitle);
  }

  async expectItemsToBeVisible() {
    await expect(this.roadmapItems.first()).toBeVisible();
  }

  async expectItemCount(expectedCount: number) {
    await expect(this.roadmapItems).toHaveCount(expectedCount);
  }

  async expectNoError() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectErrorToBeVisible(expectedMessage?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }
}
