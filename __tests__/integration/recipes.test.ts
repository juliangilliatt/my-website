import { test, expect } from '@playwright/test'

test.describe('Recipes Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock recipes API
    await page.route('**/api/recipes', route => {
      const url = route.request().url()
      const searchParams = new URL(url).searchParams
      const search = searchParams.get('search')
      
      let recipes = [
        {
          id: 1,
          slug: 'pasta-carbonara',
          title: 'Pasta Carbonara',
          description: 'Classic Italian pasta dish',
          cookingTime: 20,
          difficulty: 'Medium',
          servings: 4,
          tags: ['Italian', 'Pasta', 'Quick'],
          image: '/images/pasta-carbonara.jpg'
        },
        {
          id: 2,
          slug: 'chicken-tikka-masala',
          title: 'Chicken Tikka Masala',
          description: 'Creamy Indian curry',
          cookingTime: 45,
          difficulty: 'Hard',
          servings: 6,
          tags: ['Indian', 'Curry', 'Chicken'],
          image: '/images/chicken-tikka-masala.jpg'
        },
        {
          id: 3,
          slug: 'chocolate-chip-cookies',
          title: 'Chocolate Chip Cookies',
          description: 'Classic homemade cookies',
          cookingTime: 25,
          difficulty: 'Easy',
          servings: 24,
          tags: ['Dessert', 'Cookies', 'Baking'],
          image: '/images/chocolate-chip-cookies.jpg'
        }
      ]
      
      // Filter by search if provided
      if (search) {
        recipes = recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(search.toLowerCase()) ||
          recipe.description.toLowerCase().includes(search.toLowerCase()) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        )
      }
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ recipes })
      })
    })
  })

  test('Recipes page loads with recipe cards', async ({ page }) => {
    await page.goto('/recipes')
    
    await expect(page).toHaveTitle(/Recipes/)
    await expect(page.locator('h1')).toContainText('Recipes')
    
    // Wait for recipe cards to load
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Check that recipe cards are displayed
    const recipeCards = page.locator('[data-testid="recipe-card"]')
    await expect(recipeCards).toHaveCount(3)
    
    // Check first recipe card content
    const firstCard = recipeCards.first()
    await expect(firstCard.locator('[data-testid="recipe-title"]')).toContainText('Pasta Carbonara')
    await expect(firstCard.locator('[data-testid="recipe-description"]')).toContainText('Classic Italian pasta dish')
  })

  test('Recipe search functionality works', async ({ page }) => {
    await page.goto('/recipes')
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Perform search
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('pasta')
    await page.keyboard.press('Enter')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Should show only pasta recipes
    const recipeCards = page.locator('[data-testid="recipe-card"]')
    await expect(recipeCards).toHaveCount(1)
    await expect(recipeCards.first().locator('[data-testid="recipe-title"]')).toContainText('Pasta Carbonara')
  })

  test('Recipe filters work correctly', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Test difficulty filter
    const difficultyFilter = page.locator('[data-testid="difficulty-filter"]')
    await difficultyFilter.selectOption('Easy')
    
    // Should show only easy recipes
    await page.waitForTimeout(1000)
    const recipeCards = page.locator('[data-testid="recipe-card"]')
    await expect(recipeCards).toHaveCount(1)
    await expect(recipeCards.first().locator('[data-testid="recipe-title"]')).toContainText('Chocolate Chip Cookies')
    
    // Reset filter
    await difficultyFilter.selectOption('All')
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(3)
  })

  test('Recipe tags are clickable and filter results', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Click on a tag
    const italianTag = page.locator('[data-testid="recipe-tag"]').filter({ hasText: 'Italian' })
    await italianTag.click()
    
    // Should filter to Italian recipes
    await page.waitForTimeout(1000)
    const recipeCards = page.locator('[data-testid="recipe-card"]')
    await expect(recipeCards).toHaveCount(1)
    await expect(recipeCards.first().locator('[data-testid="recipe-title"]')).toContainText('Pasta Carbonara')
  })

  test('Recipe card links work correctly', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Click on first recipe card
    const firstCard = page.locator('[data-testid="recipe-card"]').first()
    await firstCard.click()
    
    // Should navigate to recipe detail page
    await expect(page).toHaveURL(/\/recipes\/pasta-carbonara/)
  })

  test('Recipe detail page loads correctly', async ({ page }) => {
    // Mock individual recipe API
    await page.route('**/api/recipes/pasta-carbonara', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recipe: {
            id: 1,
            slug: 'pasta-carbonara',
            title: 'Pasta Carbonara',
            description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
            cookingTime: 20,
            prepTime: 10,
            difficulty: 'Medium',
            servings: 4,
            ingredients: [
              '400g spaghetti',
              '200g pancetta',
              '4 large eggs',
              '100g Pecorino Romano cheese',
              'Black pepper',
              'Salt'
            ],
            instructions: [
              'Cook spaghetti according to package instructions',
              'Cook pancetta until crispy',
              'Beat eggs with cheese and pepper',
              'Combine pasta with pancetta',
              'Add egg mixture and toss quickly',
              'Serve immediately'
            ],
            tags: ['Italian', 'Pasta', 'Quick'],
            image: '/images/pasta-carbonara.jpg'
          }
        })
      })
    })
    
    await page.goto('/recipes/pasta-carbonara')
    
    // Check recipe title and description
    await expect(page.locator('h1')).toContainText('Pasta Carbonara')
    await expect(page.locator('[data-testid="recipe-description"]')).toContainText('Classic Italian pasta dish')
    
    // Check recipe metadata
    await expect(page.locator('[data-testid="cooking-time"]')).toContainText('20')
    await expect(page.locator('[data-testid="difficulty"]')).toContainText('Medium')
    await expect(page.locator('[data-testid="servings"]')).toContainText('4')
    
    // Check ingredients list
    const ingredients = page.locator('[data-testid="ingredients"] li')
    await expect(ingredients).toHaveCount(6)
    await expect(ingredients.first()).toContainText('400g spaghetti')
    
    // Check instructions list
    const instructions = page.locator('[data-testid="instructions"] li')
    await expect(instructions).toHaveCount(6)
    await expect(instructions.first()).toContainText('Cook spaghetti according to package instructions')
  })

  test('Recipe servings scaler works', async ({ page }) => {
    await page.goto('/recipes/pasta-carbonara')
    await page.waitForSelector('[data-testid="servings-scaler"]')
    
    // Initial servings should be 4
    await expect(page.locator('[data-testid="servings-display"]')).toContainText('4')
    
    // Increase servings
    await page.locator('[data-testid="servings-increase"]').click()
    await expect(page.locator('[data-testid="servings-display"]')).toContainText('5')
    
    // Decrease servings
    await page.locator('[data-testid="servings-decrease"]').click()
    await page.locator('[data-testid="servings-decrease"]').click()
    await expect(page.locator('[data-testid="servings-display"]')).toContainText('3')
    
    // Check that ingredient quantities are scaled
    await expect(page.locator('[data-testid="ingredients"] li').first()).toContainText('300g spaghetti')
  })

  test('Recipe sharing functionality works', async ({ page }) => {
    await page.goto('/recipes/pasta-carbonara')
    
    // Check share buttons are present
    await expect(page.locator('[data-testid="share-facebook"]')).toBeVisible()
    await expect(page.locator('[data-testid="share-twitter"]')).toBeVisible()
    await expect(page.locator('[data-testid="share-pinterest"]')).toBeVisible()
    
    // Test copy link functionality
    await page.locator('[data-testid="copy-link"]').click()
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
  })

  test('Recipe print functionality works', async ({ page }) => {
    await page.goto('/recipes/pasta-carbonara')
    
    // Mock print dialog
    await page.addInitScript(() => {
      window.print = () => {
        document.body.setAttribute('data-print-called', 'true')
      }
    })
    
    await page.locator('[data-testid="print-recipe"]').click()
    
    // Check that print was called
    await expect(page.locator('body')).toHaveAttribute('data-print-called', 'true')
  })

  test('Recipe rating functionality works', async ({ page }) => {
    await page.goto('/recipes/pasta-carbonara')
    
    // Check rating stars are present
    const ratingStars = page.locator('[data-testid="rating-stars"] button')
    await expect(ratingStars).toHaveCount(5)
    
    // Click on 4th star
    await ratingStars.nth(3).click()
    
    // Check that rating is updated
    await expect(page.locator('[data-testid="rating-display"]')).toContainText('4')
  })

  test('No results message displays when search returns empty', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Search for something that doesn't exist
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('nonexistentrecipe12345')
    await page.keyboard.press('Enter')
    
    // Wait for search to complete
    await page.waitForTimeout(1000)
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText('No recipes found')
  })

  test('Recipe loading state displays correctly', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/recipes', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ recipes: [] })
        })
      }, 2000)
    })
    
    await page.goto('/recipes')
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
  })
})