// Social media card generation for Open Graph and Twitter Cards

import { SITE_CONFIG } from '@/lib/constants'

// Open Graph card types
export type OpenGraphType = 
  | 'website'
  | 'article'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_station'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other'

// Twitter Card types
export type TwitterCardType = 
  | 'summary'
  | 'summary_large_image'
  | 'app'
  | 'player'

// Base social card interface
export interface BaseSocialCard {
  title: string
  description: string
  image?: string
  imageAlt?: string
  url?: string
  siteName?: string
  locale?: string
}

// Open Graph card interface
export interface OpenGraphCard extends BaseSocialCard {
  type: OpenGraphType
  publishedTime?: string
  modifiedTime?: string
  expirationTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
  images?: Array<{
    url: string
    secureUrl?: string
    width?: number
    height?: number
    alt?: string
    type?: string
  }>
  videos?: Array<{
    url: string
    secureUrl?: string
    width?: number
    height?: number
    type?: string
  }>
  audio?: Array<{
    url: string
    secureUrl?: string
    type?: string
  }>
}

// Twitter Card interface
export interface TwitterCard extends BaseSocialCard {
  cardType: TwitterCardType
  site?: string
  siteId?: string
  creator?: string
  creatorId?: string
  app?: {
    name: {
      iphone?: string
      ipad?: string
      googleplay?: string
    }
    id: {
      iphone?: string
      ipad?: string
      googleplay?: string
    }
    url: {
      iphone?: string
      ipad?: string
      googleplay?: string
    }
  }
  player?: {
    url: string
    width?: number
    height?: number
    stream?: string
  }
}

// Recipe social card interface
export interface RecipeSocialCard extends BaseSocialCard {
  author: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  category?: string
  keywords?: string[]
  ingredients?: string[]
  rating?: {
    value: number
    count: number
  }
}

// Blog post social card interface
export interface BlogPostSocialCard extends BaseSocialCard {
  author: string
  publishedTime?: string
  modifiedTime?: string
  category?: string
  tags?: string[]
  readingTime?: number
  excerpt?: string
}

// Social card generator class
export class SocialCardGenerator {
  private baseUrl: string
  private siteName: string
  private twitterHandle: string
  private defaultImage: string
  private defaultLocale: string

  constructor(config: {
    baseUrl: string
    siteName: string
    twitterHandle: string
    defaultImage: string
    defaultLocale?: string
  }) {
    this.baseUrl = config.baseUrl
    this.siteName = config.siteName
    this.twitterHandle = config.twitterHandle
    this.defaultImage = config.defaultImage
    this.defaultLocale = config.defaultLocale || 'en_US'
  }

  // Generate Open Graph meta tags
  generateOpenGraphTags(card: OpenGraphCard): Record<string, string> {
    const tags: Record<string, string> = {
      'og:type': card.type,
      'og:title': card.title,
      'og:description': card.description,
      'og:site_name': card.siteName || this.siteName,
      'og:locale': card.locale || this.defaultLocale,
    }

    if (card.url) {
      tags['og:url'] = card.url
    }

    // Handle images
    if (card.images && card.images.length > 0) {
      card.images.forEach((image, index) => {
        const prefix = index === 0 ? 'og:image' : `og:image:${index}`
        tags[prefix] = image.url
        if (image.secureUrl) tags[`${prefix}:secure_url`] = image.secureUrl
        if (image.width) tags[`${prefix}:width`] = image.width.toString()
        if (image.height) tags[`${prefix}:height`] = image.height.toString()
        if (image.alt) tags[`${prefix}:alt`] = image.alt
        if (image.type) tags[`${prefix}:type`] = image.type
      })
    } else if (card.image) {
      tags['og:image'] = card.image
      if (card.imageAlt) tags['og:image:alt'] = card.imageAlt
    } else {
      tags['og:image'] = this.defaultImage
    }

    // Handle videos
    if (card.videos && card.videos.length > 0) {
      card.videos.forEach((video, index) => {
        const prefix = index === 0 ? 'og:video' : `og:video:${index}`
        tags[prefix] = video.url
        if (video.secureUrl) tags[`${prefix}:secure_url`] = video.secureUrl
        if (video.width) tags[`${prefix}:width`] = video.width.toString()
        if (video.height) tags[`${prefix}:height`] = video.height.toString()
        if (video.type) tags[`${prefix}:type`] = video.type
      })
    }

    // Handle audio
    if (card.audio && card.audio.length > 0) {
      card.audio.forEach((audio, index) => {
        const prefix = index === 0 ? 'og:audio' : `og:audio:${index}`
        tags[prefix] = audio.url
        if (audio.secureUrl) tags[`${prefix}:secure_url`] = audio.secureUrl
        if (audio.type) tags[`${prefix}:type`] = audio.type
      })
    }

    // Article-specific tags
    if (card.type === 'article') {
      if (card.publishedTime) tags['article:published_time'] = card.publishedTime
      if (card.modifiedTime) tags['article:modified_time'] = card.modifiedTime
      if (card.expirationTime) tags['article:expiration_time'] = card.expirationTime
      if (card.authors && card.authors.length > 0) {
        card.authors.forEach((author, index) => {
          tags[`article:author${index > 0 ? `:${index}` : ''}`] = author
        })
      }
      if (card.section) tags['article:section'] = card.section
      if (card.tags && card.tags.length > 0) {
        card.tags.forEach((tag, index) => {
          tags[`article:tag${index > 0 ? `:${index}` : ''}`] = tag
        })
      }
    }

    return tags
  }

