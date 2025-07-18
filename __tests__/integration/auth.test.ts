import { test, expect } from '@playwright/test'

test.describe('Authentication Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.route('**/api/auth/**', route => {
      const url = route.request().url()
      if (url.includes('/session')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: null })
        })
      } else {
        route.continue()
      }
    })
  })

  test('Sign in page loads correctly', async ({ page }) => {
    await page.goto('/sign-in')
    
    await expect(page).toHaveTitle(/Sign In/)
    await expect(page.locator('h1')).toContainText('Sign In')
    
    // Check form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Sign up page loads correctly', async ({ page }) => {
    await page.goto('/sign-up')
    
    await expect(page).toHaveTitle(/Sign Up/)
    await expect(page.locator('h1')).toContainText('Sign Up')
    
    // Check form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Navigation shows correct auth state when not logged in', async ({ page }) => {
    await page.goto('/')
    
    // Should show sign in/sign up links
    await expect(page.locator('[data-testid="auth-sign-in"]')).toBeVisible()
    await expect(page.locator('[data-testid="auth-sign-up"]')).toBeVisible()
    
    // Should not show user menu
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible()
  })

  test('Protected routes redirect to sign in', async ({ page }) => {
    await page.goto('/admin')
    
    // Should redirect to sign in page
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('Form validation works correctly', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click()
    
    // Should show validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    
    // Fill invalid email
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('button[type="submit"]').click()
    
    // Should show email validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email')
  })

  test('Password strength indicator works', async ({ page }) => {
    await page.goto('/sign-up')
    
    const passwordInput = page.locator('input[type="password"]')
    const strengthIndicator = page.locator('[data-testid="password-strength"]')
    
    // Weak password
    await passwordInput.fill('123')
    await expect(strengthIndicator).toContainText('Weak')
    
    // Medium password
    await passwordInput.fill('Password123')
    await expect(strengthIndicator).toContainText('Medium')
    
    // Strong password
    await passwordInput.fill('StrongPassword123!')
    await expect(strengthIndicator).toContainText('Strong')
  })

  test('Remember me checkbox works', async ({ page }) => {
    await page.goto('/sign-in')
    
    const rememberMeCheckbox = page.locator('[data-testid="remember-me"]')
    
    // Should be unchecked by default
    await expect(rememberMeCheckbox).not.toBeChecked()
    
    // Should be checkable
    await rememberMeCheckbox.check()
    await expect(rememberMeCheckbox).toBeChecked()
    
    // Should be uncheckable
    await rememberMeCheckbox.uncheck()
    await expect(rememberMeCheckbox).not.toBeChecked()
  })

  test('Social login buttons are present', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Check for social login buttons
    await expect(page.locator('[data-testid="google-signin"]')).toBeVisible()
    await expect(page.locator('[data-testid="github-signin"]')).toBeVisible()
  })

  test('Forgot password link works', async ({ page }) => {
    await page.goto('/sign-in')
    
    const forgotPasswordLink = page.locator('[data-testid="forgot-password"]')
    await expect(forgotPasswordLink).toBeVisible()
    
    await forgotPasswordLink.click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('Switch between sign in and sign up', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Click sign up link
    await page.locator('[data-testid="switch-to-signup"]').click()
    await expect(page).toHaveURL(/\/sign-up/)
    
    // Click sign in link
    await page.locator('[data-testid="switch-to-signin"]').click()
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('Error messages display correctly', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Mock authentication error
    await page.route('**/api/auth/signin', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      })
    })
    
    // Fill form and submit
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()
    
    // Should show error message
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Invalid credentials')
  })

  test('Loading state during authentication', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Mock slow authentication
    await page.route('**/api/auth/signin', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: { id: 1, email: 'test@example.com' } })
        })
      }, 2000)
    })
    
    // Fill form and submit
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()
    
    // Should show loading state
    await expect(page.locator('[data-testid="auth-loading"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })
})