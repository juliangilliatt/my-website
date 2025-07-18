import { Metadata } from 'next'
import { generateKeywords, generateMetaDescription } from '@/lib/blog-helpers'
import { SITE_CONFIG } from '@/lib/constants'

export interface BlogSEOData {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt?: string
  author?: string
  tags: string[]
  category?: string
  image?: string
  featured?: boolean
  readingTime?: number
  excerpt?: string
}

export interface BlogListingSEOData {
  title?: string
  description?: string
  category?: string
  tag?: string
  page?: number
  totalPages?: number
  postsCount?: number
}

// Generate metadata for individual blog posts
export function generateBlogPostMetadata(post: BlogSEOData): Metadata {
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`
  const keywords = generateKeywords(post)
  const description = post.excerpt || generateMetaDescription(post.description)

  return {
    title: post.title,
    description,
    keywords,
    authors: [{ name: post.author || SITE_CONFIG.name }],
    creator: post.author || SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    
    // Open Graph
    openGraph: {
      title: `${post.title} - ${SITE_CONFIG.name}`,
      description,
      type: 'article',
      url: postUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author || SITE_CONFIG.name],
      section: post.category,
      tags: post.tags,
      images: post.image ? [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        },
      ] : [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${post.title} - ${SITE_CONFIG.name}`,
          type: 'image/png',
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      creator: SITE_CONFIG.twitter ? `@${SITE_CONFIG.twitter}` : undefined,
      site: SITE_CONFIG.twitter ? `@${SITE_CONFIG.twitter}` : undefined,
      images: post.image ? [
        {
          url: post.image,
          alt: post.title,
        },
      ] : [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          alt: `${post.title} - ${SITE_CONFIG.name}`,
        },
      ],
    },
    
    // Canonical URL
    alternates: {
      canonical: postUrl,
    },
    
    // Additional metadata
    category: post.category,
    classification: post.category,
    
    // Robots
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
    
    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_SITE_VERIFICATION,
    },
  }
}

// Generate metadata for blog listing pages
export function generateBlogListingMetadata(data: BlogListingSEOData = {}): Metadata {
  const {
    title = 'Blog',
    description = 'Thoughts, tutorials, and insights about development, design, and technology.',
    category,
    tag,
    page = 1,
    totalPages = 1,
    postsCount = 0,
  } = data

  // Build dynamic title based on filters
  let pageTitle = title
  const titleParts = []
  
  if (category) {
    titleParts.push(`${category} Posts`)
  }
  
  if (tag) {
    titleParts.push(`#${tag}`)
  }
  
  if (page > 1) {
    titleParts.push(`Page ${page}`)
  }
  
  if (titleParts.length > 0) {
    pageTitle = `${titleParts.join(' • ')} - ${title}`
  }

  // Build dynamic description
  let pageDescription = description
  if (category || tag) {
    const filterDesc = []
    if (category) filterDesc.push(`in ${category}`)
    if (tag) filterDesc.push(`tagged with ${tag}`)
    pageDescription = `Browse ${postsCount} posts ${filterDesc.join(' and ')}.`
  }

  const pageUrl = buildBlogListingUrl({ category, tag, page })
  
  return {
    title: `${pageTitle} - ${SITE_CONFIG.name}`,
    description: pageDescription,
    keywords: [
      'blog',
      'articles',
      'tutorials',
      'development',
      'programming',
      'technology',
      ...(category ? [category] : []),
      ...(tag ? [tag] : []),
    ],
    
    // Open Graph
    openGraph: {
      title: `${pageTitle} - ${SITE_CONFIG.name}`,
      description: pageDescription,
      type: 'website',
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${pageTitle} - ${SITE_CONFIG.name}`,
          type: 'image/png',
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} - ${SITE_CONFIG.name}`,
      description: pageDescription,
      creator: SITE_CONFIG.twitter ? `@${SITE_CONFIG.twitter}` : undefined,
      site: SITE_CONFIG.twitter ? `@${SITE_CONFIG.twitter}` : undefined,
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          alt: `${pageTitle} - ${SITE_CONFIG.name}`,
        },
      ],
    },
    
    // Canonical URL
    alternates: {
      canonical: pageUrl,
      types: {
        'application/rss+xml': [
          {
            url: `${SITE_CONFIG.url}/blog/feed.xml`,
            title: `${SITE_CONFIG.name} Blog RSS Feed`,
          },
        ],
      },
    },
    
    // Robots
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
    
    // Additional metadata for pagination
    ...(totalPages > 1 && page > 1 && {
      other: {
        'page-number': page.toString(),
        'total-pages': totalPages.toString(),
      },
    }),
  }
}

// Generate JSON-LD structured data for blog posts
export function generateBlogPostJsonLd(post: BlogSEOData) {
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image || `${SITE_CONFIG.url}/og-image.png`,
    url: postUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author || SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    wordCount: post.description.split(' ').length,
    timeRequired: `PT${post.readingTime || 5}M`,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(post.featured && {
      isPartOf: {
        '@type': 'Blog',
        '@id': `${SITE_CONFIG.url}/blog`,
        name: `${SITE_CONFIG.name} Blog`,
      },
    }),
  }
}

