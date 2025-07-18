import { Recipe } from '@prisma/client'

// Time conversion utilities
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

export function formatTimeDetailed(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
}

export function parseDuration(timeString: string): number {
  // Parse strings like "1h 30m", "45m", "2h" into minutes
  const hourMatch = timeString.match(/(\d+)h/)
  const minuteMatch = timeString.match(/(\d+)m/)
  
  let totalMinutes = 0
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60
  }
  
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1])
  }
  
  return totalMinutes
}

// Recipe difficulty helpers
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-500'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-500'
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-500'
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-500'
  }
}

export function getDifficultyIcon(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return '🟢'
    case 'medium':
      return '🟡'
    case 'hard':
      return '🔴'
    default:
      return '⚪'
  }
}

// Recipe category helpers
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'appetizers': 'bg-purple-100 text-purple-800 border-purple-500',
    'main-course': 'bg-blue-100 text-blue-800 border-blue-500',
    'desserts': 'bg-pink-100 text-pink-800 border-pink-500',
    'beverages': 'bg-cyan-100 text-cyan-800 border-cyan-500',
    'breakfast': 'bg-orange-100 text-orange-800 border-orange-500',
    'lunch': 'bg-green-100 text-green-800 border-green-500',
    'dinner': 'bg-indigo-100 text-indigo-800 border-indigo-500',
    'snacks': 'bg-yellow-100 text-yellow-800 border-yellow-500',
    'side-dishes': 'bg-gray-100 text-gray-800 border-gray-500',
    'salads': 'bg-lime-100 text-lime-800 border-lime-500',
    'soups': 'bg-teal-100 text-teal-800 border-teal-500',
    'vegetarian': 'bg-emerald-100 text-emerald-800 border-emerald-500',
    'vegan': 'bg-green-100 text-green-800 border-green-500',
    'gluten-free': 'bg-amber-100 text-amber-800 border-amber-500',
  }
  
  return colors[category.toLowerCase()] || 'bg-neutral-100 text-neutral-800 border-neutral-500'
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'appetizers': '🥗',
    'main-course': '🍽️',
    'desserts': '🍰',
    'beverages': '🥤',
    'breakfast': '🥐',
    'lunch': '🥪',
    'dinner': '🍖',
    'snacks': '🍿',
    'side-dishes': '🥕',
    'salads': '🥬',
    'soups': '🍲',
    'vegetarian': '🥦',
    'vegan': '🌱',
    'gluten-free': '🌾',
  }
  
  return icons[category.toLowerCase()] || '🍴'
}

// Recipe formatting helpers
export function formatServings(servings: number): string {
  if (servings === 1) {
    return '1 serving'
  }
  return `${servings} servings`
}

export function formatIngredientAmount(amount: number, unit: string): string {
  // Handle fractional amounts
  const fractions: Record<string, string> = {
    '0.25': '¼',
    '0.33': '⅓',
    '0.5': '½',
    '0.66': '⅔',
    '0.75': '¾',
  }
  
  const amountStr = amount.toString()
  if (fractions[amountStr]) {
    return `${fractions[amountStr]} ${unit}`
  }
  
  // Handle mixed numbers (like 1.5 -> 1½)
  const whole = Math.floor(amount)
  const decimal = amount - whole
  
  if (decimal > 0 && fractions[decimal.toString()]) {
    return whole > 0 
      ? `${whole}${fractions[decimal.toString()]} ${unit}`
      : `${fractions[decimal.toString()]} ${unit}`
  }
  
  return `${amount} ${unit}`
}

export function formatRecipeDescription(description: string, maxLength: number = 150): string {
  if (description.length <= maxLength) {
    return description
  }
  
  const truncated = description.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}

// Recipe search helpers
export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/[^\w\s]/g, '')
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || searchTerm.length < 2) return text
  
  const normalizedTerm = normalizeSearchTerm(searchTerm)
  const regex = new RegExp(`(${normalizedTerm})`, 'gi')
  
  return text.replace(regex, '<mark class="bg-yellow-200 text-black px-1">$1</mark>')
}

export function getRecipeSearchWeight(recipe: Recipe, searchTerm: string): number {
  const normalizedTerm = normalizeSearchTerm(searchTerm)
  let weight = 0
  
  // Title matches get highest weight
  if (normalizeSearchTerm(recipe.title).includes(normalizedTerm)) {
    weight += 100
  }
  
  // Category matches get high weight
  if (normalizeSearchTerm(recipe.category).includes(normalizedTerm)) {
    weight += 50
  }
  
  // Description matches get medium weight
  if (normalizeSearchTerm(recipe.description).includes(normalizedTerm)) {
    weight += 25
  }
  
  // Ingredient matches get medium weight
  const ingredientsText = recipe.ingredients.join(' ')
  if (normalizeSearchTerm(ingredientsText).includes(normalizedTerm)) {
    weight += 20
  }
  
  // Instructions matches get low weight
  const instructionsText = recipe.instructions.join(' ')
  if (normalizeSearchTerm(instructionsText).includes(normalizedTerm)) {
    weight += 10
  }
  
  return weight
}

