import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('Homepage accessibility', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('Recipes page accessibility', async ({ page }) => {
    await page.goto('/recipes')
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('Blog page accessibility', async ({ page }) => {
    await page.goto('/blog')
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('Navigation accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="main-nav"] a:first-child')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="main-nav"] a:nth-child(2)')).toBeFocused()
  })

  test('Search functionality accessibility', async ({ page }) => {
    await page.goto('/recipes')
    
    // Test search input accessibility
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toHaveAttribute('aria-label')
    
    // Test search results accessibility
    await searchInput.fill('pasta')
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    await checkA11y(page, '[data-testid="recipe-grid"]', {
      detailedReport: true
    })
  })

  test('Form accessibility', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Check form labels and inputs are properly associated
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toHaveAttribute('aria-label')
    await expect(passwordInput).toHaveAttribute('aria-label')
    
    await checkA11y(page, 'form', {
      detailedReport: true
    })
  })

  test('Color contrast', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  test('Images have alt text', async ({ page }) => {
    await page.goto('/recipes')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
    }
  })

  test('Headings structure', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'heading-order': { enabled: true }
      }
    })
  })

  test('Focus management', async ({ page }) => {
    // Test that focus is properly managed when navigating
    await page.goto('/recipes')
    
    // Click on first recipe card
    await page.locator('[data-testid="recipe-card"]').first().click()
    
    // Verify focus is on main content
    await expect(page.locator('main')).toBeFocused()
  })

  test('Screen reader compatibility', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'aria-roles': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-required-attr': { enabled: true }
      }
    })
  })
})