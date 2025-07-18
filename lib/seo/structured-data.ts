// Schema.org structured data generation for SEO and rich snippets

import { SITE_CONFIG } from '@/lib/constants'

// Base schema interfaces
export interface Organization {
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  description?: string
  contactPoint?: ContactPoint[]
  sameAs?: string[]
}

export interface ContactPoint {
  '@type': 'ContactPoint'
  telephone?: string
  contactType: string
  email?: string
  availableLanguage?: string
}

export interface Person {
  '@type': 'Person'
  name: string
  url?: string
  image?: string
  jobTitle?: string
  worksFor?: Organization
  sameAs?: string[]
}

export interface WebSite {
  '@type': 'WebSite'
  name: string
  url: string
  description?: string
  publisher: Organization
  potentialAction?: SearchAction
}

export interface SearchAction {
  '@type': 'SearchAction'
  target: {
    '@type': 'EntryPoint'
    urlTemplate: string
  }
  'query-input': string
}

export interface Recipe {
  '@type': 'Recipe'
  name: string
  description: string
  image?: string[]
  author: Person | Organization
  datePublished?: string
  dateModified?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  recipeCategory?: string
  recipeCuisine?: string
  recipeYield?: string
  keywords?: string
  recipeIngredient: string[]
  recipeInstructions: (HowToStep | string)[]
  nutrition?: NutritionInformation
  aggregateRating?: AggregateRating
  video?: VideoObject
  url?: string
  recipeDifficulty?: string
  recipeEquipment?: string[]
  recipeSource?: string
}

export interface HowToStep {
  '@type': 'HowToStep'
  text: string
  name?: string
  image?: string
  url?: string
}

export interface NutritionInformation {
  '@type': 'NutritionInformation'
  calories?: string
  proteinContent?: string
  carbohydrateContent?: string
  fatContent?: string
  fiberContent?: string
  sugarContent?: string
  sodiumContent?: string
  servingSize?: string
}

export interface AggregateRating {
  '@type': 'AggregateRating'
  ratingValue: number
  ratingCount: number
  bestRating?: number
  worstRating?: number
}

export interface VideoObject {
  '@type': 'VideoObject'
  name: string
  description: string
  thumbnailUrl: string
  contentUrl?: string
  embedUrl?: string
  uploadDate?: string
  duration?: string
}

export interface Article {
  '@type': 'Article'
  headline: string
  description: string
  image?: string[]
  author: Person | Organization
  publisher: Organization
  datePublished?: string
  dateModified?: string
  articleSection?: string
  keywords?: string
  wordCount?: number
  url?: string
  mainEntityOfPage?: string
  articleBody?: string
}

export interface BlogPosting extends Article {
  '@type': 'BlogPosting'
  blogName?: string
  blogDescription?: string
}

export interface BreadcrumbList {
  '@type': 'BreadcrumbList'
  itemListElement: ListItem[]
}

export interface ListItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

export interface FAQPage {
  '@type': 'FAQPage'
  mainEntity: Question[]
}

export interface Question {
  '@type': 'Question'
  name: string
  acceptedAnswer: Answer
}

export interface Answer {
  '@type': 'Answer'
  text: string
}

export interface LocalBusiness {
  '@type': 'LocalBusiness'
  name: string
  description?: string
  url?: string
  telephone?: string
  address?: PostalAddress
  geo?: GeoCoordinates
  openingHours?: string[]
  priceRange?: string
  image?: string[]
  sameAs?: string[]
}

export interface PostalAddress {
  '@type': 'PostalAddress'
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates'
  latitude: number
  longitude: number
}

// Structured data generator class
export class StructuredDataGenerator {
  private baseUrl: string
  private siteName: string
  private organization: Organization

  constructor(config: {
    baseUrl: string
    siteName: string
    organization: Organization
  }) {
    this.baseUrl = config.baseUrl
    this.siteName = config.siteName
    this.organization = config.organization
  }

