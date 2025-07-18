import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

// Mock data - in a real app, this would come from your database
const mockRecipes = [
  {
    slug: 'chocolate-chip-cookies',
    updatedAt: '2024-01-10T10:00:00Z',
    priority: 0.8,
  },
  {
    slug: 'beef-stew',
    updatedAt: '2024-01-08T14:30:00Z',
    priority: 0.8,
  },
  {
    slug: 'caesar-salad',
    updatedAt: '2024-01-05T16:45:00Z',
    priority: 0.7,
  },
  {
    slug: 'spaghetti-carbonara',
    updatedAt: '2024-01-03T12:20:00Z',
    priority: 0.9,
  },
]

const mockBlogPosts = [
  {
    slug: 'cooking-tips-for-beginners',
    updatedAt: '2024-01-12T09:00:00Z',
    priority: 0.7,
  },
  {
    slug: 'seasonal-ingredient-guide',
    updatedAt: '2024-01-09T11:30:00Z',
    priority: 0.8,
  },
  {
    slug: 'kitchen-equipment-essentials',
    updatedAt: '2024-01-06T14:15:00Z',
    priority: 0.6,
  },
]

const mockCategories = [
  {
    slug: 'appetizers',
    type: 'recipe',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    slug: 'main-courses',
    type: 'recipe',
    updatedAt: '2024-01-08T14:30:00Z',
  },
  {
    slug: 'desserts',
    type: 'recipe',
    updatedAt: '2024-01-05T16:45:00Z',
  },
  {
    slug: 'tips',
    type: 'blog',
    updatedAt: '2024-01-12T09:00:00Z',
  },
  {
    slug: 'guides',
    type: 'blog',
    updatedAt: '2024-01-09T11:30:00Z',
  },
]

const mockTags = [
  {
    slug: 'vegetarian',
    type: 'recipe',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    slug: 'quick-meals',
    type: 'recipe',
    updatedAt: '2024-01-08T14:30:00Z',
  },
  {
    slug: 'healthy',
    type: 'recipe',
    updatedAt: '2024-01-05T16:45:00Z',
  },
  {
    slug: 'beginner',
    type: 'blog',
    updatedAt: '2024-01-12T09:00:00Z',
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Recipe pages
  const recipePages = mockRecipes.map(recipe => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: new Date(recipe.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: recipe.priority,
  }))

  // Blog pages
  const blogPages = mockBlogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: post.priority,
  }))

  // Recipe listing pages
  const recipeListingPages = [
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  // Blog listing pages
  const blogListingPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // Category pages
  const categoryPages = mockCategories.map(category => ({
    url: `${baseUrl}/${category.type === 'recipe' ? 'recipes' : 'blog'}/category/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Tag pages
  const tagPages = mockTags.map(tag => ({
    url: `${baseUrl}/${tag.type === 'recipe' ? 'recipes' : 'blog'}/tag/${tag.slug}`,
    lastModified: new Date(tag.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Search page
  const searchPages = [
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
  ]

  // Combine all pages
  return [
    ...staticPages,
    ...recipeListingPages,
    ...blogListingPages,
    ...recipePages,
    ...blogPages,
    ...categoryPages,
    ...tagPages,
    ...searchPages,
  ]
}

// Alternative implementation for more complex scenarios
export async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url

  try {
    // In a real app, you would fetch this data from your database
    const [recipes, blogPosts, categories, tags] = await Promise.all([
      // fetchRecipes(),
      // fetchBlogPosts(),
      // fetchCategories(),
      // fetchTags(),
      Promise.resolve(mockRecipes),
      Promise.resolve(mockBlogPosts),
      Promise.resolve(mockCategories),
      Promise.resolve(mockTags),
    ])

    // Generate URLs dynamically
    const urls: MetadataRoute.Sitemap = []

    // Add static pages
    urls.push(
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date('2024-01-01'),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date('2024-01-01'),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/recipes`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.4,
      }
    )

    // Add recipe pages
    recipes.forEach(recipe => {
      urls.push({
        url: `${baseUrl}/recipes/${recipe.slug}`,
        lastModified: new Date(recipe.updatedAt),
        changeFrequency: 'weekly',
        priority: recipe.priority,
      })
    })

    // Add blog pages
    blogPosts.forEach(post => {
      urls.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly',
        priority: post.priority,
      })
    })

    // Add category pages
    categories.forEach(category => {
      urls.push({
        url: `${baseUrl}/${category.type === 'recipe' ? 'recipes' : 'blog'}/category/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // Add tag pages
    tags.forEach(tag => {
      urls.push({
        url: `${baseUrl}/${tag.type === 'recipe' ? 'recipes' : 'blog'}/tag/${tag.slug}`,
        lastModified: new Date(tag.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    })

    return urls
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return basic sitemap on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/recipes`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ]
  }
}

// Utility functions for sitemap generation
export function generateSitemapUrl(
  path: string,
  lastModified: Date | string,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
  priority: number = 0.5
): {
  url: string
  lastModified: Date
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
} {
  return {
    url: `${SITE_CONFIG.url}${path}`,
    lastModified: new Date(lastModified),
    changeFrequency,
    priority: Math.max(0.1, Math.min(1.0, priority)),
  }
}

export function calculateSitemapPriority(
  type: 'home' | 'listing' | 'content' | 'category' | 'tag' | 'search' | 'static',
  featured: boolean = false,
  recency: number = 0 // days since last update
): number {
  let basePriority = 0.5

  switch (type) {
    case 'home':
      basePriority = 1.0
      break
    case 'listing':
      basePriority = 0.8
      break
    case 'content':
      basePriority = 0.7
      break
    case 'category':
      basePriority = 0.6
      break
    case 'tag':
      basePriority = 0.5
      break
    case 'search':
      basePriority = 0.4
      break
    case 'static':
      basePriority = 0.3
      break
  }

  // Boost priority for featured content
  if (featured) {
    basePriority = Math.min(1.0, basePriority + 0.1)
  }

  // Reduce priority for old content
  if (recency > 365) {
    basePriority = Math.max(0.1, basePriority - 0.2)
  } else if (recency > 180) {
    basePriority = Math.max(0.1, basePriority - 0.1)
  }

  return Math.round(basePriority * 10) / 10
}

export function calculateChangeFrequency(
  type: 'home' | 'listing' | 'content' | 'category' | 'tag' | 'search' | 'static',
  updateFrequency: 'high' | 'medium' | 'low' = 'medium'
): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  if (type === 'home' || type === 'listing') {
    return updateFrequency === 'high' ? 'daily' : 'weekly'
  }

  if (type === 'content') {
    return updateFrequency === 'high' ? 'weekly' : 'monthly'
  }

  if (type === 'category' || type === 'tag') {
    return 'weekly'
  }

  if (type === 'search') {
    return 'daily'
  }

  if (type === 'static') {
    return updateFrequency === 'high' ? 'monthly' : 'yearly'
  }

  return 'monthly'
}

