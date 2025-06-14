import { type Page, type Locator, expect } from "@playwright/test";

export interface RoadmapFormData {
  title: string;
  experienceLevel: string;
  technology: string;
  goals: string;
  additionalInfo?: string;
}

export class RoadmapCreationPage {
  readonly page: Page;

  // Main containers
  readonly form: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Navigation elements
  readonly dashboardLink: Locator;
  readonly logoutButton: Locator;

  // Form fields
  readonly titleInput: Locator;
  readonly experienceLevelInput: Locator;
  readonly technologyInput: Locator;
  readonly goalsTextarea: Locator;
  readonly additionalInfoTextarea: Locator;

  // Labels
  readonly titleLabel: Locator;
  readonly experienceLevelLabel: Locator;
  readonly technologyLabel: Locator;
  readonly goalsLabel: Locator;
  readonly additionalInfoLabel: Locator;

  // Field groups (for validation testing)
  readonly titleFieldGroup: Locator;
  readonly experienceLevelFieldGroup: Locator;
  readonly technologyFieldGroup: Locator;
  readonly goalsFieldGroup: Locator;
  readonly additionalInfoFieldGroup: Locator;

  // Submit and loading states
  readonly submitButton: Locator;
  readonly loadingSpinner: Locator;

  // Error messages
  readonly apiError: Locator;
  readonly inlineErrors: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main containers
    this.form = page.locator('[data-test-id="roadmap-creation-form"]');
    this.pageTitle = page.locator("h1").filter({ hasText: "Utwórz Roadmapę" });
    this.pageDescription = page.locator("p").filter({ hasText: "Stwórz spersonalizowany plan nauki z pomocą AI" });

    // Navigation elements
    this.dashboardLink = page.locator('a[href="/dashboard"]');
    this.logoutButton = page.locator("button").filter({ hasText: "Wyloguj się" });

    // Form fields
    this.titleInput = page.locator('[data-test-id="title-input"]');
    this.experienceLevelInput = page.locator('[data-test-id="experience-level-input"]');
    this.technologyInput = page.locator('[data-test-id="technology-input"]');
    this.goalsTextarea = page.locator('[data-test-id="goals-textarea"]');
    this.additionalInfoTextarea = page.locator('[data-test-id="additional-info-textarea"]');

    // Labels
    this.titleLabel = page.locator('[data-test-id="title-label"]');
    this.experienceLevelLabel = page.locator('[data-test-id="experience-level-label"]');
    this.technologyLabel = page.locator('[data-test-id="technology-label"]');
    this.goalsLabel = page.locator('[data-test-id="goals-label"]');
    this.additionalInfoLabel = page.locator('[data-test-id="additional-info-label"]');

    // Field groups
    this.titleFieldGroup = page.locator('[data-test-id="title-field-group"]');
    this.experienceLevelFieldGroup = page.locator('[data-test-id="experience-level-field-group"]');
    this.technologyFieldGroup = page.locator('[data-test-id="technology-field-group"]');
    this.goalsFieldGroup = page.locator('[data-test-id="goals-field-group"]');
    this.additionalInfoFieldGroup = page.locator('[data-test-id="additional-info-field-group"]');

    // Submit and loading states
    this.submitButton = page.locator('[data-test-id="submit-button"]');
    this.loadingSpinner = page.locator('[data-test-id="loading-spinner"]');