  // Generate organization structured data
  generateOrganization(): Organization {
    return {
      '@type': 'Organization',
      name: this.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description: 'A food blog and recipe collection featuring delicious recipes and cooking tips.',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'hello@example.com',
          availableLanguage: 'English',
        },
      ],
      sameAs: [
        'https://twitter.com/yourhandle',
        'https://facebook.com/yourpage',
        'https://instagram.com/yourhandle',
        'https://youtube.com/yourchannel',
      ],
    }
  }

  // Generate website structured data
  generateWebSite(): WebSite {
    return {
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      description: 'Discover delicious recipes and cooking inspiration.',
      publisher: this.organization,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }
  }

  // Generate recipe structured data
  generateRecipe(recipe: {
    name: string
    description: string
    image?: string
    author: string
    datePublished?: string
    dateModified?: string
    prepTime?: number
    cookTime?: number
    servings?: number
    category?: string
    cuisine?: string
    keywords?: string[]
    ingredients: string[]
    instructions: string[]
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
    difficulty?: string
    equipment?: string[]
    source?: string
    url?: string
  }): Recipe {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
    
    return {
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      image: recipe.image ? [recipe.image] : undefined,
      author: {
        '@type': 'Person',
        name: recipe.author,
      },
      datePublished: recipe.datePublished,
      dateModified: recipe.dateModified,
      prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
      cookTime: recipe.cookTime ? `PT${recipe.cookTime}M` : undefined,
      totalTime: totalTime > 0 ? `PT${totalTime}M` : undefined,
      recipeCategory: recipe.category,
      recipeCuisine: recipe.cuisine,
      recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
      keywords: recipe.keywords?.join(', '),
      recipeIngredient: recipe.ingredients,
      recipeInstructions: recipe.instructions.map((instruction, index) => ({
        '@type': 'HowToStep',
        text: instruction,
        name: `Step ${index + 1}`,
      })),
      nutrition: recipe.nutrition ? {
        '@type': 'NutritionInformation',
        calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
        proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
        carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined,
        fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
        fiberContent: recipe.nutrition.fiber ? `${recipe.nutrition.fiber}g` : undefined,
        sugarContent: recipe.nutrition.sugar ? `${recipe.nutrition.sugar}g` : undefined,
        sodiumContent: recipe.nutrition.sodium ? `${recipe.nutrition.sodium}mg` : undefined,
        servingSize: recipe.servings ? `1/${recipe.servings} of recipe` : undefined,
      } : undefined,
      aggregateRating: recipe.rating ? {
        '@type': 'AggregateRating',
        ratingValue: recipe.rating.value,
        ratingCount: recipe.rating.count,
        bestRating: 5,
        worstRating: 1,
      } : undefined,
      url: recipe.url,
      recipeDifficulty: recipe.difficulty,
      recipeEquipment: recipe.equipment,
      recipeSource: recipe.source,
    }
  }

  // Generate blog post structured data
  generateBlogPost(post: {
    headline: string
    description: string
    image?: string
    author: string
    datePublished?: string
    dateModified?: string
    category?: string
    keywords?: string[]
    url?: string
    wordCount?: number
    articleBody?: string
  }): BlogPosting {
    return {
      '@type': 'BlogPosting',
      headline: post.headline,
      description: post.description,
      image: post.image ? [post.image] : undefined,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: this.organization,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      articleSection: post.category,
      keywords: post.keywords?.join(', '),
      wordCount: post.wordCount,
      url: post.url,
      mainEntityOfPage: post.url,
      articleBody: post.articleBody,
    }
  }

  // Generate breadcrumb structured data
  generateBreadcrumbs(breadcrumbs: Array<{ name: string; url: string }>): BreadcrumbList {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    }
  }

  // Generate FAQ structured data
  generateFAQ(faqs: Array<{ question: string; answer: string }>): FAQPage {
    return {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }
  }

  // Generate local business structured data
  generateLocalBusiness(business: {
    name: string
    description?: string
    url?: string
    telephone?: string
    address?: {
      streetAddress?: string
      addressLocality?: string
      addressRegion?: string
      postalCode?: string
      addressCountry?: string
    }
    geo?: {
      latitude: number
      longitude: number
    }
    openingHours?: string[]
    priceRange?: string
    image?: string[]
    sameAs?: string[]
  }): LocalBusiness {
    return {
      '@type': 'LocalBusiness',
      name: business.name,
      description: business.description,
      url: business.url,
      telephone: business.telephone,
      address: business.address ? {
        '@type': 'PostalAddress',
        ...business.address,
      } : undefined,
      geo: business.geo ? {
        '@type': 'GeoCoordinates',
        ...business.geo,
      } : undefined,
      openingHours: business.openingHours,
      priceRange: business.priceRange,
      image: business.image,
      sameAs: business.sameAs,
    }
  }

  // Generate collection page structured data
  generateCollectionPage(collection: {
    name: string
    description: string
    url: string
    items: Array<{
      name: string
      url: string
      image?: string
      description?: string
    }>
  }) {
    return {
      '@type': 'CollectionPage',
      name: collection.name,
      description: collection.description,
      url: collection.url,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: collection.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
          image: item.image,
          description: item.description,
        })),
      },
    }
  }

  // Generate video structured data
  generateVideo(video: {
    name: string
    description: string
    thumbnailUrl: string
    contentUrl?: string
    embedUrl?: string
    uploadDate?: string
    duration?: string
  }): VideoObject {
    return {
      '@type': 'VideoObject',
      name: video.name,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      contentUrl: video.contentUrl,
      embedUrl: video.embedUrl,
      uploadDate: video.uploadDate,
      duration: video.duration,
    }
  }

  // Generate how-to structured data
  generateHowTo(howTo: {
    name: string
    description: string
    image?: string
    totalTime?: string
    estimatedCost?: string
    supply?: string[]
    tool?: string[]
    step: Array<{
      name: string
      text: string
      image?: string
      url?: string
    }>
  }) {
    return {
      '@type': 'HowTo',
      name: howTo.name,
      description: howTo.description,
      image: howTo.image,
      totalTime: howTo.totalTime,
      estimatedCost: howTo.estimatedCost,
      supply: howTo.supply?.map(supply => ({
        '@type': 'HowToSupply',
        name: supply,
      })),
      tool: howTo.tool?.map(tool => ({
        '@type': 'HowToTool',
        name: tool,
      })),
      step: howTo.step.map(step => ({
        '@type': 'HowToStep',
        name: step.name,
        text: step.text,
        image: step.image,
        url: step.url,
      })),
    }
  }
}