// Sitemap validation
export function validateSitemap(sitemap: MetadataRoute.Sitemap): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check sitemap size
  if (sitemap.length > 50000) {
    errors.push('Sitemap contains more than 50,000 URLs')
  }

  // Check each URL
  sitemap.forEach((entry, index) => {
    try {
      new URL(entry.url)
    } catch {
      errors.push(`Invalid URL at index ${index}: ${entry.url}`)
    }

    // Check priority range
    if (entry.priority < 0.0 || entry.priority > 1.0) {
      errors.push(`Priority out of range at index ${index}: ${entry.priority}`)
    }

    // Check last modified date
    if (entry.lastModified > new Date()) {
      warnings.push(`Future date at index ${index}: ${entry.lastModified}`)
    }
  })

  // Check for duplicate URLs
  const urls = sitemap.map(entry => entry.url)
  const uniqueUrls = new Set(urls)
  if (urls.length !== uniqueUrls.size) {
    warnings.push('Duplicate URLs found in sitemap')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Sitemap index for large sites
export function generateSitemapIndex(sitemaps: string[]): string {
  const baseUrl = SITE_CONFIG.url
  const lastModified = new Date().toISOString()

  const sitemapEntries = sitemaps.map(sitemap => `
    <sitemap>
      <loc>${baseUrl}/${sitemap}</loc>
      <lastmod>${lastModified}</lastmod>
    </sitemap>
  `).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapEntries}
  </sitemapindex>`
}

// Generate sitemap for specific content type
export async function generateContentSitemap(
  contentType: 'recipes' | 'blog' | 'categories' | 'tags',
  limit: number = 10000
): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url
  
  switch (contentType) {
    case 'recipes':
      return mockRecipes.slice(0, limit).map(recipe => ({
        url: `${baseUrl}/recipes/${recipe.slug}`,
        lastModified: new Date(recipe.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: recipe.priority,
      }))
      
    case 'blog':
      return mockBlogPosts.slice(0, limit).map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: post.priority,
      }))
      
    case 'categories':
      return mockCategories.slice(0, limit).map(category => ({
        url: `${baseUrl}/${category.type === 'recipe' ? 'recipes' : 'blog'}/category/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
      
    case 'tags':
      return mockTags.slice(0, limit).map(tag => ({
        url: `${baseUrl}/${tag.type === 'recipe' ? 'recipes' : 'blog'}/tag/${tag.slug}`,
        lastModified: new Date(tag.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      
    default:
      return []
  }
}