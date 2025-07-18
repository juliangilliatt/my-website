import { z } from 'zod'

// Base recipe validation schema
export const recipeFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  
  difficulty: z
    .enum(['easy', 'medium', 'hard'], {
      errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' })
    }),
  
  prepTime: z
    .number()
    .min(0, 'Prep time must be 0 or greater')
    .max(1440, 'Prep time must not exceed 24 hours'),
  
  cookTime: z
    .number()
    .min(0, 'Cook time must be 0 or greater')
    .max(1440, 'Cook time must not exceed 24 hours'),
  
  servings: z
    .number()
    .min(1, 'Servings must be at least 1')
    .max(100, 'Servings must not exceed 100'),
  
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty').trim())
    .min(1, 'At least one ingredient is required')
    .max(50, 'Maximum 50 ingredients allowed'),
  
  instructions: z
    .array(z.string().min(1, 'Instruction cannot be empty').trim())
    .min(1, 'At least one instruction is required')
    .max(30, 'Maximum 30 instructions allowed'),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .default([]),
  
  image: z
    .string()
    .url('Image must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  imageAlt: z
    .string()
    .max(200, 'Image alt text must not exceed 200 characters')
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  
  tips: z
    .string()
    .max(1000, 'Tips must not exceed 1000 characters')
    .optional(),
  
  nutrition: z
    .object({
      calories: z.number().min(0).max(10000).optional(),
      protein: z.number().min(0).max(1000).optional(),
      carbs: z.number().min(0).max(1000).optional(),
      fat: z.number().min(0).max(1000).optional(),
      fiber: z.number().min(0).max(1000).optional(),
      sugar: z.number().min(0).max(1000).optional(),
      sodium: z.number().min(0).max(100000).optional(),
    })
    .optional(),
  
  published: z
    .boolean()
    .default(false),
  
  featured: z
    .boolean()
    .default(false),
  
  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author must not exceed 100 characters')
    .trim(),
  
  cuisine: z
    .string()
    .max(50, 'Cuisine must not exceed 50 characters')
    .optional(),
  
  equipment: z
    .array(z.string().min(1).max(100))
    .max(20, 'Maximum 20 equipment items allowed')
    .optional()
    .default([]),
  
  source: z
    .string()
    .max(200, 'Source must not exceed 200 characters')
    .optional(),
  
  sourceUrl: z
    .string()
    .url('Source URL must be valid')
    .optional()
    .or(z.literal('')),
})

// Type inference for recipe form
export type RecipeFormData = z.infer<typeof recipeFormSchema>

// Blog post validation schema
export const blogPostFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  
  content: z
    .string()
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content must not exceed 50,000 characters'),
  
  excerpt: z
    .string()
    .max(300, 'Excerpt must not exceed 300 characters')
    .optional(),
  
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .default([]),
  
  image: z
    .string()
    .url('Image must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  imageAlt: z
    .string()
    .max(200, 'Image alt text must not exceed 200 characters')
    .optional(),
  
  published: z
    .boolean()
    .default(false),
  
  featured: z
    .boolean()
    .default(false),
  
  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author must not exceed 100 characters')
    .trim(),
  
  publishedAt: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  
  seoTitle: z
    .string()
    .max(60, 'SEO title must not exceed 60 characters')
    .optional(),
  
  seoDescription: z
    .string()
    .max(160, 'SEO description must not exceed 160 characters')
    .optional(),
  
  readingTime: z
    .number()
    .min(1)
    .max(180)
    .optional(),
})

// Type inference for blog post form
export type BlogPostFormData = z.infer<typeof blogPostFormSchema>

// Image upload validation schema
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      'File size must be less than 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
  
  alt: z
    .string()
    .min(1, 'Alt text is required')
    .max(200, 'Alt text must not exceed 200 characters')
    .trim(),
  
  caption: z
    .string()
    .max(300, 'Caption must not exceed 300 characters')
    .optional(),
})

// Type inference for image upload
export type ImageUploadData = z.infer<typeof imageUploadSchema>

// User management validation schema
export const userFormSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),
  
  role: z
    .enum(['super_admin', 'admin', 'moderator', 'editor', 'user'], {
      errorMap: () => ({ message: 'Invalid role selected' })
    }),
  
  active: z
    .boolean()
    .default(true),
  
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
})

