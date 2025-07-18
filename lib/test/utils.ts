// Testing utilities and helpers

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'

// Mock data for tests
export const mockRecipe = {
  id: 'test-recipe-1',
  slug: 'chocolate-chip-cookies',
  title: 'Classic Chocolate Chip Cookies',
  description: 'Perfect chewy chocolate chip cookies with crispy edges and soft centers.',
  excerpt: 'The ultimate chocolate chip cookie recipe that never fails.',
  image: '/images/recipes/chocolate-chip-cookies.jpg',
  imageAlt: 'Freshly baked chocolate chip cookies on a cooling rack',
  author: 'Chef Julia',
  prepTime: 15,
  cookTime: 12,
  totalTime: 27,
  servings: 24,
  difficulty: 'Easy',
  cuisine: 'American',
  category: 'Desserts',
  ingredients: [
    '2 1/4 cups all-purpose flour',
    '1 tsp baking soda',
    '1 tsp salt',
    '1 cup butter, softened',
    '3/4 cup granulated sugar',
    '3/4 cup packed brown sugar',
    '2 large eggs',
    '2 tsp vanilla extract',
    '2 cups chocolate chips'
  ],
  instructions: [
    'Preheat oven to 375°F (190°C).',
    'Mix flour, baking soda, and salt in a bowl.',
    'In another bowl, cream butter and both sugars until light and fluffy.',
    'Beat in eggs and vanilla.',
    'Gradually mix in flour mixture.',
    'Stir in chocolate chips.',
    'Drop rounded tablespoons of dough onto ungreased baking sheets.',
    'Bake 9-11 minutes until golden brown.',
    'Cool on baking sheet for 2 minutes before transferring to wire rack.'
  ],
  tags: ['dessert', 'cookies', 'chocolate', 'baking', 'easy'],
  keywords: ['chocolate chip cookies', 'dessert recipe', 'baking'],
  nutritionFacts: {
    calories: 180,
    protein: 2,
    carbs: 25,
    fat: 8,
    fiber: 1,
    sugar: 15
  },
  rating: {
    average: 4.8,
    count: 127
  },
  publishedAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-10T10:00:00Z',
  featured: true,
  status: 'published' as const
}

export const mockBlogPost = {
  id: 'test-blog-1',
  slug: 'cooking-tips-for-beginners',
  title: 'Essential Cooking Tips for Beginners',
  description: 'Master the basics of cooking with these essential tips that every beginner should know.',
  excerpt: 'Learn fundamental cooking techniques that will make you a better home cook.',
  content: `# Essential Cooking Tips for Beginners

Cooking can seem intimidating at first, but with these essential tips, you'll be well on your way to becoming a confident home cook.

## 1. Start with Quality Ingredients

The foundation of any great dish is quality ingredients. Fresh produce, good oils, and proper seasonings make all the difference.

## 2. Keep Your Knives Sharp

A sharp knife is not only safer but also makes cooking more enjoyable and efficient.

## 3. Taste as You Go

Don't wait until the end to taste your food. Season and adjust flavors throughout the cooking process.`,
  image: '/images/blog/cooking-tips-beginners.jpg',
  imageAlt: 'Kitchen workspace with cooking utensils and ingredients',
  author: 'Chef Julia',
  category: 'Tips & Techniques',
  tags: ['cooking tips', 'beginner', 'techniques', 'kitchen basics'],
  readingTime: 5,
  publishedAt: '2024-01-12T09:00:00Z',
  updatedAt: '2024-01-12T09:00:00Z',
  featured: true,
  status: 'published' as const
}