  // Generate Twitter Card meta tags
  generateTwitterCardTags(card: TwitterCard): Record<string, string> {
    const tags: Record<string, string> = {
      'twitter:card': card.cardType,
      'twitter:title': card.title,
      'twitter:description': card.description,
    }

    if (card.site) tags['twitter:site'] = card.site
    if (card.siteId) tags['twitter:site:id'] = card.siteId
    if (card.creator) tags['twitter:creator'] = card.creator
    if (card.creatorId) tags['twitter:creator:id'] = card.creatorId

    // Handle image
    if (card.image) {
      tags['twitter:image'] = card.image
      if (card.imageAlt) tags['twitter:image:alt'] = card.imageAlt
    } else {
      tags['twitter:image'] = this.defaultImage
    }

    // Handle app card
    if (card.app) {
      if (card.app.name.iphone) tags['twitter:app:name:iphone'] = card.app.name.iphone
      if (card.app.name.ipad) tags['twitter:app:name:ipad'] = card.app.name.ipad
      if (card.app.name.googleplay) tags['twitter:app:name:googleplay'] = card.app.name.googleplay
      
      if (card.app.id.iphone) tags['twitter:app:id:iphone'] = card.app.id.iphone
      if (card.app.id.ipad) tags['twitter:app:id:ipad'] = card.app.id.ipad
      if (card.app.id.googleplay) tags['twitter:app:id:googleplay'] = card.app.id.googleplay
      
      if (card.app.url.iphone) tags['twitter:app:url:iphone'] = card.app.url.iphone
      if (card.app.url.ipad) tags['twitter:app:url:ipad'] = card.app.url.ipad
      if (card.app.url.googleplay) tags['twitter:app:url:googleplay'] = card.app.url.googleplay
    }

    // Handle player card
    if (card.player) {
      tags['twitter:player'] = card.player.url
      if (card.player.width) tags['twitter:player:width'] = card.player.width.toString()
      if (card.player.height) tags['twitter:player:height'] = card.player.height.toString()
      if (card.player.stream) tags['twitter:player:stream'] = card.player.stream
    }

    return tags
  }

  // Generate recipe social cards
  generateRecipeSocialCards(recipe: RecipeSocialCard): {
    openGraph: Record<string, string>
    twitter: Record<string, string>
  } {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
    
    // Enhanced description with recipe details
    const enhancedDescription = this.enhanceRecipeDescription(recipe)

    // Open Graph card
    const openGraphCard: OpenGraphCard = {
      type: 'article',
      title: recipe.title,
      description: enhancedDescription,
      image: recipe.image,
      imageAlt: recipe.imageAlt || recipe.title,
      url: recipe.url,
      siteName: this.siteName,
      locale: this.defaultLocale,
      authors: [recipe.author],
      section: 'Recipes',
      tags: recipe.keywords || [],
      images: recipe.image ? [{
        url: recipe.image,
        alt: recipe.imageAlt || recipe.title,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      }] : undefined,
    }

    // Twitter card
    const twitterCard: TwitterCard = {
      cardType: 'summary_large_image',
      title: recipe.title,
      description: enhancedDescription,
      image: recipe.image,
      imageAlt: recipe.imageAlt || recipe.title,
      site: this.twitterHandle,
      creator: this.twitterHandle,
    }

    return {
      openGraph: this.generateOpenGraphTags(openGraphCard),
      twitter: this.generateTwitterCardTags(twitterCard),
    }
  }

