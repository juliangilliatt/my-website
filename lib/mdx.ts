import { compile } from '@mdx-js/mdx'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

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

// MDX processing configuration
const mdxOptions = {
  remarkPlugins: [
    remarkGfm,
    remarkMath,
  ],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'wrap',
        properties: {
          className: ['heading-link'],
        },
      },
    ],
    [
      rehypeHighlight,
      {
        languages: {
          javascript: 'js',
          typescript: 'ts',
          jsx: 'jsx',
          tsx: 'tsx',
          python: 'py',
          bash: 'bash',
          json: 'json',
          css: 'css',
          html: 'html',
        },
      },
    ],
    rehypeKatex,
  ],
}

// Process MDX content
export async function processMDX(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['heading-link'],
      },
    })
    .use(rehypeHighlight, {
      languages: {
        javascript: 'js',
        typescript: 'ts',
        jsx: 'jsx',
        tsx: 'tsx',
        python: 'py',
        bash: 'bash',
        json: 'json',
        css: 'css',
        html: 'html',
      },
    })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(content)

  return result.toString()
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const postsDirectory = join(process.cwd(), 'content', 'blog')
    const fullPath = join(postsDirectory, `${slug}.mdx`)
    const fileContents = readFileSync(fullPath, 'utf8')
    
    const { data, content } = matter(fileContents)
    const processedContent = await processMDX(content)
    
    return {
      slug,
      title: data.title,
      description: data.description,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      author: data.author,
      tags: data.tags || [],
      featured: data.featured || false,
      readingTime: calculateReadingTime(content),
      content: processedContent,
      excerpt: data.excerpt || generateExcerpt(content),
      image: data.image,
      category: data.category,
    }
  } catch (error) {
    console.error(`Error reading blog post: ${slug}`, error)
    return null
  }
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const postsDirectory = join(process.cwd(), 'content', 'blog')
    const fs = require('fs')
    
    if (!fs.existsSync(postsDirectory)) {
      return []
    }
    
    const filenames = fs.readdirSync(postsDirectory)
    const posts: BlogPost[] = []
    
    for (const filename of filenames) {
      if (filename.endsWith('.mdx')) {
        const slug = filename.replace('.mdx', '')
        const post = await getBlogPostBySlug(slug)
        if (post) {
          posts.push(post)
        }
      }
    }
    
    // Sort by published date (newest first)
    return posts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  } catch (error) {
    console.error('Error reading blog posts:', error)
    return []
  }
}

// Get blog posts metadata only (for listing pages)
export async function getBlogPostsMetadata(): Promise<(BlogPostMetadata & { slug: string })[]> {
  try {
    const postsDirectory = join(process.cwd(), 'content', 'blog')
    const fs = require('fs')
    
    if (!fs.existsSync(postsDirectory)) {
      return []
    }
    
    const filenames = fs.readdirSync(postsDirectory)
    const posts: (BlogPostMetadata & { slug: string })[] = []
    
    for (const filename of filenames) {
      if (filename.endsWith('.mdx')) {
        const slug = filename.replace('.mdx', '')
        const fullPath = join(postsDirectory, filename)
        const fileContents = readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        
        posts.push({
          slug,
          title: data.title,
          description: data.description,
          publishedAt: data.publishedAt,
          updatedAt: data.updatedAt,
          author: data.author,
          tags: data.tags || [],
          featured: data.featured || false,
          image: data.image,
          category: data.category,
          excerpt: data.excerpt || generateExcerpt(content),
        })
      }
    }
    
    // Sort by published date (newest first)
    return posts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  } catch (error) {
    console.error('Error reading blog posts metadata:', error)
    return []
  }
}

// Get featured blog posts
export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => post.featured).slice(0, 3)
}

// Get blog posts by tag
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  )
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(post => 
    post.category?.toLowerCase() === category.toLowerCase()
  )
}

// Search blog posts
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  const searchQuery = query.toLowerCase()
  
  return allPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery) ||
    post.description.toLowerCase().includes(searchQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
    post.content.toLowerCase().includes(searchQuery)
  )
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllBlogPosts()
  const tagSet = new Set<string>()
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag))
  })
  
  return Array.from(tagSet).sort()
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getAllBlogPosts()
  const categorySet = new Set<string>()
  
  allPosts.forEach(post => {
    if (post.category) {
      categorySet.add(post.category)
    }
  })
  
  return Array.from(categorySet).sort()
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

// Get related posts
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug)
  
  // Score posts based on shared tags and category
  const scoredPosts = otherPosts.map(post => {
    let score = 0
    
    // Category match
    if (post.category && currentPost.category && post.category === currentPost.category) {
      score += 3
    }
    
    // Tag matches
    const sharedTags = post.tags.filter(tag => 
      currentPost.tags.includes(tag)
    )
    score += sharedTags.length * 2
    
    return { post, score }
  })
  
  // Sort by score and return top posts
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
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