export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: '/images/avatars/test-user.jpg',
  bio: 'Food enthusiast and home cook',
  savedRecipes: ['test-recipe-1'],
  preferences: {
    dietary: ['vegetarian'],
    cuisine: ['italian', 'mexican'],
    difficulty: ['easy', 'medium']
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export const mockCategory = {
  id: 'test-category-1',
  slug: 'desserts',
  name: 'Desserts',
  description: 'Sweet treats and dessert recipes',
  image: '/images/categories/desserts.jpg',
  type: 'recipe' as const,
  recipeCount: 25,
  featured: true
}

export const mockTag = {
  id: 'test-tag-1',
  slug: 'chocolate',
  name: 'Chocolate',
  description: 'Recipes featuring chocolate',
  recipeCount: 15,
  type: 'recipe' as const
}

// Mock navigation data
export const mockNavigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Recipes', href: '/recipes' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ],
  footer: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Sitemap', href: '/sitemap.xml' }
  ]
}

// Mock API responses
export const mockApiResponse = {
  recipes: {
    data: [mockRecipe],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    }
  },
  blogPosts: {
    data: [mockBlogPost],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    }
  },
  categories: {
    data: [mockCategory],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    }
  },
  tags: {
    data: [mockTag],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    }
  }
}

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock Next.js router
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn()
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({})
  }))

  // Mock Next.js image component
  vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} {...props} />
    )
  }))

  // Mock Next.js link component
  vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: any) => (
      <a href={href} {...props}>{children}</a>
    )
  }))

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: []
  }))

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))

  // Mock fetch
  global.fetch = vi.fn()

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  })
}

// Custom render function
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    // Add any providers here if needed
    // wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
    ...options
  })
}

// API mocking utilities
export const mockFetch = (response: any, status = 200, ok = true) => {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response)
  })
}

export const mockFetchError = (error: string, status = 500) => {
  return vi.fn().mockRejectedValue(new Error(error))
}

// Form testing utilities
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react')
  
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      fireEvent.change(input, { target: { value } })
    }
  })
}

export const submitForm = async (form: HTMLFormElement) => {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent.submit(form)
}

// Async utilities for testing
export const waitForElement = async (selector: string, timeout = 5000) => {
  const { waitFor } = await import('@testing-library/react')
  
  return waitFor(
    () => {
      const element = document.querySelector(selector)
      if (!element) throw new Error(`Element ${selector} not found`)
      return element
    },
    { timeout }
  )
}

export const waitForText = async (text: string, timeout = 5000) => {
  const { waitFor } = await import('@testing-library/react')
  
  return waitFor(
    () => {
      const element = document.body.textContent?.includes(text)
      if (!element) throw new Error(`Text "${text}" not found`)
      return element
    },
    { timeout }
  )
}

// Performance testing utilities
export const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

export const measureAsyncOperation = async (operation: () => Promise<void>): Promise<number> => {
  const start = performance.now()
  await operation()
  const end = performance.now()
  return end - start
}

// Mock analytics
export const mockAnalytics = {
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  group: vi.fn(),
  alias: vi.fn(),
  reset: vi.fn()
}

// Test data generators
export const generateMockRecipes = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockRecipe,
    id: `test-recipe-${index + 1}`,
    slug: `test-recipe-${index + 1}`,
    title: `Test Recipe ${index + 1}`,
    description: `Test recipe description ${index + 1}`
  }))
}

export const generateMockBlogPosts = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockBlogPost,
    id: `test-blog-${index + 1}`,
    slug: `test-blog-${index + 1}`,
    title: `Test Blog Post ${index + 1}`,
    description: `Test blog post description ${index + 1}`
  }))
}

// Accessibility testing utilities
export const testAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('@axe-core/react')
  const results = await axe(container)
  return results
}

// Visual regression testing utilities
export const takeScreenshot = async (element: HTMLElement, name: string) => {
  // This would integrate with visual regression testing tools
  // For now, just return a placeholder
  return `screenshot-${name}-${Date.now()}`
}

// Error boundary for testing
export const TestErrorBoundary = ({ children, onError }: {
  children: React.ReactNode
  onError?: (error: Error) => void
}) => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  if (hasError) {
    return <div data-testid="error-boundary">Something went wrong</div>
  }

  return <>{children}</>
}

// Re-export testing library functions
export * from '@testing-library/react'
export { customRender as render }