  // Generate blog post social cards
  generateBlogPostSocialCards(post: BlogPostSocialCard): {
    openGraph: Record<string, string>
    twitter: Record<string, string>
  } {
    // Enhanced description with reading time
    const enhancedDescription = this.enhanceBlogPostDescription(post)

    // Open Graph card
    const openGraphCard: OpenGraphCard = {
      type: 'article',
      title: post.title,
      description: enhancedDescription,
      image: post.image,
      imageAlt: post.imageAlt || post.title,
      url: post.url,
      siteName: this.siteName,
      locale: this.defaultLocale,
      authors: [post.author],
      section: post.category || 'Blog',
      tags: post.tags || [],
      publishedTime: post.publishedTime,
      modifiedTime: post.modifiedTime,
      images: post.image ? [{
        url: post.image,
        alt: post.imageAlt || post.title,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      }] : undefined,
    }

    // Twitter card
    const twitterCard: TwitterCard = {
      cardType: 'summary_large_image',
      title: post.title,
      description: enhancedDescription,
      image: post.image,
      imageAlt: post.imageAlt || post.title,
      site: this.twitterHandle,
      creator: this.twitterHandle,
    }

    return {
      openGraph: this.generateOpenGraphTags(openGraphCard),
      twitter: this.generateTwitterCardTags(twitterCard),
    }
  }

  // Generate website social cards
  generateWebsiteSocialCards(website: BaseSocialCard): {
    openGraph: Record<string, string>
    twitter: Record<string, string>
  } {
    // Open Graph card
    const openGraphCard: OpenGraphCard = {
      type: 'website',
      title: website.title,
      description: website.description,
      image: website.image,
      imageAlt: website.imageAlt || website.title,
      url: website.url,
      siteName: this.siteName,
      locale: this.defaultLocale,
      images: website.image ? [{
        url: website.image,
        alt: website.imageAlt || website.title,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      }] : undefined,
    }

    // Twitter card
    const twitterCard: TwitterCard = {
      cardType: 'summary_large_image',
      title: website.title,
      description: website.description,
      image: website.image,
      imageAlt: website.imageAlt || website.title,
      site: this.twitterHandle,
      creator: this.twitterHandle,
    }

    return {
      openGraph: this.generateOpenGraphTags(openGraphCard),
      twitter: this.generateTwitterCardTags(twitterCard),
    }
  }

  // Enhance recipe description with details
  private enhanceRecipeDescription(recipe: RecipeSocialCard): string {
    const parts = [recipe.description]
    
    if (recipe.prepTime || recipe.cookTime) {
      const prepText = recipe.prepTime ? `${recipe.prepTime}min prep` : ''
      const cookText = recipe.cookTime ? `${recipe.cookTime}min cook` : ''
      const timeText = [prepText, cookText].filter(Boolean).join(', ')
      parts.push(timeText)
    }
    
    if (recipe.servings) {
      parts.push(`Serves ${recipe.servings}`)
    }
    
    if (recipe.difficulty) {
      parts.push(`${recipe.difficulty} difficulty`)
    }
    
    if (recipe.cuisine) {
      parts.push(`${recipe.cuisine} cuisine`)
    }
    
    if (recipe.rating) {
      parts.push(`${recipe.rating.value}/5 stars (${recipe.rating.count} reviews)`)
    }
    
    return parts.join(' • ').substring(0, 155) + '...'
  }

  // Enhance blog post description with details
  private enhanceBlogPostDescription(post: BlogPostSocialCard): string {
    const parts = [post.description || post.excerpt || '']
    
    if (post.readingTime) {
      parts.push(`${post.readingTime} min read`)
    }
    
    if (post.category) {
      parts.push(post.category)
    }
    
    return parts.join(' • ').substring(0, 155) + '...'
  }
}

