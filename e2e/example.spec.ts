import { test, expect } from "./fixtures";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForLoad();

    // Sprawdź czy strona się załadowała
    await expect(homePage.page).toHaveTitle(/RoadYourMap/);
  });

  test("should display page content", async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForLoad();

    // Sprawdź czy tytuł jest widoczny
    await expect(homePage.title).toBeVisible();
  });

  test("should have proper navigation", async ({ page }) => {
    await page.goto("/");

    // Przykład testowania nawigacji
    // await page.click('nav a[href="/about"]');
    // await expect(page).toHaveURL(/.*about/);
  });
});
