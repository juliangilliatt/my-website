// Global TypeScript type definitions

// Base types
export type ID = string

export interface BaseEntity {
  id: ID
  createdAt: Date
  updatedAt: Date
}

// Recipe types
export interface Recipe extends BaseEntity {
  title: string
  slug: string
  description: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  prepTime: number // in minutes
  cookTime: number // in minutes
  totalTime: number // in minutes
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: RecipeCategory
  cuisine: RecipeCuisine
  tags: RecipeTag[]
  images: RecipeImage[]
  nutrition?: NutritionInfo
  notes?: string
  source?: string
  rating?: number
  ratingCount?: number
  featured: boolean
  published: boolean
  authorId: ID
}

export interface Ingredient {
  id: ID
  name: string
  amount: number
  unit: string
  notes?: string
  optional?: boolean
}

export interface Instruction {
  id: ID
  step: number
  description: string
  duration?: number // in minutes
  temperature?: number // in degrees
  notes?: string
}

export interface RecipeImage {
  id: ID
  url: string
  alt: string
  caption?: string
  isPrimary: boolean
}

export interface NutritionInfo {
  calories?: number
  protein?: number // in grams
  carbs?: number // in grams
  fat?: number // in grams
  fiber?: number // in grams
  sugar?: number // in grams
  sodium?: number // in mg
}

export interface RecipeTag {
  id: ID
  name: string
  slug: string
  color?: string
}

export type RecipeCategory = 
  | 'appetizers'
  | 'main-course'
  | 'desserts'
  | 'beverages'
  | 'snacks'
  | 'salads'
  | 'soups'
  | 'sides'

export type RecipeCuisine = 
  | 'italian'
  | 'mexican'
  | 'indian'
  | 'chinese'
  | 'american'
  | 'french'
  | 'japanese'
  | 'mediterranean'
  | 'thai'
  | 'other'

export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'paleo'
  | 'low-carb'
  | 'high-protein'

export type CookingMethod = 
  | 'baking'
  | 'grilling'
  | 'roasting'
  | 'sauteing'
  | 'boiling'
  | 'steaming'
  | 'frying'
  | 'slow-cooking'
  | 'pressure-cooking'
  | 'no-cook'

// Blog types
export interface BlogPost extends BaseEntity {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  category: BlogCategory
  tags: BlogTag[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  publishedAt?: Date
  authorId: ID
  readingTime: number // in minutes
  views: number
  likes: number
}

export interface BlogTag {
  id: ID
  name: string
  slug: string
  color?: string
}

export type BlogCategory = 
  | 'development'
  | 'design'
  | 'cooking'
  | 'lifestyle'
  | 'tutorials'
  | 'reviews'
  | 'news'
  | 'personal'

// User types
export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  bio?: string
  website?: string
  social?: UserSocial
}

export interface UserSocial {
  twitter?: string
  github?: string
  linkedin?: string
  instagram?: string
}

// Search types
export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchQuery {
  q?: string
  category?: string
  tags?: string[]
  difficulty?: string
  cuisine?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  dietary?: DietaryRestriction[]
  method?: CookingMethod
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'popular' | 'rating' | 'title'
  order?: 'asc' | 'desc'
}

export interface BlogSearchQuery {
  q?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
  featured?: boolean
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'popular' | 'title'
  order?: 'asc' | 'desc'
}

// Form types
export interface RecipeFormData {
  title: string
  description: string
  ingredients: Omit<Ingredient, 'id'>[]
  instructions: Omit<Instruction, 'id'>[]
  prepTime: number
  cookTime: number
  servings: number
  difficulty: Recipe['difficulty']
  category: RecipeCategory
  cuisine: RecipeCuisine
  tags: string[]
  images: File[]
  notes?: string
  source?: string
  nutrition?: NutritionInfo
  featured: boolean
  published: boolean
}

export interface BlogFormData {
  title: string
  excerpt: string
  content: string
  coverImage?: File
  category: BlogCategory
  tags: string[]
  status: BlogPost['status']
  featured: boolean
  publishedAt?: Date
}

// API response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  error?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Component prop types
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends ComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface CardProps extends ComponentProps {
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export interface BadgeProps extends ComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  external?: boolean
  children?: NavigationItem[]
}

// Image types
export interface ImageData {
  url: string
  alt: string
  width?: number
  height?: number
  caption?: string
}

// File upload types
export interface FileUploadResult {
  url: string
  filename: string
  size: number
  type: string
}

// GitHub API types
export interface GitHubCommit {
  sha: string
  message: string
  author: {
    name: string
    date: string
  }
  url: string
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

// Error types
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: any
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
  fonts: {
    mono: string
    sans: string
    code: string
  }
  spacing: Record<string, string>
  breakpoints: Record<string, string>
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Generic pagination types
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Filter types
export interface FilterOption<T = string> {
  label: string
  value: T
  count?: number
  disabled?: boolean
}

export interface FilterGroup<T = string> {
  name: string
  options: FilterOption<T>[]
  multiple?: boolean
  searchable?: boolean
}

// Sort types
export interface SortOption<T = string> {
  label: string
  value: T
  direction: 'asc' | 'desc'
}

// State types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// Event types
export interface CustomEvent<T = any> {
  type: string
  payload: T
  timestamp: Date
}

// Webhook types
export interface WebhookPayload {
  type: string
  data: any
  timestamp: Date
  signature?: string
}

// Export all types
export type {
  // Re-export commonly used React types
  ComponentProps as ReactComponentProps,
} from 'react'