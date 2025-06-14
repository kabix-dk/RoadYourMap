import { type Page, type Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createRoadmapButton: Locator;
  readonly createRoadmapLink: Locator;
  readonly roadmapCards: Locator;
  readonly emptyStateMessage: Locator;
  readonly emptyStateCreateButton: Locator;
  readonly logoutButton: Locator;
  readonly userGreeting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1").filter({ hasText: "Dashboard" });
    this.createRoadmapButton = page.locator("button, a").filter({ hasText: "Utwórz Roadmapę" });
    this.createRoadmapLink = page.locator('a[href="/roadmaps/create"]');
    this.roadmapCards = page.locator('[data-test-id="roadmap-card"], .roadmap-card');
    this.emptyStateMessage = page.locator("p").filter({ hasText: "Nie masz jeszcze żadnych roadmap" });
    this.emptyStateCreateButton = page
      .locator('a[href="/roadmaps/create"]')
      .filter({ hasText: "Utwórz swoją pierwszą roadmapę" });
    this.logoutButton = page.locator("button").filter({ hasText: "Wyloguj" });
    this.userGreeting = page.locator('[data-test-id="user-greeting"], .user-greeting');
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async waitForLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }

  async goToCreateRoadmap() {
    // Try multiple selectors for create roadmap button/link
    if (await this.createRoadmapLink.isVisible()) {
      await this.createRoadmapLink.click();
    } else if (await this.emptyStateCreateButton.isVisible()) {
      await this.emptyStateCreateButton.click();
    } else if (await this.createRoadmapButton.isVisible()) {
      await this.createRoadmapButton.click();
    } else {
      throw new Error("No create roadmap button/link found on dashboard");
    }
  }

  async logout() {
    await this.logoutButton.click();
  }

  async getRoadmapCount(): Promise<number> {
    return await this.roadmapCards.count();
  }

  async hasRoadmaps(): Promise<boolean> {
    return (await this.getRoadmapCount()) > 0;
  }

  async isEmptyState(): Promise<boolean> {
    return await this.emptyStateMessage.isVisible();
  }

  async getRoadmapTitles(): Promise<string[]> {
    const cards = await this.roadmapCards.all();
    const titles: string[] = [];

    for (const card of cards) {
      const titleElement = card.locator("h3, .roadmap-title").first();
      const title = await titleElement.textContent();
      if (title) {
        titles.push(title.trim());
      }
    }

    return titles;
  }

  async clickRoadmapByTitle(title: string) {
    const card = this.roadmapCards.filter({ hasText: title }).first();
    await card.click();
  }

  async editRoadmapByTitle(title: string) {
    const card = this.roadmapCards.filter({ hasText: title }).first();
    const editButton = card.locator("button, a").filter({ hasText: "Edytuj" });
    await editButton.click();
  }

  async previewRoadmapByTitle(title: string) {
    const card = this.roadmapCards.filter({ hasText: title }).first();
    const previewButton = card.locator("button, a").filter({ hasText: "Podgląd" });
    await previewButton.click();
  }

  async deleteRoadmapByTitle(title: string) {
    const card = this.roadmapCards.filter({ hasText: title }).first();
    const deleteButton = card.locator("button").filter({ hasText: "Usuń" });
    await deleteButton.click();
  }

  // Assertion helpers
  async expectPageToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectToBeOnDashboard() {
    await expect(this.page).toHaveURL("/dashboard");
    await this.expectPageToBeVisible();
  }

  async expectEmptyState() {
    await expect(this.emptyStateMessage).toBeVisible();
    await expect(this.emptyStateCreateButton).toBeVisible();
  }

  async expectRoadmapsToBeVisible() {
    await expect(this.roadmapCards.first()).toBeVisible();
  }

  async expectRoadmapCount(expectedCount: number) {
    await expect(this.roadmapCards).toHaveCount(expectedCount);
  }

  async expectRoadmapWithTitle(title: string) {
    const card = this.roadmapCards.filter({ hasText: title });
    await expect(card).toBeVisible();
  }

  async expectCreateRoadmapButtonToBeVisible() {
    const hasCreateLink = await this.createRoadmapLink.isVisible();
    const hasEmptyStateButton = await this.emptyStateCreateButton.isVisible();
    const hasCreateButton = await this.createRoadmapButton.isVisible();

    expect(hasCreateLink || hasEmptyStateButton || hasCreateButton).toBe(true);
  }
}
