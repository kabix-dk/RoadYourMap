# Testing Guide

## Overview

This project uses two testing frameworks:
- **Vitest** for unit and integration tests
- **Playwright** for end-to-end tests

## Unit Testing with Vitest

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests should be placed in `__tests__` directories or files ending with `.test.ts` or `.spec.ts`.

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing React Components

Use the custom render function from `@/test/utils` which includes necessary providers:

```typescript
import { render, screen, userEvent } from '@/test/utils';
```

### Mocking APIs

MSW (Mock Service Worker) is configured for API mocking. Add handlers in `src/test/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }]);
  }),
];
```

## E2E Testing with Playwright

### Running Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Generate test code
npm run test:e2e:codegen
```

### Writing E2E Tests

Use Page Object Model pattern for better maintainability:

```typescript
import { test, expect } from './fixtures';

test('should navigate to page', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.title).toBeVisible();
});
```

### Page Object Models

Create page objects in `e2e/pages/`:

```typescript
import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
  }

  async goto() {
    await this.page.goto('/');
  }
}
```

## Configuration

### Vitest Configuration

- Configuration: `vitest.config.ts`
- Setup file: `src/test/setup.ts`
- Test environment: jsdom
- Coverage provider: v8

### Playwright Configuration

- Configuration: `playwright.config.ts`
- Test directory: `e2e/`
- Browser: Chromium only
- Base URL: http://localhost:4321

## Best Practices

### Unit Tests

1. Test behavior, not implementation
2. Use descriptive test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Mock external dependencies
5. Test edge cases and error conditions

### E2E Tests

1. Use Page Object Model pattern
2. Test critical user journeys
3. Keep tests independent
4. Use data-testid attributes for stable selectors
5. Test responsive design on different viewports

### General

1. Write tests before fixing bugs
2. Keep tests simple and focused
3. Use meaningful assertions
4. Clean up after tests
5. Run tests in CI/CD pipeline 