// Generate JSON-LD structured data for blog listing pages
export function generateBlogListingJsonLd(posts: BlogSEOData[], data: BlogListingSEOData = {}) {
  const blogUrl = `${SITE_CONFIG.url}/blog`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': blogUrl,
    name: `${SITE_CONFIG.name} Blog`,
    description: data.description || 'Thoughts, tutorials, and insights about development, design, and technology.',
    url: blogUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: post.image || `${SITE_CONFIG.url}/og-image.png`,
      url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author || SITE_CONFIG.name,
      },
      articleSection: post.category,
      keywords: post.tags.join(', '),
    })),
    inLanguage: 'en-US',
  }
}

// Generate breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Generate FAQ JSON-LD for posts with Q&A content
export function generateFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
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

// Generate How-To JSON-LD for tutorial posts
export function generateHowToJsonLd(data: {
  name: string
  description: string
  image?: string
  totalTime?: string
  estimatedCost?: string
  supply?: string[]
  tool?: string[]
  steps: Array<{
    name: string
    text: string
    image?: string
    url?: string
  }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    image: data.image ? [data.image] : undefined,
    totalTime: data.totalTime,
    estimatedCost: data.estimatedCost,
    supply: data.supply?.map(item => ({
      '@type': 'HowToSupply',
      name: item,
    })),
    tool: data.tool?.map(item => ({
      '@type': 'HowToTool',
      name: item,
    })),
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  }
}

// Utility functions
function buildBlogListingUrl(params: {
  category?: string
  tag?: string
  page?: number
}): string {
  const { category, tag, page } = params
  const searchParams = new URLSearchParams()
  
  if (category) searchParams.set('category', category)
  if (tag) searchParams.set('tag', tag)
  if (page && page > 1) searchParams.set('page', page.toString())
  
  const queryString = searchParams.toString()
  return `${SITE_CONFIG.url}/blog${queryString ? `?${queryString}` : ''}`
}

// Generate meta tags for social sharing
export function generateSocialMetaTags(post: BlogSEOData) {
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`
  const description = post.excerpt || generateMetaDescription(post.description)
  
  return {
    // Open Graph
    'og:title': `${post.title} - ${SITE_CONFIG.name}`,
    'og:description': description,
    'og:type': 'article',
    'og:url': postUrl,
    'og:site_name': SITE_CONFIG.name,
    'og:locale': 'en_US',
    'og:image': post.image || `${SITE_CONFIG.url}/og-image.png`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': post.title,
    
    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:title': post.title,
    'twitter:description': description,
    'twitter:image': post.image || `${SITE_CONFIG.url}/og-image.png`,
    'twitter:image:alt': post.title,
    ...(SITE_CONFIG.twitter && {
      'twitter:site': `@${SITE_CONFIG.twitter}`,
      'twitter:creator': `@${SITE_CONFIG.twitter}`,
    }),
    
    // Article specific
    'article:published_time': post.publishedAt,
    'article:modified_time': post.updatedAt || post.publishedAt,
    'article:author': post.author || SITE_CONFIG.name,
    'article:section': post.category,
    'article:tag': post.tags.join(', '),
  }
}

// Generate RSS feed metadata
export function generateRSSMetadata() {
  return {
    title: `${SITE_CONFIG.name} Blog`,
    description: 'Latest blog posts from ' + SITE_CONFIG.name,
    generator: 'Next.js',
    link: `${SITE_CONFIG.url}/blog`,
    language: 'en-US',
    copyright: `© ${new Date().getFullYear()} ${SITE_CONFIG.name}`,
    managingEditor: SITE_CONFIG.email,
    webMaster: SITE_CONFIG.email,
    ttl: 60, // Cache for 1 hour
  }
}

// Generate sitemap data for blog posts
export function generateSitemapData(posts: BlogSEOData[]) {
  return posts.map(post => ({
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: post.featured ? 0.9 : 0.8,
  }))
}

// Validate SEO data
export function validateSEOData(post: BlogSEOData): {
  isValid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Title validation
  if (!post.title) {
    errors.push('Title is required')
  } else if (post.title.length < 10) {
    warnings.push('Title is too short (< 10 characters)')
  } else if (post.title.length > 60) {
    warnings.push('Title is too long (> 60 characters)')
  }

  // Description validation
  if (!post.description) {
    errors.push('Description is required')
  } else if (post.description.length < 50) {
    warnings.push('Description is too short (< 50 characters)')
  } else if (post.description.length > 160) {
    warnings.push('Description is too long (> 160 characters)')
  }

  // Slug validation
  if (!post.slug) {
    errors.push('Slug is required')
  } else if (post.slug.length > 100) {
    warnings.push('Slug is too long (> 100 characters)')
  }

  // Tags validation
  if (post.tags.length === 0) {
    warnings.push('No tags specified')
  } else if (post.tags.length > 10) {
    warnings.push('Too many tags (> 10)')
  }

  // Category validation
  if (!post.category) {
    warnings.push('No category specified')
  }

  // Image validation
  if (!post.image) {
    warnings.push('No featured image specified')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  }
}