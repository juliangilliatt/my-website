import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('Homepage visual regression', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Hide dynamic content that changes between runs
    await page.addStyleTag({
      content: `
        [data-testid="last-updated-badge"] { display: none !important; }
        [data-testid="timestamp"] { display: none !important; }
      `
    })
    
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      mask: [
        page.locator('[data-testid="last-updated-badge"]'),
        page.locator('[data-testid="timestamp"]')
      ]
    })
  })

  test('Recipes page visual regression', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')
    
    // Wait for recipe cards to load
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    await expect(page).toHaveScreenshot('recipes-page.png', {
      fullPage: true
    })
  })

  test('Blog page visual regression', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('blog-page.png', {
      fullPage: true
    })
  })

  test('Recipe card visual regression', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    const recipeCard = page.locator('[data-testid="recipe-card"]').first()
    await expect(recipeCard).toHaveScreenshot('recipe-card.png')
  })

  test('Navigation visual regression', async ({ page }) => {
    await page.goto('/')
    
    const navigation = page.locator('[data-testid="main-nav"]')
    await expect(navigation).toHaveScreenshot('navigation.png')
  })

  test('Mobile homepage visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.addStyleTag({
      content: `
        [data-testid="last-updated-badge"] { display: none !important; }
        [data-testid="timestamp"] { display: none !important; }
      `
    })
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      mask: [
        page.locator('[data-testid="last-updated-badge"]'),
        page.locator('[data-testid="timestamp"]')
      ]
    })
  })

  test('Mobile navigation visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Open mobile menu
    await page.locator('[data-testid="mobile-menu-toggle"]').click()
    
    const mobileNav = page.locator('[data-testid="mobile-nav"]')
    await expect(mobileNav).toHaveScreenshot('mobile-navigation.png')
  })

  test('Search results visual regression', async ({ page }) => {
    await page.goto('/recipes')
    
    // Perform search
    await page.locator('[data-testid="search-input"]').fill('pasta')
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    await expect(page).toHaveScreenshot('search-results.png')
  })

  test('Empty state visual regression', async ({ page }) => {
    await page.goto('/recipes')
    
    // Search for something that won't return results
    await page.locator('[data-testid="search-input"]').fill('nonexistentrecipe12345')
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="no-results"]')
    
    await expect(page).toHaveScreenshot('empty-state.png')
  })

  test('Loading state visual regression', async ({ page }) => {
    // Intercept API calls to delay them
    await page.route('/api/recipes', route => {
      setTimeout(() => route.continue(), 2000)
    })
    
    await page.goto('/recipes')
    
    // Capture loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toHaveScreenshot('loading-state.png')
  })

  test('Dark mode visual regression', async ({ page }) => {
    await page.goto('/')
    
    // Toggle dark mode if available
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]')
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click()
      await page.waitForTimeout(500) // Wait for transition
      
      await page.addStyleTag({
        content: `
          [data-testid="last-updated-badge"] { display: none !important; }
          [data-testid="timestamp"] { display: none !important; }
        `
      })
      
      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        mask: [
          page.locator('[data-testid="last-updated-badge"]'),
          page.locator('[data-testid="timestamp"]')
        ]
      })
    }
  })

  test('Form visual regression', async ({ page }) => {
    await page.goto('/sign-in')
    
    const form = page.locator('form')
    await expect(form).toHaveScreenshot('sign-in-form.png')
  })

  test('Error state visual regression', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Trigger form validation errors
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('input[type="password"]').fill('123')
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveScreenshot('form-errors.png')
  })
})