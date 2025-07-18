import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

// Base metadata interface
export interface BaseMetadata {
  title: string
  description: string
  keywords?: string[]
  author?: string
  publishedAt?: string
  updatedAt?: string
  image?: string
  imageAlt?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
}

// Recipe metadata interface
export interface RecipeMetadata extends BaseMetadata {
  prepTime?: number
  cookTime?: number
  totalTime?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  cuisine?: string
  category?: string
  tags?: string[]
  ingredients?: string[]
  instructions?: string[]
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
  }
  rating?: {
    value: number
    count: number
  }
}

// Blog post metadata interface
export interface BlogPostMetadata extends BaseMetadata {
  excerpt?: string
  readingTime?: number
  category?: string
  tags?: string[]
  series?: string
  seriesOrder?: number
}

// Page metadata interface
export interface PageMetadata extends BaseMetadata {
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

// SEO metadata generator class
export class MetadataGenerator {
  private baseUrl: string
  private siteName: string
  private defaultImage: string
  private defaultAuthor: string

  constructor(config: {
    baseUrl: string
    siteName: string
    defaultImage: string
    defaultAuthor: string
  }) {
    this.baseUrl = config.baseUrl
    this.siteName = config.siteName
    this.defaultImage = config.defaultImage
    this.defaultAuthor = config.defaultAuthor
  }

  // Generate metadata for home page
  generateHomeMetadata(): Metadata {
    const title = `${this.siteName} - Recipe Collection & Food Blog`
    const description = "Discover delicious recipes, cooking tips, and food stories. From quick weeknight dinners to elaborate weekend projects, find your next favorite dish."
    
    return {
      title,
      description,
      keywords: ['recipes', 'cooking', 'food', 'blog', 'cuisine', 'ingredients', 'healthy meals'],
      authors: [{ name: this.defaultAuthor }],
      creator: this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_US',
        url: this.baseUrl,
        siteName: this.siteName,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: `${this.siteName} - Recipe Collection & Food Blog`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [this.defaultImage],
        creator: '@yourhandle', // Replace with actual Twitter handle
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        // Add other verification codes as needed
      },
    }
  }

  // Generate metadata for recipe pages
  generateRecipeMetadata(recipe: RecipeMetadata, slug: string): Metadata {
    const title = `${recipe.title} - ${this.siteName}`
    const description = recipe.description
    const url = `${this.baseUrl}/recipes/${slug}`
    const image = recipe.image || this.defaultImage
    
    // Calculate total time
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
    
    // Generate rich description
    const richDescription = this.generateRichRecipeDescription(recipe)
    
    return {
      title,
      description: richDescription,
      keywords: [
        'recipe',
        recipe.title.toLowerCase(),
        recipe.category || 'cooking',
        recipe.cuisine || 'food',
        recipe.difficulty || 'easy',
        ...(recipe.tags || []),
        ...(recipe.keywords || []),
      ],
      authors: [{ name: recipe.author || this.defaultAuthor }],
      creator: recipe.author || this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description: richDescription,
        type: 'article',
        locale: 'en_US',
        url,
        siteName: this.siteName,
        publishedTime: recipe.publishedAt,
        modifiedTime: recipe.updatedAt,
        authors: [recipe.author || this.defaultAuthor],
        section: 'Recipes',
        tags: recipe.tags,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: recipe.imageAlt || recipe.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: richDescription,
        images: [image],
        creator: '@yourhandle',
      },
      robots: {
        index: !recipe.noindex,
        follow: !recipe.nofollow,
        googleBot: {
          index: !recipe.noindex,
          follow: !recipe.nofollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: recipe.canonical || url,
      },
    }
  }