    // Error messages
    this.apiError = page.locator('[data-test-id="api-error"]');
    this.inlineErrors = page.locator('[data-test-id="inline-error"]');
  }

  // Navigation methods
  async goto() {
    await this.page.goto("/roadmaps/create");
  }

  async waitForLoad() {
    await this.form.waitFor({ state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }

  async goToDashboard() {
    await this.dashboardLink.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  // Form filling methods
  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async fillExperienceLevel(level: string) {
    await this.experienceLevelInput.fill(level);
  }

  async fillTechnology(technology: string) {
    await this.technologyInput.fill(technology);
  }

  async fillGoals(goals: string) {
    await this.goalsTextarea.fill(goals);
  }

  async fillAdditionalInfo(info: string) {
    await this.additionalInfoTextarea.fill(info);
  }

  async fillForm(data: RoadmapFormData) {
    await this.fillTitle(data.title);
    await this.fillExperienceLevel(data.experienceLevel);
    await this.fillTechnology(data.technology);
    await this.fillGoals(data.goals);

    if (data.additionalInfo) {
      await this.fillAdditionalInfo(data.additionalInfo);
    }
  }

  async clearForm() {
    await this.titleInput.clear();
    await this.experienceLevelInput.clear();
    await this.technologyInput.clear();
    await this.goalsTextarea.clear();
    await this.additionalInfoTextarea.clear();
  }

  // Form submission methods
  async submitForm() {
    await this.submitButton.click({ force: true });
  }

  async submitFormAndWait() {
    await this.submitForm();
    // Wait for either success redirect or error message
    await Promise.race([
      this.page.waitForURL(/\/roadmaps\/.*\/edit/, { timeout: 10000 }),
      this.apiError.waitFor({ state: "visible", timeout: 5000 }),
    ]);
  }

  // Validation and error checking methods
  async getInlineErrorForField(fieldGroup: Locator): Promise<string | null> {
    const errorElement = fieldGroup.locator('[data-test-id="inline-error"]');
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async getTitleError(): Promise<string | null> {
    return await this.getInlineErrorForField(this.titleFieldGroup);
  }

  async getExperienceLevelError(): Promise<string | null> {
    return await this.getInlineErrorForField(this.experienceLevelFieldGroup);
  }

  async getTechnologyError(): Promise<string | null> {
    return await this.getInlineErrorForField(this.technologyFieldGroup);
  }

  async getGoalsError(): Promise<string | null> {
    return await this.getInlineErrorForField(this.goalsFieldGroup);
  }

  async getAdditionalInfoError(): Promise<string | null> {
    return await this.getInlineErrorForField(this.additionalInfoFieldGroup);
  }

  async getApiError(): Promise<string | null> {
    if (await this.apiError.isVisible()) {
      return await this.apiError.textContent();
    }
    return null;
  }

  async hasValidationErrors(): Promise<boolean> {
    return await this.inlineErrors.first().isVisible();
  }

  // State checking methods
  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async getSubmitButtonText(): Promise<string> {
    return (await this.submitButton.textContent()) || "";
  }

  // Field validation methods
  async triggerFieldValidation(field: Locator) {
    await field.focus();
    await field.blur();
  }

  async triggerAllFieldValidation() {
    const fields = [
      this.titleInput,
      this.experienceLevelInput,
      this.technologyInput,
      this.goalsTextarea,
      this.additionalInfoTextarea,
    ];

    for (const field of fields) {
      await this.triggerFieldValidation(field);
    }
  }

  // Assertion helpers
  async expectFormToBeVisible() {
    await expect(this.form).toBeVisible();
  }

  async expectPageTitleToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectFieldToHaveError(fieldGroup: Locator, expectedError: string) {
    const errorElement = fieldGroup.locator('[data-test-id="inline-error"]');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedError);
  }

  async expectFieldToHaveNoError(fieldGroup: Locator) {
    const errorElement = fieldGroup.locator('[data-test-id="inline-error"]');
    await expect(errorElement).not.toBeVisible();
  }

  async expectApiErrorToBeVisible(expectedMessage?: string) {
    await expect(this.apiError).toBeVisible();
    if (expectedMessage) {
      await expect(this.apiError).toContainText(expectedMessage);
    }
  }

  async expectApiErrorToBeHidden() {
    await expect(this.apiError).not.toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.submitButton).toBeDisabled();
    await expect(this.submitButton).toContainText("Generowanie...");
  }

  async expectNormalState() {
    await expect(this.loadingSpinner).not.toBeVisible();
    await expect(this.submitButton).not.toBeDisabled();
    await expect(this.submitButton).toContainText("Generuj Roadmapę");
  }

  // Field value getters
  async getTitleValue(): Promise<string> {
    return await this.titleInput.inputValue();
  }

  async getExperienceLevelValue(): Promise<string> {
    return await this.experienceLevelInput.inputValue();
  }

  async getTechnologyValue(): Promise<string> {
    return await this.technologyInput.inputValue();
  }

  async getGoalsValue(): Promise<string> {
    return await this.goalsTextarea.inputValue();
  }

  async getAdditionalInfoValue(): Promise<string> {
    return await this.additionalInfoTextarea.inputValue();
  }

  async getFormData(): Promise<RoadmapFormData> {
    return {
      title: await this.getTitleValue(),
      experienceLevel: await this.getExperienceLevelValue(),
      technology: await this.getTechnologyValue(),
      goals: await this.getGoalsValue(),
      additionalInfo: await this.getAdditionalInfoValue(),
    };
  }

  // Placeholder checking methods
  async expectPlaceholders() {
    await expect(this.titleInput).toHaveAttribute("placeholder", "Wprowadź tytuł roadmapy");
    await expect(this.experienceLevelInput).toHaveAttribute("placeholder", "Np. Junior, Mid, Senior");
    await expect(this.technologyInput).toHaveAttribute("placeholder", "Np. React, Python, Java");
    await expect(this.goalsTextarea).toHaveAttribute("placeholder", "Opisz swoje cele nauki");
    await expect(this.additionalInfoTextarea).toHaveAttribute("placeholder", "Wprowadź dodatkowe informacje");
  }

  // Accessibility checking methods
  async expectProperLabeling() {
    await expect(this.titleInput).toHaveAttribute("id", "title");
    await expect(this.titleLabel).toHaveAttribute("for", "title");

    await expect(this.experienceLevelInput).toHaveAttribute("id", "experience_level");
    await expect(this.experienceLevelLabel).toHaveAttribute("for", "experience_level");

    await expect(this.technologyInput).toHaveAttribute("id", "technology");
    await expect(this.technologyLabel).toHaveAttribute("for", "technology");

    await expect(this.goalsTextarea).toHaveAttribute("id", "goals");
    await expect(this.goalsLabel).toHaveAttribute("for", "goals");

    await expect(this.additionalInfoTextarea).toHaveAttribute("id", "additional_info");
    await expect(this.additionalInfoLabel).toHaveAttribute("for", "additional_info");
  }
}
