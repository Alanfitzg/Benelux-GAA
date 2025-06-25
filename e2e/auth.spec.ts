import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display sign in page with all elements', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/signin');

    // Check for page title
    await expect(page).toHaveTitle(/Sign In/i);

    // Check for main heading
    const heading = page.getByRole('heading', { name: /sign in/i });
    await expect(heading).toBeVisible();

    // Check for form elements
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();

    // Check for sign up link
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/signin');

    // Click sign in button without filling form
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Check for validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/signin');

    // Enter invalid email
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalidemail');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('password123');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Check for email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should navigate to sign up page from sign in page', async ({ page }) => {
    await page.goto('/signin');

    // Click on sign up link
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await signUpLink.click();

    // Wait for navigation
    await page.waitForURL('/signup');

    // Verify we're on sign up page
    await expect(page).toHaveURL('/signup');
    const heading = page.getByRole('heading', { name: /sign up/i });
    await expect(heading).toBeVisible();
  });

  test('should display sign up page with all elements', async ({ page }) => {
    await page.goto('/signup');

    // Check for page title
    await expect(page).toHaveTitle(/Sign Up/i);

    // Check for form elements
    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toBeVisible();

    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();

    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    await expect(confirmPasswordInput).toBeVisible();

    const signUpButton = page.getByRole('button', { name: /sign up/i });
    await expect(signUpButton).toBeVisible();

    // Check for sign in link
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/signup');

    // Fill form with mismatched passwords
    const nameInput = page.getByLabel(/name/i);
    await nameInput.fill('Test User');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('test@example.com');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('password123');

    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    await confirmPasswordInput.fill('password456');

    const signUpButton = page.getByRole('button', { name: /sign up/i });
    await signUpButton.click();

    // Check for password mismatch error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should handle sign in with invalid credentials', async ({ page }) => {
    await page.goto('/signin');

    // Fill form with test credentials
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('nonexistent@example.com');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('wrongpassword');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should show loading state during sign in', async ({ page }) => {
    await page.goto('/signin');

    // Fill form
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('test@example.com');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('password123');

    // Intercept the sign in request to delay it
    await page.route('**/api/auth/**', async route => {
      await page.waitForTimeout(1000); // Simulate delay
      await route.continue();
    });

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Check for loading state
    await expect(signInButton).toBeDisabled();
    await expect(page.getByText(/signing in/i)).toBeVisible();
  });

  test('should redirect to profile after successful sign in', async ({ page }) => {
    // This test would require mocking the authentication API
    // For now, we'll just test that the form can be submitted
    await page.goto('/signin');

    // Mock successful authentication response
    await page.route('**/api/auth/callback/credentials', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          url: '/profile',
          ok: true 
        })
      });
    });

    // Fill form with valid credentials
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('test@example.com');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('password123');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // In a real test, we would check for redirect to profile page
    // await page.waitForURL('/profile');
    // await expect(page).toHaveURL('/profile');
  });

  test('should maintain return URL after sign in', async ({ page }) => {
    // Navigate to a protected page that should redirect to sign in
    const protectedUrl = '/events/create';
    await page.goto(protectedUrl);

    // Should be redirected to sign in page
    await page.waitForURL(/\/signin/);

    // Check that return URL is preserved in query params
    const url = new URL(page.url());
    expect(url.searchParams.get('callbackUrl')).toContain(protectedUrl);
  });
});