  // Generate metadata for blog posts
  generateBlogMetadata(post: BlogPostMetadata, slug: string): Metadata {
    const title = `${post.title} - ${this.siteName}`
    const description = post.excerpt || post.description
    const url = `${this.baseUrl}/blog/${slug}`
    const image = post.image || this.defaultImage
    
    return {
      title,
      description,
      keywords: [
        'blog',
        'food blog',
        post.category || 'cooking',
        ...(post.tags || []),
        ...(post.keywords || []),
      ],
      authors: [{ name: post.author || this.defaultAuthor }],
      creator: post.author || this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description,
        type: 'article',
        locale: 'en_US',
        url,
        siteName: this.siteName,
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author || this.defaultAuthor],
        section: 'Blog',
        tags: post.tags,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: post.imageAlt || post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        creator: '@yourhandle',
      },
      robots: {
        index: !post.noindex,
        follow: !post.nofollow,
        googleBot: {
          index: !post.noindex,
          follow: !post.nofollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: post.canonical || url,
      },
    }
  }

  // Generate metadata for category pages
  generateCategoryMetadata(category: string, type: 'recipe' | 'blog'): Metadata {
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
    const title = `${categoryTitle} ${type === 'recipe' ? 'Recipes' : 'Posts'} - ${this.siteName}`
    const description = `Discover delicious ${categoryTitle.toLowerCase()} ${type === 'recipe' ? 'recipes' : 'articles'} and cooking inspiration. Browse our collection of ${categoryTitle.toLowerCase()} ${type === 'recipe' ? 'dishes' : 'content'}.`
    const url = `${this.baseUrl}/${type === 'recipe' ? 'recipes' : 'blog'}/category/${category}`
    
    return {
      title,
      description,
      keywords: [
        type === 'recipe' ? 'recipes' : 'blog',
        category,
        categoryTitle,
        'cooking',
        'food',
      ],
      authors: [{ name: this.defaultAuthor }],
      creator: this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_US',
        url,
        siteName: this.siteName,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [this.defaultImage],
        creator: '@yourhandle',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: url,
      },
    }
  }

  // Generate metadata for tag pages
  generateTagMetadata(tag: string, type: 'recipe' | 'blog'): Metadata {
    const tagTitle = tag.charAt(0).toUpperCase() + tag.slice(1)
    const title = `${tagTitle} ${type === 'recipe' ? 'Recipes' : 'Posts'} - ${this.siteName}`
    const description = `Find all ${tagTitle.toLowerCase()} ${type === 'recipe' ? 'recipes' : 'articles'} and related content. Explore our collection tagged with ${tagTitle.toLowerCase()}.`
    const url = `${this.baseUrl}/${type === 'recipe' ? 'recipes' : 'blog'}/tag/${tag}`
    
    return {
      title,
      description,
      keywords: [
        type === 'recipe' ? 'recipes' : 'blog',
        tag,
        tagTitle,
        'cooking',
        'food',
      ],
      authors: [{ name: this.defaultAuthor }],
      creator: this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_US',
        url,
        siteName: this.siteName,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [this.defaultImage],
        creator: '@yourhandle',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: url,
      },
    }
  }

  // Generate metadata for search pages
  generateSearchMetadata(query?: string): Metadata {
    const title = query 
      ? `Search Results for "${query}" - ${this.siteName}`
      : `Search Recipes & Posts - ${this.siteName}`
    const description = query
      ? `Find recipes and articles related to "${query}". Browse our search results.`
      : "Search our collection of recipes and food articles. Find exactly what you're looking for."
    const url = `${this.baseUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`
    
    return {
      title,
      description,
      keywords: [
        'search',
        'recipes',
        'blog',
        'food',
        'cooking',
        ...(query ? [query] : []),
      ],
      authors: [{ name: this.defaultAuthor }],
      creator: this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_US',
        url,
        siteName: this.siteName,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [this.defaultImage],
        creator: '@yourhandle',
      },
      robots: {
        index: false, // Don't index search pages
        follow: true,
        googleBot: {
          index: false,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: url,
      },
    }
  }

  // Generate metadata for generic pages
  generatePageMetadata(page: PageMetadata, slug: string): Metadata {
    const title = `${page.title} - ${this.siteName}`
    const description = page.description
    const url = `${this.baseUrl}/${slug}`
    const image = page.image || this.defaultImage
    
    return {
      title,
      description,
      keywords: page.keywords || ['food', 'cooking', 'recipes'],
      authors: [{ name: page.author || this.defaultAuthor }],
      creator: page.author || this.defaultAuthor,
      publisher: this.siteName,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_US',
        url,
        siteName: this.siteName,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: page.imageAlt || page.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        creator: '@yourhandle',
      },
      robots: {
        index: !page.noindex,
        follow: !page.nofollow,
        googleBot: {
          index: !page.noindex,
          follow: !page.nofollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: page.canonical || url,
      },
    }
  }

  // Helper method to generate rich recipe description
  private generateRichRecipeDescription(recipe: RecipeMetadata): string {
    const parts = [recipe.description]
    
    if (recipe.prepTime || recipe.cookTime) {
      const prepText = recipe.prepTime ? `${recipe.prepTime}min prep` : ''
      const cookText = recipe.cookTime ? `${recipe.cookTime}min cook` : ''
      const timeText = [prepText, cookText].filter(Boolean).join(', ')
      parts.push(`Time: ${timeText}`)
    }
    
    if (recipe.servings) {
      parts.push(`Serves ${recipe.servings}`)
    }
    
    if (recipe.difficulty) {
      parts.push(`Difficulty: ${recipe.difficulty}`)
    }
    
    if (recipe.cuisine) {
      parts.push(`Cuisine: ${recipe.cuisine}`)
    }
    
    return parts.join(' • ')
  }
}

