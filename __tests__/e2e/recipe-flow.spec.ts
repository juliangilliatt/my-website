import { test, expect } from '@playwright/test'

test.describe('Recipe Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
  })

  test('should allow browsing and viewing recipes', async ({ page }) => {
    // Navigate to recipes page
    await page.getByRole('link', { name: 'Recipes' }).click()
    await expect(page).toHaveURL('/recipes')
    
    // Verify recipes are displayed
    await expect(page.getByTestId('recipe-card')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Recipes')
    
    // Click on a recipe card
    await page.getByTestId('recipe-card').first().click()
    
    // Verify recipe detail page
    await expect(page).toHaveURL(/\/recipes\/[^\/]+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Ingredients')).toBeVisible()
    await expect(page.getByText('Instructions')).toBeVisible()
  })

  test('should allow searching for recipes', async ({ page }) => {
    // Navigate to recipes page
    await page.getByRole('link', { name: 'Recipes' }).click()
    
    // Use the search bar
    const searchInput = page.getByPlaceholder('Search recipes...')
    await searchInput.fill('chocolate')
    await searchInput.press('Enter')
    
    // Verify search results
    await expect(page).toHaveURL('/recipes?search=chocolate')
    await expect(page.getByText('chocolate')).toBeVisible()
    
    // Verify recipe cards contain search term
    const recipeCards = page.getByTestId('recipe-card')
    await expect(recipeCards).toHaveCount({ min: 1 })
  })

  test('should allow filtering recipes by category', async ({ page }) => {
    // Navigate to recipes page
    await page.getByRole('link', { name: 'Recipes' }).click()
    
    // Click on category filter
    await page.getByText('Desserts').click()
    
    // Verify filtered results
    await expect(page).toHaveURL('/recipes?category=desserts')
    await expect(page.getByText('Desserts')).toBeVisible()
    
    // Verify recipe cards are filtered
    const recipeCards = page.getByTestId('recipe-card')
    await expect(recipeCards).toHaveCount({ min: 1 })
  })

  test('should allow saving recipes to favorites', async ({ page }) => {
    // Mock authentication
    await page.route('/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user1', email: 'test@example.com', name: 'Test User' }
        })
      })
    })
    
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Click save button
    await page.getByLabelText('Save recipe').click()
    
    // Verify save feedback
    await expect(page.getByText('Recipe saved!')).toBeVisible()
    await expect(page.getByLabelText('Recipe saved')).toBeVisible()
  })

  test('should display recipe rating and reviews', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Verify rating display
    await expect(page.getByText('4.8')).toBeVisible()
    await expect(page.getByText('(127 reviews)')).toBeVisible()
    
    // Verify star rating
    await expect(page.getByTestId('star-rating')).toBeVisible()
    
    // Scroll to reviews section
    await page.getByText('Reviews').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('review-item')).toBeVisible()
  })

  test('should allow scaling recipe servings', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Find serving adjustment controls
    const servingInput = page.getByLabelText('Servings')
    await expect(servingInput).toBeVisible()
    
    // Increase servings
    await page.getByLabelText('Increase servings').click()
    
    // Verify ingredients are scaled
    await expect(page.getByText('3 cups all-purpose flour')).toBeVisible()
    
    // Decrease servings
    await page.getByLabelText('Decrease servings').click()
    
    // Verify ingredients are scaled back
    await expect(page.getByText('2 1/4 cups all-purpose flour')).toBeVisible()
  })

  test('should allow printing recipe', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Mock print dialog
    await page.route('/recipes/chocolate-chip-cookies/print', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Print version</body></html>'
      })
    })
    
    // Click print button
    await page.getByLabelText('Print recipe').click()
    
    // Verify print page opens
    await expect(page).toHaveURL('/recipes/chocolate-chip-cookies/print')
    await expect(page.getByText('Print version')).toBeVisible()
  })

  test('should allow sharing recipe', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Click share button
    await page.getByLabelText('Share recipe').click()
    
    // Verify share modal opens
    await expect(page.getByText('Share this recipe')).toBeVisible()
    
    // Test social sharing links
    await expect(page.getByRole('link', { name: 'Share on Facebook' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Share on Twitter' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Share on Pinterest' })).toBeVisible()
    
    // Test copy link
    await page.getByText('Copy link').click()
    await expect(page.getByText('Link copied!')).toBeVisible()
  })

  test('should allow recipe cook mode', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Click cook mode button
    await page.getByText('Cook Mode').click()
    
    // Verify cook mode UI
    await expect(page.getByTestId('cook-mode')).toBeVisible()
    await expect(page.getByText('Step 1 of 9')).toBeVisible()
    
    // Navigate through steps
    await page.getByLabelText('Next step').click()
    await expect(page.getByText('Step 2 of 9')).toBeVisible()
    
    // Exit cook mode
    await page.getByLabelText('Exit cook mode').click()
    await expect(page.getByTestId('cook-mode')).not.toBeVisible()
  })

  test('should show recipe nutrition information', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Verify nutrition section
    await expect(page.getByText('Nutrition Facts')).toBeVisible()
    await expect(page.getByText('180 calories')).toBeVisible()
    await expect(page.getByText('8g fat')).toBeVisible()
    await expect(page.getByText('25g carbs')).toBeVisible()
    await expect(page.getByText('2g protein')).toBeVisible()
  })

  test('should display related recipes', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Scroll to related recipes section
    await page.getByText('Related Recipes').scrollIntoViewIfNeeded()
    
    // Verify related recipes are displayed
    await expect(page.getByText('Related Recipes')).toBeVisible()
    await expect(page.getByTestId('related-recipe-card')).toBeVisible()
    
    // Click on a related recipe
    await page.getByTestId('related-recipe-card').first().click()
    
    // Verify navigation to related recipe
    await expect(page).toHaveURL(/\/recipes\/[^\/]+/)
  })

  test('should handle recipe not found', async ({ page }) => {
    // Navigate to non-existent recipe
    await page.goto('/recipes/non-existent-recipe')
    
    // Verify 404 page
    await expect(page.getByText('Recipe not found')).toBeVisible()
    await expect(page.getByText('The recipe you\'re looking for doesn\'t exist')).toBeVisible()
    
    // Verify back to recipes link
    await page.getByText('Back to Recipes').click()
    await expect(page).toHaveURL('/recipes')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to recipes page
    await page.goto('/recipes')
    
    // Verify mobile layout
    await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible()
    await expect(page.getByTestId('recipe-grid')).toBeVisible()
    
    // Test mobile navigation
    await page.getByTestId('mobile-menu-toggle').click()
    await expect(page.getByTestId('mobile-menu')).toBeVisible()
    
    // Navigate to a recipe
    await page.getByTestId('recipe-card').first().click()
    
    // Verify mobile recipe layout
    await expect(page.getByTestId('mobile-recipe-header')).toBeVisible()
    await expect(page.getByTestId('mobile-recipe-tabs')).toBeVisible()
  })

  test('should load recipe images correctly', async ({ page }) => {
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Wait for hero image to load
    const heroImage = page.getByTestId('recipe-hero-image')
    await expect(heroImage).toBeVisible()
    
    // Verify image has loaded
    await expect(heroImage).toHaveAttribute('src', /.*\.(jpg|jpeg|png|webp)/)
    
    // Verify step images if present
    const stepImages = page.getByTestId('step-image')
    if (await stepImages.count() > 0) {
      await expect(stepImages.first()).toBeVisible()
    }
  })

  test('should handle recipe comments', async ({ page }) => {
    // Mock authentication
    await page.route('/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user1', email: 'test@example.com', name: 'Test User' }
        })
      })
    })
    
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Scroll to comments section
    await page.getByText('Comments').scrollIntoViewIfNeeded()
    
    // Add a comment
    await page.getByPlaceholder('Add a comment...').fill('Great recipe!')
    await page.getByText('Post Comment').click()
    
    // Verify comment was added
    await expect(page.getByText('Great recipe!')).toBeVisible()
    await expect(page.getByText('Test User')).toBeVisible()
  })

  test('should handle recipe rating submission', async ({ page }) => {
    // Mock authentication
    await page.route('/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user1', email: 'test@example.com', name: 'Test User' }
        })
      })
    })
    
    // Navigate to a recipe
    await page.goto('/recipes/chocolate-chip-cookies')
    
    // Click on rating stars
    await page.getByTestId('rating-star-5').click()
    
    // Verify rating feedback
    await expect(page.getByText('Thank you for your rating!')).toBeVisible()
    
    // Verify rating is updated
    await expect(page.getByTestId('user-rating')).toHaveAttribute('data-rating', '5')
  })
})