// Recipe validation helpers
export function validateRecipeData(recipe: Partial<Recipe>): string[] {
  const errors: string[] = []
  
  if (!recipe.title || recipe.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long')
  }
  
  if (!recipe.description || recipe.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long')
  }
  
  if (!recipe.ingredients || recipe.ingredients.length < 2) {
    errors.push('Recipe must have at least 2 ingredients')
  }
  
  if (!recipe.instructions || recipe.instructions.length < 2) {
    errors.push('Recipe must have at least 2 instruction steps')
  }
  
  if (!recipe.prepTime || recipe.prepTime < 1) {
    errors.push('Prep time must be at least 1 minute')
  }
  
  if (!recipe.cookTime || recipe.cookTime < 0) {
    errors.push('Cook time must be 0 or greater')
  }
  
  if (!recipe.servings || recipe.servings < 1) {
    errors.push('Recipe must serve at least 1 person')
  }
  
  if (!recipe.category || recipe.category.trim().length < 3) {
    errors.push('Category must be specified')
  }
  
  return errors
}

// Recipe analytics helpers
export function calculateRecipeScore(recipe: Recipe): number {
  let score = 0
  
  // Base score
  score += 50
  
  // Bonus for detailed instructions
  if (recipe.instructions.length > 5) score += 10
  
  // Bonus for reasonable prep time
  if (recipe.prepTime >= 15 && recipe.prepTime <= 120) score += 10
  
  // Bonus for detailed description
  if (recipe.description.length > 100) score += 5
  
  // Bonus for many ingredients (complex recipes)
  if (recipe.ingredients.length > 8) score += 5
  
  // Bonus for having nutrition info
  if (recipe.nutrition) score += 10
  
  // Bonus for having tags
  if (recipe.tags && recipe.tags.length > 0) score += 5
  
  return Math.min(score, 100)
}

export function getRecipeComplexity(recipe: Recipe): 'simple' | 'moderate' | 'complex' {
  const factors = [
    recipe.ingredients.length,
    recipe.instructions.length,
    recipe.prepTime + recipe.cookTime,
    recipe.difficulty === 'easy' ? 1 : recipe.difficulty === 'medium' ? 2 : 3
  ]
  
  const totalComplexity = factors.reduce((sum, factor) => sum + factor, 0)
  
  if (totalComplexity < 20) return 'simple'
  if (totalComplexity < 40) return 'moderate'
  return 'complex'
}

// Recipe URL helpers
export function generateRecipeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getRecipeUrl(slug: string): string {
  return `/recipes/${slug}`
}

export function getRecipeImageUrl(recipe: Recipe): string {
  if (recipe.image) {
    return recipe.image
  }
  
  // Return a placeholder image based on category
  const categoryImages: Record<string, string> = {
    'appetizers': '/images/recipe-placeholders/appetizers.jpg',
    'main-course': '/images/recipe-placeholders/main-course.jpg',
    'desserts': '/images/recipe-placeholders/desserts.jpg',
    'beverages': '/images/recipe-placeholders/beverages.jpg',
    'breakfast': '/images/recipe-placeholders/breakfast.jpg',
    'lunch': '/images/recipe-placeholders/lunch.jpg',
    'dinner': '/images/recipe-placeholders/dinner.jpg',
    'snacks': '/images/recipe-placeholders/snacks.jpg',
  }
  
  return categoryImages[recipe.category.toLowerCase()] || '/images/recipe-placeholders/default.jpg'
}

// Recipe sharing helpers
export function getRecipeShareText(recipe: Recipe): string {
  return `Check out this ${recipe.difficulty.toLowerCase()} ${recipe.category.toLowerCase()} recipe: ${recipe.title}. Ready in ${formatTime(recipe.prepTime + recipe.cookTime)}!`
}

export function getRecipeShareUrl(recipe: Recipe, baseUrl: string = ''): string {
  return `${baseUrl}/recipes/${recipe.slug}`
}

// Recipe nutrition helpers
export function calculateNutritionPerServing(recipe: Recipe): Record<string, number> | null {
  if (!recipe.nutrition) return null
  
  const nutrition = recipe.nutrition as Record<string, number>
  const perServing: Record<string, number> = {}
  
  Object.entries(nutrition).forEach(([key, value]) => {
    perServing[key] = Math.round((value / recipe.servings) * 100) / 100
  })
  
  return perServing
}

export function formatNutritionValue(value: number, unit: string): string {
  if (unit === 'g' && value < 1) {
    return `${Math.round(value * 1000)}mg`
  }
  
  if (value % 1 === 0) {
    return `${value}${unit}`
  }
  
  return `${Math.round(value * 10) / 10}${unit}`
}

// Recipe filtering helpers
export function filterRecipesByDifficulty(recipes: Recipe[], difficulty: string): Recipe[] {
  if (!difficulty || difficulty === 'all') return recipes
  return recipes.filter(recipe => recipe.difficulty.toLowerCase() === difficulty.toLowerCase())
}

export function filterRecipesByCategory(recipes: Recipe[], category: string): Recipe[] {
  if (!category || category === 'all') return recipes
  return recipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase())
}

export function filterRecipesByTime(recipes: Recipe[], maxTime: number): Recipe[] {
  if (!maxTime || maxTime === 0) return recipes
  return recipes.filter(recipe => (recipe.prepTime + recipe.cookTime) <= maxTime)
}

export function filterRecipesByServings(recipes: Recipe[], servings: number): Recipe[] {
  if (!servings || servings === 0) return recipes
  return recipes.filter(recipe => recipe.servings === servings)
}

export function sortRecipes(recipes: Recipe[], sortBy: string): Recipe[] {
  const sorted = [...recipes]
  
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'time':
      return sorted.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime))
    case 'difficulty':
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }
      return sorted.sort((a, b) => difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder])
    case 'servings':
      return sorted.sort((a, b) => a.servings - b.servings)
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    default:
      return sorted
  }
}