# GAA Trips Testing Guide

This guide explains how to run tests and best practices for testing in the GAA Trips application.

## Overview

The testing infrastructure includes:
- **Jest** for unit and component testing
- **React Testing Library** for component testing
- **Playwright** for end-to-end (E2E) testing
- **Mock patterns** for API testing (MSW setup available for future use)

## Running Tests

### Unit and Component Tests (Jest)

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

## Directory Structure

```
src/
├── __tests__/              # Unit and component tests
│   ├── components/         # Component tests
│   │   └── ui/            # UI component tests
│   ├── utils/             # Utility function tests
│   ├── hooks/             # Custom hook tests
│   └── lib/               # Library function tests
│
e2e/                       # End-to-end tests
├── auth.spec.ts           # Authentication flow tests
├── clubs.spec.ts          # Club-related tests
└── events.spec.ts         # Event-related tests
```

## Testing Best Practices

### 1. Test File Naming

- Unit/Component tests: `[filename].test.ts(x)` or place in `__tests__` directory
- E2E tests: `[feature].spec.ts` in the `e2e` directory

### 2. Test Organization

```typescript
describe('ComponentName', () => {
  // Group related tests
  describe('rendering', () => {
    it('should render with default props', () => {
      // Test implementation
    });
  });

  describe('user interactions', () => {
    it('should handle click events', () => {
      // Test implementation
    });
  });
});
```

### 3. Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

test('should handle user input', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'Hello World');
  
  expect(input).toHaveValue('Hello World');
});
```

### 4. Testing Async Operations

```typescript
import { render, screen, waitFor } from '@testing-library/react';

test('should load data', async () => {
  render(<DataComponent />);
  
  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 5. Mocking APIs with Fetch

```typescript
// Mock fetch globally for testing
global.fetch = jest.fn();

describe('API Tests', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Test Club' }],
    } as Response);

    const response = await fetch('/api/clubs');
    const data = await response.json();
    
    expect(data).toEqual([{ id: 1, name: 'Test Club' }]);
  });
});
```

### 6. E2E Testing Best Practices

```typescript
import { test, expect } from '@playwright/test';

test('user can create an event', async ({ page }) => {
  // Navigate to page
  await page.goto('/events/create');
  
  // Fill form
  await page.getByLabel('Event Name').fill('Test Event');
  await page.getByLabel('Date').fill('2025-12-25');
  
  // Submit form
  await page.getByRole('button', { name: 'Create Event' }).click();
  
  // Verify success
  await expect(page).toHaveURL(/\/events\/\d+/);
  await expect(page.getByText('Test Event')).toBeVisible();
});
```

## Common Testing Patterns

### Testing Protected Routes

```typescript
test('should redirect to sign in when not authenticated', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL('/signin');
});
```

### Testing Form Validation

```typescript
test('should show validation errors', async () => {
  render(<ContactForm />);
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
  
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

### Testing Loading States

```typescript
test('should show loading spinner', async () => {
  render(<ClubList />);
  
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

## Coverage Requirements

While there are no strict coverage requirements set, aim for:
- 80% coverage for utility functions
- 70% coverage for components
- Critical user flows covered by E2E tests

## Debugging Tests

### Jest Tests
- Use `console.log()` for quick debugging
- Use `screen.debug()` to see the current DOM
- Run specific tests: `npm test -- --testNamePattern="should render"`

### Playwright Tests
- Use `--debug` flag: `npm run test:e2e:debug`
- Use `page.pause()` to pause execution
- Use UI mode for step-by-step debugging: `npm run test:e2e:ui`

## CI/CD Integration

Tests should be run in CI/CD pipeline:
1. Run unit/component tests first (faster)
2. Run E2E tests if unit tests pass
3. Generate coverage reports
4. Fail build if tests fail

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check import paths use `@/` alias correctly
   - Ensure TypeScript paths are configured

2. **React 19 compatibility**
   - Some testing libraries may have peer dependency warnings
   - Use `--legacy-peer-deps` if needed

3. **Async test timeouts**
   - Increase timeout: `jest.setTimeout(10000)`
   - Check for proper async/await usage

4. **Playwright test failures**
   - Ensure dev server is running
   - Check for correct selectors
   - Use `data-testid` for reliable element selection

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)