// Default metadata generator instance
export const metadataGenerator = new MetadataGenerator({
  baseUrl: SITE_CONFIG.url,
  siteName: SITE_CONFIG.name,
  defaultImage: '/images/og-default.jpg',
  defaultAuthor: SITE_CONFIG.author,
})

// Utility functions for common metadata operations
export function generateBreadcrumbsMetadata(breadcrumbs: Array<{ name: string; url: string }>) {
  return breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  }))
}

export function generateKeywords(base: string[], additional: string[] = []): string[] {
  return [...new Set([...base, ...additional])]
}

export function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// SEO validation utilities
export function validateMetadata(metadata: Metadata): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check required fields
  if (!metadata.title) {
    errors.push('Title is required')
  } else if (typeof metadata.title === 'string' && metadata.title.length > 60) {
    warnings.push('Title is longer than 60 characters')
  }
  
  if (!metadata.description) {
    errors.push('Description is required')
  } else if (typeof metadata.description === 'string') {
    if (metadata.description.length > 160) {
      warnings.push('Description is longer than 160 characters')
    }
    if (metadata.description.length < 120) {
      warnings.push('Description is shorter than 120 characters')
    }
  }
  
  // Check Open Graph
  if (!metadata.openGraph) {
    warnings.push('Open Graph data is missing')
  } else {
    if (!metadata.openGraph.images || metadata.openGraph.images.length === 0) {
      warnings.push('Open Graph image is missing')
    }
  }
  
  // Check Twitter Card
  if (!metadata.twitter) {
    warnings.push('Twitter Card data is missing')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Export default metadata for common pages
export const defaultMetadata = {
  home: metadataGenerator.generateHomeMetadata(),
  about: metadataGenerator.generatePageMetadata({
    title: 'About Us',
    description: 'Learn about our passion for cooking and sharing delicious recipes with food lovers around the world.',
  }, 'about'),
  contact: metadataGenerator.generatePageMetadata({
    title: 'Contact Us',
    description: 'Get in touch with us. We love hearing from fellow food enthusiasts and answering your cooking questions.',
  }, 'contact'),
  privacy: metadataGenerator.generatePageMetadata({
    title: 'Privacy Policy',
    description: 'Our privacy policy explains how we collect, use, and protect your personal information.',
    noindex: true,
  }, 'privacy'),
  terms: metadataGenerator.generatePageMetadata({
    title: 'Terms of Service',
    description: 'Terms and conditions for using our website and services.',
    noindex: true,
  }, 'terms'),
}