// Default social card generator
export const socialCardGenerator = new SocialCardGenerator({
  baseUrl: SITE_CONFIG.url,
  siteName: SITE_CONFIG.name,
  twitterHandle: '@yourhandle', // Replace with actual Twitter handle
  defaultImage: `${SITE_CONFIG.url}/images/og-default.jpg`,
  defaultLocale: 'en_US',
})

// Utility functions
export function generateSocialCardImage(options: {
  title: string
  description?: string
  image?: string
  type?: 'recipe' | 'blog' | 'website'
  author?: string
  category?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: string
  width?: number
  height?: number
}): string {
  const params = new URLSearchParams()
  
  params.set('title', options.title)
  if (options.description) params.set('description', options.description)
  if (options.image) params.set('image', options.image)
  if (options.type) params.set('type', options.type)
  if (options.author) params.set('author', options.author)
  if (options.category) params.set('category', options.category)
  if (options.prepTime) params.set('prepTime', options.prepTime.toString())
  if (options.cookTime) params.set('cookTime', options.cookTime.toString())
  if (options.servings) params.set('servings', options.servings.toString())
  if (options.difficulty) params.set('difficulty', options.difficulty)
  if (options.width) params.set('width', options.width.toString())
  if (options.height) params.set('height', options.height.toString())
  
  return `${SITE_CONFIG.url}/api/og?${params.toString()}`
}

export function validateSocialCard(card: OpenGraphCard | TwitterCard): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check required fields
  if (!card.title) {
    errors.push('Title is required')
  } else if (card.title.length > 60) {
    warnings.push('Title is longer than 60 characters')
  }
  
  if (!card.description) {
    errors.push('Description is required')
  } else if (card.description.length > 155) {
    warnings.push('Description is longer than 155 characters')
  }
  
  // Check image
  if (!card.image) {
    warnings.push('Image is missing')
  } else {
    try {
      new URL(card.image)
    } catch {
      errors.push('Image URL is invalid')
    }
  }
  
  // Check URL
  if (card.url) {
    try {
      new URL(card.url)
    } catch {
      errors.push('URL is invalid')
    }
  }
  
  // Type-specific validation
  if ('cardType' in card) {
    // Twitter Card validation
    if (card.cardType === 'summary_large_image' && card.image) {
      warnings.push('Large image cards should use images with 2:1 aspect ratio')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function optimizeSocialCardText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  
  // Try to break at word boundaries
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

// Social card templates
export const socialCardTemplates = {
  recipe: (recipe: RecipeSocialCard) => socialCardGenerator.generateRecipeSocialCards(recipe),
  blogPost: (post: BlogPostSocialCard) => socialCardGenerator.generateBlogPostSocialCards(post),
  website: (website: BaseSocialCard) => socialCardGenerator.generateWebsiteSocialCards(website),
}

// Common social card configurations
export const commonSocialCards = {
  home: socialCardGenerator.generateWebsiteSocialCards({
    title: `${SITE_CONFIG.name} - Recipe Collection & Food Blog`,
    description: 'Discover delicious recipes, cooking tips, and food stories. From quick weeknight dinners to elaborate weekend projects.',
    image: `${SITE_CONFIG.url}/images/og-home.jpg`,
    url: SITE_CONFIG.url,
  }),
  
  about: socialCardGenerator.generateWebsiteSocialCards({
    title: `About Us - ${SITE_CONFIG.name}`,
    description: 'Learn about our passion for cooking and sharing delicious recipes with food lovers around the world.',
    image: `${SITE_CONFIG.url}/images/og-about.jpg`,
    url: `${SITE_CONFIG.url}/about`,
  }),
  
  contact: socialCardGenerator.generateWebsiteSocialCards({
    title: `Contact Us - ${SITE_CONFIG.name}`,
    description: 'Get in touch with us. We love hearing from fellow food enthusiasts and answering your cooking questions.',
    image: `${SITE_CONFIG.url}/images/og-contact.jpg`,
    url: `${SITE_CONFIG.url}/contact`,
  }),
}