// Default structured data generator
export const structuredDataGenerator = new StructuredDataGenerator({
  baseUrl: SITE_CONFIG.url,
  siteName: SITE_CONFIG.name,
  organization: {
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.png`,
    description: SITE_CONFIG.description,
  },
})

// Utility functions
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `PT${minutes}M`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `PT${hours}H${remainingMinutes > 0 ? `${remainingMinutes}M` : ''}`
}

export function formatISO8601Date(date: string | Date): string {
  return new Date(date).toISOString()
}

export function validateStructuredData(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check required @type
  if (!data['@type']) {
    errors.push('Missing @type property')
  }
  
  // Validate based on type
  switch (data['@type']) {
    case 'Recipe':
      if (!data.name) errors.push('Recipe name is required')
      if (!data.recipeIngredient || data.recipeIngredient.length === 0) {
        errors.push('Recipe ingredients are required')
      }
      if (!data.recipeInstructions || data.recipeInstructions.length === 0) {
        errors.push('Recipe instructions are required')
      }
      break
      
    case 'Article':
    case 'BlogPosting':
      if (!data.headline) errors.push('Article headline is required')
      if (!data.author) errors.push('Article author is required')
      if (!data.datePublished) errors.push('Article publish date is required')
      break
      
    case 'Organization':
      if (!data.name) errors.push('Organization name is required')
      if (!data.url) errors.push('Organization URL is required')
      break
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper to generate JSON-LD script tag
export function generateJSONLD(data: any): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  })
}

// Common structured data templates
export const structuredDataTemplates = {
  website: structuredDataGenerator.generateWebSite(),
  organization: structuredDataGenerator.generateOrganization(),
  
  // Recipe categories
  recipeCategory: (category: string) => structuredDataGenerator.generateCollectionPage({
    name: `${category} Recipes`,
    description: `Discover delicious ${category.toLowerCase()} recipes and cooking inspiration.`,
    url: `${SITE_CONFIG.url}/recipes/category/${category.toLowerCase()}`,
    items: [], // Would be populated with actual recipes
  }),
  
  // Blog categories
  blogCategory: (category: string) => structuredDataGenerator.generateCollectionPage({
    name: `${category} Articles`,
    description: `Read ${category.toLowerCase()} articles and food stories.`,
    url: `${SITE_CONFIG.url}/blog/category/${category.toLowerCase()}`,
    items: [], // Would be populated with actual posts
  }),
}