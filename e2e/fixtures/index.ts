import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { RoadmapCreationPage } from "../pages/RoadmapCreationPage";
import { RoadmapEditPage } from "../pages/RoadmapEditPage";
import { AuthHelper, type TestUser } from "../helpers/auth";

interface MyFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  roadmapCreationPage: RoadmapCreationPage;
  roadmapEditPage: RoadmapEditPage;
  authHelper: AuthHelper;
  authenticatedUser: TestUser;
}

export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  roadmapCreationPage: async ({ page }, use) => {
    const roadmapCreationPage = new RoadmapCreationPage(page);
    await use(roadmapCreationPage);
  },

  roadmapEditPage: async ({ page }, use) => {
    const roadmapEditPage = new RoadmapEditPage(page);
    await use(roadmapEditPage);
  },

  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },

  // This fixture automatically logs in a test user
  authenticatedUser: async ({ authHelper }, use) => {
    const testUser: TestUser = {
      email: process.env.E2E_USERNAME || "test@example.com",
      password: process.env.E2E_PASSWORD || "testpassword123",
    };

    await authHelper.loginViaAPI(testUser);
    await use(testUser);
  },
});

export { expect } from "@playwright/test";
