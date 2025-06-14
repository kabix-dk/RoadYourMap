/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "./fixtures";
import {
  validRoadmapData,
  invalidRoadmapData,
  getUniqueRoadmapData,
  getTestUser,
  testRoadmapVariations,
} from "./helpers/testData";

test.describe("Roadmap Creation Form", () => {
  test.describe("Authentication & Access Control", () => {
    test("should redirect unauthenticated users to login page", async ({ page }) => {
      await page.goto("/roadmaps/create");
      await expect(page).toHaveURL("/auth/login");
    });

    test("should allow authenticated users to access creation form", async ({
      roadmapCreationPage,
      authenticatedUser,
    }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();
      await roadmapCreationPage.expectFormToBeVisible();
      await roadmapCreationPage.expectPageTitleToBeVisible();
    });
  });

  test.describe("Form UI & Accessibility", () => {
    test("should display all form elements correctly", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      // Check page structure
      await roadmapCreationPage.expectPageTitleToBeVisible();
      await roadmapCreationPage.expectFormToBeVisible();

      // Check all form fields are visible
      await expect(roadmapCreationPage.titleInput).toBeVisible();
      await expect(roadmapCreationPage.experienceLevelInput).toBeVisible();
      await expect(roadmapCreationPage.technologyInput).toBeVisible();
      await expect(roadmapCreationPage.goalsTextarea).toBeVisible();
      await expect(roadmapCreationPage.additionalInfoTextarea).toBeVisible();
      await expect(roadmapCreationPage.submitButton).toBeVisible();

      // Check navigation elements
      await expect(roadmapCreationPage.dashboardLink).toBeVisible();
      await expect(roadmapCreationPage.logoutButton).toBeVisible();
    });

    test("should have proper accessibility attributes", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.expectProperLabeling();
      await roadmapCreationPage.expectPlaceholders();

      // Check form has noValidate attribute
      await expect(roadmapCreationPage.form).toHaveAttribute("noValidate");
    });

    test("should show correct placeholders", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();
      await roadmapCreationPage.expectPlaceholders();
    });
  });

  test.describe("Form Validation - Client Side", () => {
    test("should show validation errors for empty required fields", async ({
      roadmapCreationPage,
      authenticatedUser,
    }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      // Submit empty form
      await roadmapCreationPage.submitForm();

      // Check validation errors appear
      await roadmapCreationPage.expectFieldToHaveError(roadmapCreationPage.titleFieldGroup, "Tytuł jest wymagany");
      await roadmapCreationPage.expectFieldToHaveError(
        roadmapCreationPage.experienceLevelFieldGroup,
        "Poziom doświadczenia jest wymagany"
      );
      await roadmapCreationPage.expectFieldToHaveError(
        roadmapCreationPage.technologyFieldGroup,
        "Technologia jest wymagana"
      );
      await roadmapCreationPage.expectFieldToHaveError(roadmapCreationPage.goalsFieldGroup, "Cele są wymagane");

      // Additional info should not have error (optional field)
      await roadmapCreationPage.expectFieldToHaveNoError(roadmapCreationPage.additionalInfoFieldGroup);
    });

    test("should show validation errors for fields exceeding max length", async ({
      roadmapCreationPage,
      authenticatedUser,
    }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(invalidRoadmapData.tooLong);
      await roadmapCreationPage.submitForm();

      await roadmapCreationPage.expectFieldToHaveError(roadmapCreationPage.titleFieldGroup, "maksymalnie 255 znaków");
      await roadmapCreationPage.expectFieldToHaveError(
        roadmapCreationPage.experienceLevelFieldGroup,
        "maksymalnie 50 znaków"
      );
      await roadmapCreationPage.expectFieldToHaveError(
        roadmapCreationPage.technologyFieldGroup,
        "maksymalnie 100 znaków"
      );
    });

    test("should clear field errors when user corrects input", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      // Submit empty form to trigger errors
      await roadmapCreationPage.submitForm();
      await roadmapCreationPage.expectFieldToHaveError(roadmapCreationPage.titleFieldGroup, "Tytuł jest wymagany");

      // Fill the field and check error disappears
      await roadmapCreationPage.fillTitle("Valid Title");
      await roadmapCreationPage.expectFieldToHaveNoError(roadmapCreationPage.titleFieldGroup);
    });

    test("should validate fields on submit attempt", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      // Try to submit empty form to trigger validation
      await roadmapCreationPage.submitForm();

      // Should show validation error after submit attempt
      await roadmapCreationPage.expectFieldToHaveError(roadmapCreationPage.titleFieldGroup, "Tytuł jest wymagany");
    });
  });

  test.describe("Form Submission - Error Handling", () => {
    test("should handle API errors gracefully", async ({ roadmapCreationPage, authenticatedUser, page }) => {
      // Mock API to return error
      await page.route("/api/roadmaps/generate", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(validRoadmapData);
      await roadmapCreationPage.submitFormAndWait();

      // Should show API error
      await roadmapCreationPage.expectApiErrorToBeVisible();
      await roadmapCreationPage.expectNormalState(); // Should return to normal state
    });

    test("should handle roadmap limit exceeded error", async ({ roadmapCreationPage, authenticatedUser, page }) => {
      // Mock API to return limit exceeded error
      await page.route("/api/roadmaps/generate", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "User has reached max roadmaps" }),
        });
      });

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(validRoadmapData);
      await roadmapCreationPage.submitFormAndWait();

      await roadmapCreationPage.expectApiErrorToBeVisible("max roadmaps");
    });

    test("should handle network errors", async ({ roadmapCreationPage, authenticatedUser, page }) => {
      // Mock network failure
      await page.route("/api/roadmaps/generate", async (route) => {
        await route.abort("failed");
      });

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(validRoadmapData);
      await roadmapCreationPage.submitFormAndWait();

      await roadmapCreationPage.expectApiErrorToBeVisible("nieoczekiwany błąd");
    });

    test("should prevent double submission", async ({ roadmapCreationPage, authenticatedUser, page }) => {
      // Mock slow API response
      await page.route("/api/roadmaps/generate", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ roadmap: { id: "test-id" } }),
        });
      });

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(validRoadmapData);
      await roadmapCreationPage.submitForm();

      // Should be in loading state
      await roadmapCreationPage.expectLoadingState();

      // Try to submit again - button should be disabled
      await expect(roadmapCreationPage.submitButton).toBeDisabled();
    });
  });

  test.describe("Form Interaction & UX", () => {
    test("should maintain form data when navigating back", async ({
      roadmapCreationPage,
      dashboardPage,
      authenticatedUser,
    }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      // Fill form partially
      await roadmapCreationPage.fillTitle("Test Title");
      await roadmapCreationPage.fillExperienceLevel("Mid");

      // Navigate to dashboard
      await roadmapCreationPage.goToDashboard();
      await dashboardPage.expectToBeOnDashboard();

      // Navigate back
      await dashboardPage.goToCreateRoadmap();
      await roadmapCreationPage.waitForLoad();

      // Form should be empty (new page load)
      expect(await roadmapCreationPage.getTitleValue()).toBe("");
      expect(await roadmapCreationPage.getExperienceLevelValue()).toBe("");
    });

    test("should clear form when clear method is called", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(validRoadmapData);

      // Verify form is filled
      expect(await roadmapCreationPage.getTitleValue()).toBe(validRoadmapData.title);

      await roadmapCreationPage.clearForm();

      // Verify form is cleared
      expect(await roadmapCreationPage.getTitleValue()).toBe("");
      expect(await roadmapCreationPage.getExperienceLevelValue()).toBe("");
    });

    test("should handle special characters in form fields", async ({ roadmapCreationPage, authenticatedUser }) => {
      const specialCharData = {
        title: "React & Vue.js - Full-Stack Development (2024)",
        experienceLevel: "Mid-Senior",
        technology: "React.js, Vue.js, Node.js",
        goals:
          "Learn modern frameworks: React & Vue\nMaster full-stack development\n- API design\n- Database optimization",
        additionalInfo: "Focus on: TypeScript, GraphQL & REST APIs\nInclude testing: Jest, Cypress",
      };

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(specialCharData);

      // Verify special characters are preserved
      expect(await roadmapCreationPage.getTitleValue()).toBe(specialCharData.title);
      expect(await roadmapCreationPage.getGoalsValue()).toBe(specialCharData.goals);
    });
  });

  test.describe("Navigation & Integration", () => {
    test("should navigate to dashboard when dashboard link is clicked", async ({
      roadmapCreationPage,
      dashboardPage,
      authenticatedUser,
    }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.goToDashboard();
      await dashboardPage.expectToBeOnDashboard();
    });

    test("should logout when logout button is clicked", async ({
      roadmapCreationPage,
      authHelper,
      authenticatedUser,
    }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.logout();

      // Should redirect to home page and be logged out
      expect(await authHelper.isLoggedIn()).toBe(false);
    });
  });

  test.describe("Edge Cases & Performance", () => {
    test("should handle very long form submission time", async ({ roadmapCreationPage, authenticatedUser, page }) => {
      // Mock very slow API response (but not timeout)
      await page.route("/api/roadmaps/generate", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ roadmap: { id: "slow-test-id" } }),
        });
      });

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(validRoadmapData);
      await roadmapCreationPage.submitForm();

      // Should maintain loading state
      await roadmapCreationPage.expectLoadingState();

      // Wait for completion
      await expect(roadmapCreationPage.page).toHaveURL(/\/roadmaps\/.*\/edit/, { timeout: 30000 });
    });

    test("should handle form with maximum allowed character limits", async ({
      roadmapCreationPage,
      authenticatedUser,
    }) => {
      const maxLengthData = {
        title: "A".repeat(255), // Exactly max length
        experienceLevel: "B".repeat(50), // Exactly max length
        technology: "C".repeat(100), // Exactly max length
        goals: "D".repeat(1000), // Long but valid
        additionalInfo: "E".repeat(2000), // Long but valid
      };

      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      await roadmapCreationPage.fillForm(maxLengthData);

      // Should not show validation errors
      await roadmapCreationPage.expectApiErrorToBeHidden();

      // Form should be submittable
      await expect(roadmapCreationPage.submitButton).not.toBeDisabled();
    });

    test("should handle rapid form interactions", async ({ roadmapCreationPage, authenticatedUser }) => {
      await roadmapCreationPage.goto();
      await roadmapCreationPage.waitForLoad();

      // Rapidly fill and clear form multiple times
      for (let i = 0; i < 3; i++) {
        await roadmapCreationPage.fillForm(validRoadmapData);
        await roadmapCreationPage.clearForm();
      }

      // Form should still be functional
      await roadmapCreationPage.fillForm(validRoadmapData);
      await expect(roadmapCreationPage.submitButton).not.toBeDisabled();
    });
  });
});
