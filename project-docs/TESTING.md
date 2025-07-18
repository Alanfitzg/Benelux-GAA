# GAA Trips Testing Guide

This guide explains how to run tests and best practices for testing in the GAA Trips application.

## Overview

The testing infrastructure includes:
- **Jest** for unit and component testing
- **React Testing Library** for component testing
- **Playwright** for end-to-end (E2E) testing
- **Mock patterns** for API testing (MSW setup available for future use)

## Recent Test Updates (January 2025)

### ✅ **New Test Coverage Added:**
- **Password Requirements Component**: Comprehensive tests for real-time password validation
- **Authentication Components**: Enhanced coverage for January 2025 auth improvements
- **Component Behavior Testing**: Visual feedback, accessibility, and edge cases

### 📊 **Current Test Status:**
- **Total Tests**: 213 tests across the application
- **Passing Tests**: 184 core tests passing consistently
- **Authentication Tests**: Some NextAuth v5 beta compatibility issues (known issue)
- **Component Tests**: New password validation tests fully operational

### 🎯 **Recently Tested Features:**
- Auto sign-in after registration
- Password strength validation with visual indicators
- Progressive disclosure in signup forms
- Real-time password requirements checking

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
│   │   ├── auth/          # Authentication component tests
│   │   │   └── PasswordRequirements.test.tsx  # New: Password validation tests
│   │   ├── ui/            # UI component tests
│   │   │   └── FloatingContactButton.test.tsx
│   │   └── club/          # Club-related component tests
│   ├── auth/              # Authentication flow tests
│   │   ├── auth-flows.test.ts
│   │   ├── auth-helpers.test.ts
│   │   ├── integration.test.ts
│   │   ├── rate-limiting.test.ts
│   │   └── security.test.ts
│   ├── utils/             # Utility function tests
│   │   └── date.test.ts
│   ├── api/               # API endpoint tests
│   │   └── api-patterns.test.ts
│   ├── validation/        # Validation tests
│   │   ├── validation.test.ts
│   │   └── validation-schemas.test.ts
│   └── error-handling.test.tsx
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

### 3.1. Testing Recent Components (January 2025 Updates)

```typescript
// Example: Testing PasswordRequirements component
import { render, screen } from '@testing-library/react';
import PasswordRequirements from '@/components/auth/PasswordRequirements';

test('should show password requirements when show is true', () => {
  render(<PasswordRequirements password="" show={true} />);
  
  expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  expect(screen.getByText('One uppercase letter (A-Z)')).toBeInTheDocument();
  expect(screen.getByText('One lowercase letter (a-z)')).toBeInTheDocument();
  expect(screen.getByText('One number (0-9)')).toBeInTheDocument();
});

test('should indicate met requirements with green styling', () => {
  render(<PasswordRequirements password="Password123" show={true} />);
  
  const lengthReq = screen.getByText('At least 8 characters').closest('div')?.parentElement;
  expect(lengthReq?.querySelector('.text-green-600')).toBeInTheDocument();
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

5. **NextAuth v5 Beta Issues (Known Issue)**
   - Some authentication tests may fail due to NextAuth v5 beta compatibility
   - These are pre-existing issues not related to new test implementations
   - Component tests remain unaffected

### Test-Specific Troubleshooting

#### Testing Authentication Components
```typescript
// When testing components that use authentication
jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({
    data: { user: { id: '1', name: 'Test User' } },
    status: 'authenticated'
  })
}));
```

#### Testing Components with Framer Motion
```typescript
// Framer Motion is already mocked in jest.setup.js
// Components using motion.div, AnimatePresence work automatically
```

#### Testing Form Components
```typescript
// For components with complex form validation
import { fireEvent, waitFor } from '@testing-library/react';

test('should validate form fields', async () => {
  render(<MyForm />);
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

## Test Maintenance & Updates

### Recent Improvements (January 2025)

1. **Enhanced Password Validation Testing**
   - Added comprehensive tests for `PasswordRequirements` component
   - Tests cover real-time validation, visual feedback, and edge cases
   - All 9 tests passing consistently

2. **Test Infrastructure Improvements**
   - Updated Jest configuration for better Next.js 15 compatibility
   - Enhanced mocking patterns for Framer Motion components
   - Improved TypeScript support in test environment

3. **Authentication Component Coverage**
   - New tests for password strength indicators
   - Coverage for auto sign-in functionality
   - Progressive disclosure testing for signup forms

### Test Maintenance Guidelines

1. **When Adding New Components**
   - Create corresponding test files in the same directory structure
   - Follow the naming convention: `ComponentName.test.tsx`
   - Include tests for all major component behaviors

2. **When Updating Existing Components**
   - Update corresponding tests to match new functionality
   - Ensure all existing tests still pass
   - Add new tests for added features

3. **Performance Considerations**
   - Run tests frequently during development: `npm run test:watch`
   - Use `--testPathPattern` to run specific test suites
   - Keep test files focused and avoid unnecessary complexity

### Testing Checklist for New Features

- [ ] Unit tests for utility functions
- [ ] Component tests for UI interactions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Accessibility testing for form components
- [ ] Error handling and edge case testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testing Library Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)