// Type inference for user form
export type UserFormData = z.infer<typeof userFormSchema>

// Settings validation schema
export const settingsFormSchema = z.object({
  siteName: z
    .string()
    .min(1, 'Site name is required')
    .max(100, 'Site name must not exceed 100 characters')
    .trim(),
  
  siteDescription: z
    .string()
    .min(1, 'Site description is required')
    .max(500, 'Site description must not exceed 500 characters')
    .trim(),
  
  siteUrl: z
    .string()
    .url('Site URL must be valid')
    .min(1, 'Site URL is required'),
  
  contactEmail: z
    .string()
    .email('Invalid email address')
    .min(1, 'Contact email is required'),
  
  socialLinks: z
    .object({
      twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
      facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
      instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
      youtube: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
      linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
      github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    })
    .optional(),
  
  seoSettings: z
    .object({
      defaultTitle: z.string().max(60).optional(),
      defaultDescription: z.string().max(160).optional(),
      keywords: z.array(z.string()).max(50).optional(),
      ogImage: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
  
  features: z
    .object({
      enableComments: z.boolean().default(true),
      enableRatings: z.boolean().default(true),
      enableNewsletter: z.boolean().default(false),
      enableSearch: z.boolean().default(true),
      enableAnalytics: z.boolean().default(true),
    })
    .optional(),
})

// Type inference for settings form
export type SettingsFormData = z.infer<typeof settingsFormSchema>

// Category validation schema
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must not exceed 50 characters')
    .trim(),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  
  description: z
    .string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),
  
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
    .optional(),
  
  icon: z
    .string()
    .max(50, 'Icon must not exceed 50 characters')
    .optional(),
  
  parent: z
    .string()
    .optional(),
  
  featured: z
    .boolean()
    .default(false),
  
  active: z
    .boolean()
    .default(true),
})

// Type inference for category form
export type CategoryFormData = z.infer<typeof categoryFormSchema>

// Tag validation schema
export const tagFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(30, 'Tag name must not exceed 30 characters')
    .trim(),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(30, 'Slug must not exceed 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  
  description: z
    .string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),
  
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
    .optional(),
})

// Type inference for tag form
export type TagFormData = z.infer<typeof tagFormSchema>

// Bulk operations validation schema
export const bulkOperationSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'delete', 'archive', 'feature', 'unfeature']),
  ids: z.array(z.string()).min(1, 'At least one item must be selected'),
  confirm: z.boolean().refine(val => val === true, 'Please confirm this action'),
})

// Type inference for bulk operations
export type BulkOperationData = z.infer<typeof bulkOperationSchema>

// Form field validation helpers
export const fieldValidators = {
  // Validate slug format
  slug: (value: string) => {
    const slugRegex = /^[a-z0-9-]+$/
    return slugRegex.test(value)
  },
  
  // Validate URL format
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  
  // Validate email format
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  
  // Validate hex color format
  hexColor: (value: string) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(value)
  },
  
  // Validate image file
  imageFile: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize
  },
  
  // Validate time format (HH:MM)
  timeFormat: (value: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(value)
  },
  
  // Validate phone number format
  phoneNumber: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s/g, ''))
  },
}

// Common validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must not exceed ${max} characters`,
  numeric: 'Must be a number',
  positive: 'Must be a positive number',
  integer: 'Must be a whole number',
  slug: 'Must contain only lowercase letters, numbers, and hyphens',
  hexColor: 'Must be a valid hex color (e.g., #FF0000)',
  imageFile: 'Must be a JPEG, PNG, or WebP image under 5MB',
  dateFormat: 'Must be a valid date',
  timeFormat: 'Must be in HH:MM format',
  phoneNumber: 'Must be a valid phone number',
}

// Validation error formatter
export function formatValidationError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formattedErrors[path] = err.message
  })
  
  return formattedErrors
}

// Validation success type
export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  errors: Record<string, string>
}

// Generic validation function
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatValidationError(error),
      }
    }
    return {
      success: false,
      errors: { general: 'Validation failed' },
    }
  }
}

// Async validation function (for server-side validation)
export async function validateFormAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validatedData = await schema.parseAsync(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatValidationError(error),
      }
    }
    return {
      success: false,
      errors: { general: 'Validation failed' },
    }
  }
}