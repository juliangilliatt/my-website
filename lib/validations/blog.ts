import { z } from 'zod'
import { BLOG_CONFIG, VALIDATION } from '@/lib/constants'

// Blog post schema
export const blogPostSchema = z.object({
  title: z.string()
    .min(VALIDATION.blog.titleMinLength, `Title must be at least ${VALIDATION.blog.titleMinLength} characters`)
    .max(VALIDATION.blog.titleMaxLength, `Title must be less than ${VALIDATION.blog.titleMaxLength} characters`)
    .trim(),
  
  excerpt: z.string()
    .min(VALIDATION.blog.excerptMinLength, `Excerpt must be at least ${VALIDATION.blog.excerptMinLength} characters`)
    .max(VALIDATION.blog.excerptMaxLength, `Excerpt must be less than ${VALIDATION.blog.excerptMaxLength} characters`)
    .trim(),
  
  content: z.string()
    .min(VALIDATION.blog.contentMinLength, `Content must be at least ${VALIDATION.blog.contentMinLength} characters`)
    .max(VALIDATION.blog.contentMaxLength, `Content must be less than ${VALIDATION.blog.contentMaxLength} characters`)
    .trim(),
  
  coverImage: z.string()
    .url('Invalid cover image URL')
    .optional(),
  
  category: z.enum(BLOG_CONFIG.categories, {
    required_error: 'Category is required',
    invalid_type_error: 'Invalid category',
  }),
  
  tags: z.array(z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'))
    .max(VALIDATION.blog.maxTags, `Maximum ${VALIDATION.blog.maxTags} tags allowed`)
    .default([]),
  
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  
  featured: z.boolean().default(false),
  
  publishedAt: z.date().optional(),
})

// Blog post update schema (all fields optional except where needed)
export const blogPostUpdateSchema = z.object({
  title: z.string()
    .min(VALIDATION.blog.titleMinLength, `Title must be at least ${VALIDATION.blog.titleMinLength} characters`)
    .max(VALIDATION.blog.titleMaxLength, `Title must be less than ${VALIDATION.blog.titleMaxLength} characters`)
    .trim()
    .optional(),
  
  excerpt: z.string()
    .min(VALIDATION.blog.excerptMinLength, `Excerpt must be at least ${VALIDATION.blog.excerptMinLength} characters`)
    .max(VALIDATION.blog.excerptMaxLength, `Excerpt must be less than ${VALIDATION.blog.excerptMaxLength} characters`)
    .trim()
    .optional(),
  
  content: z.string()
    .min(VALIDATION.blog.contentMinLength, `Content must be at least ${VALIDATION.blog.contentMinLength} characters`)
    .max(VALIDATION.blog.contentMaxLength, `Content must be less than ${VALIDATION.blog.contentMaxLength} characters`)
    .trim()
    .optional(),
  
  coverImage: z.string()
    .url('Invalid cover image URL')
    .optional(),
  
  category: z.enum(BLOG_CONFIG.categories).optional(),
  
  tags: z.array(z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'))
    .max(VALIDATION.blog.maxTags, `Maximum ${VALIDATION.blog.maxTags} tags allowed`)
    .optional(),
  
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  
  featured: z.boolean().optional(),
  
  publishedAt: z.date().optional(),
})

// Blog post search schema
export const blogPostSearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(BLOG_CONFIG.categories).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'all']).default('published'),
  featured: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sort: z.enum(['newest', 'oldest', 'popular', 'title']).default('newest'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Blog post filter schema for UI components
export const blogPostFilterSchema = z.object({
  categories: z.array(z.enum(BLOG_CONFIG.categories)).optional(),
  tags: z.array(z.string()).optional(),
  statuses: z.array(z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])).optional(),
  featured: z.boolean().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
})

// Blog comment schema (for future implementation)
export const blogCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
  
  author: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email address'),
    website: z.string().url('Invalid website URL').optional(),
  }),
  
  parentId: z.string().optional(), // For nested comments
})

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  tags: z.array(z.string()).default([]),
  preferences: z.object({
    weekly: z.boolean().default(true),
    recipes: z.boolean().default(true),
    blog: z.boolean().default(true),
    announcements: z.boolean().default(false),
  }).default({
    weekly: true,
    recipes: true,
    blog: true,
    announcements: false,
  }),
})

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
})

// SEO metadata schema
export const seoMetadataSchema = z.object({
  title: z.string()
    .min(1, 'SEO title is required')
    .max(60, 'SEO title should be less than 60 characters for optimal display')
    .optional(),
  
  description: z.string()
    .min(120, 'SEO description should be at least 120 characters')
    .max(160, 'SEO description should be less than 160 characters for optimal display')
    .optional(),
  
  keywords: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 keywords allowed')
    .optional(),
  
  ogImage: z.string().url('Invalid Open Graph image URL').optional(),
  
  canonical: z.string().url('Invalid canonical URL').optional(),
  
  noIndex: z.boolean().default(false),
  
  noFollow: z.boolean().default(false),
})

// Blog slug schema
export const blogSlugSchema = z.object({
  slug: z.string()
    .min(VALIDATION.blog.slugMinLength, `Slug must be at least ${VALIDATION.blog.slugMinLength} characters`)
    .max(VALIDATION.blog.slugMaxLength, `Slug must be less than ${VALIDATION.blog.slugMaxLength} characters`)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .trim(),
})

// Blog import schema (for importing from external sources)
export const blogImportSchema = z.object({
  url: z.string().url('Invalid URL'),
  source: z.string().max(200, 'Source must be less than 200 characters').optional(),
  extractImages: z.boolean().default(true),
  extractTags: z.boolean().default(true),
})

// Blog analytics schema
export const blogAnalyticsSchema = z.object({
  postId: z.string(),
  event: z.enum(['view', 'like', 'share', 'comment']),
  metadata: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    referrer: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    device: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }).optional(),
})

// Blog RSS feed schema
export const blogRssFeedSchema = z.object({
  title: z.string().min(1, 'Feed title is required'),
  description: z.string().min(1, 'Feed description is required'),
  link: z.string().url('Invalid feed URL'),
  language: z.string().default('en-US'),
  copyright: z.string().optional(),
  managingEditor: z.string().email().optional(),
  webMaster: z.string().email().optional(),
  category: z.enum(BLOG_CONFIG.categories).optional(),
  limit: z.number().min(1).max(50).default(20),
})

// Blog sitemap schema
export const blogSitemapSchema = z.object({
  changefreq: z.enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).default('weekly'),
  priority: z.number().min(0).max(1).default(0.8),
  lastmod: z.date().optional(),
  includeImages: z.boolean().default(true),
})

// Type exports
export type BlogPostInput = z.infer<typeof blogPostSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>
export type BlogPostSearchInput = z.infer<typeof blogPostSearchSchema>
export type BlogPostFilterInput = z.infer<typeof blogPostFilterSchema>
export type BlogCommentInput = z.infer<typeof blogCommentSchema>
export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type SeoMetadataInput = z.infer<typeof seoMetadataSchema>
export type BlogSlugInput = z.infer<typeof blogSlugSchema>
export type BlogImportInput = z.infer<typeof blogImportSchema>
export type BlogAnalyticsInput = z.infer<typeof blogAnalyticsSchema>
export type BlogRssFeedInput = z.infer<typeof blogRssFeedSchema>
export type BlogSitemapInput = z.infer<typeof blogSitemapSchema>