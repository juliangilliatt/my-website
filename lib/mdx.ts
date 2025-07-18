// Simplified MDX utilities for deployment

export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  author?: string
  tags: string[]
  featured?: boolean
  readingTime: number
  content: string
  excerpt?: string
  image?: string
  category?: string
}

export interface BlogPostMetadata {
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  author?: string
  tags: string[]
  featured?: boolean
  image?: string
  category?: string
  excerpt?: string
}

// Process MDX content (stub implementation for deployment)
export async function processMDX(content: string): Promise<string> {
  // Simple content processing without file system dependencies
  return content
}

// Get blog post by slug (stub implementation for deployment)
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Mock blog post for deployment
  return {
    slug,
    title: 'Sample Blog Post',
    description: 'This is a sample blog post for deployment testing.',
    publishedAt: '2024-01-01',
    author: 'Julian Gilliatt',
    tags: ['sample', 'blog'],
    featured: false,
    readingTime: 5,
    content: 'This is sample content for deployment testing.',
    excerpt: 'This is a sample blog post...',
  }
}

// Get all blog posts (stub implementation for deployment)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Return empty array for deployment
  return []
}

// Get blog posts metadata only (stub implementation for deployment)
export async function getBlogPostsMetadata(): Promise<(BlogPostMetadata & { slug: string })[]> {
  return []
}

// Stub implementations for deployment
export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  return []
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  return []
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  return []
}

export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  return []
}

export async function getAllTags(): Promise<string[]> {
  return []
}

export async function getAllCategories(): Promise<string[]> {
  return []
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

// Extract table of contents from content
export function extractTableOfContents(content: string): Array<{
  id: string
  title: string
  level: number
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: Array<{ id: string; title: string; level: number }> = []
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    toc.push({ id, title, level })
  }
  
  return toc
}

// Get related posts (stub implementation for deployment)
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  return []
}

// Validate blog post metadata
export function validateBlogPostMetadata(data: any): BlogPostMetadata {
  const requiredFields = ['title', 'description', 'publishedAt']
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  return {
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    author: data.author,
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    image: data.image,
    category: data.category,
    excerpt: data.excerpt,
  }
}

// Create blog post slug from title
export function createBlogSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Format date for display
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date for RSS
export function formatDateRSS(date: string): string {
  return new Date(date).toISOString()
}

// Get blog post URL
export function getBlogPostUrl(slug: string): string {
  return `/blog/${slug}`
}

// Get blog post edit URL (for admin)
export function getBlogPostEditUrl(slug: string): string {
  return `/admin/blog/${slug}/edit`
}