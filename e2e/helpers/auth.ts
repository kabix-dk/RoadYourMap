import { type Page } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
  id?: string;
}

export class AuthHelper {
  constructor(private page: Page) {}

  async loginViaAPI(user: TestUser): Promise<void> {
    // Login via API endpoint
    const response = await this.page.request.post("/api/auth/login", {
      data: {
        email: user.email,
        password: user.password,
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status()} ${errorText}`);
    }

    // The cookies should be automatically set by the API response
    // Verify we're logged in by checking a protected page
    await this.page.goto("/dashboard");

    // Wait for redirect to complete - if we're still on dashboard, we're logged in
    await this.page.waitForURL("/dashboard", { timeout: 5000 });
  }

  async loginViaUI(user: TestUser): Promise<void> {
    await this.page.goto("/auth/login");

    // Fill login form
    await this.page.locator('input[type="email"]').fill(user.email);
    await this.page.locator('input[type="password"]').fill(user.password);
    await this.page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await this.page.waitForURL("/dashboard", { timeout: 10000 });
  }

  async logout(): Promise<void> {
    await this.page.request.post("/api/auth/logout");
    await this.page.goto("/");
  }

  async logoutViaUI(): Promise<void> {
    // Try to find logout button on current page
    const logoutButton = this.page.locator("button").filter({ hasText: "Wyloguj" });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Fallback to API logout
      await this.logout();
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.goto("/dashboard");
      await this.page.waitForURL("/dashboard", { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async ensureLoggedOut(): Promise<void> {
    if (await this.isLoggedIn()) {
      await this.logout();
    }
  }

  async ensureLoggedIn(user: TestUser): Promise<void> {
    if (!(await this.isLoggedIn())) {
      await this.loginViaAPI(user);
    }
  }

  async getAuthenticatedUserId(): Promise<string | null> {
    try {
      // Try to extract user ID from a protected API endpoint or page
      const response = await this.page.request.get("/api/user/profile");
      if (response.ok()) {
        const data = await response.json();
        return data.user?.id || null;
      }
    } catch {
      // Fallback: not implemented or error
    }
    return null;
  }

  async createTestUser(userData: Omit<TestUser, "id">): Promise<TestUser> {
    const response = await this.page.request.post("/api/auth/register", {
      data: userData,
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`User creation failed: ${response.status()} ${errorText}`);
    }

    const result = await response.json();
    return {
      ...userData,
      id: result.user?.id,
    };
  }

  async deleteTestUser(userId: string): Promise<void> {
    // This would require admin API or direct database access
    // For now, just a placeholder
    console.warn(`Test user cleanup not implemented for user ${userId}`);
  }
}
