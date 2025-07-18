/**
 * Utility functions for generating and validating URL slugs
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The input text to slugify
 * @param options - Configuration options
 * @returns A URL-friendly slug
 */
export function slugify(
  text: string,
  options: {
    replacement?: string
    remove?: RegExp
    lower?: boolean
    strict?: boolean
    trim?: boolean
  } = {}
): string {
  const defaults = {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: false,
    trim: true,
  }

  const opts = { ...defaults, ...options }

  if (!text || typeof text !== 'string') {
    return ''
  }

  let result = text

  // Trim whitespace if requested
  if (opts.trim) {
    result = result.trim()
  }

  // Convert to lowercase if requested
  if (opts.lower) {
    result = result.toLowerCase()
  }

  // Remove specific characters if pattern provided
  if (opts.remove) {
    result = result.replace(opts.remove, '')
  }

  // Replace common accented characters with their ASCII equivalents
  result = result
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[æ]/g, 'ae')
    .replace(/[ç]/g, 'c')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[ñ]/g, 'n')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ù]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ß]/g, 'ss')

  if (opts.strict) {
    // Strict mode: only allow alphanumeric and replacement character
    result = result.replace(/[^a-z0-9]/g, opts.replacement)
  } else {
    // Normal mode: replace common special characters
    result = result
      .replace(/[^a-z0-9\s\-_]/g, '') // Remove special chars except spaces, hyphens, underscores
      .replace(/[\s_]+/g, opts.replacement) // Replace spaces and underscores with replacement
  }

  // Replace multiple consecutive replacement characters with single one
  const replacementRegex = new RegExp(`\\${opts.replacement}+`, 'g')
  result = result.replace(replacementRegex, opts.replacement)

  // Remove replacement character from start and end
  const trimRegex = new RegExp(`^\\${opts.replacement}+|\\${opts.replacement}+$`, 'g')
  result = result.replace(trimRegex, '')

  return result
}

/**
 * Generate a unique slug by appending numbers if needed
 * @param baseSlug - The base slug to make unique
 * @param checkExists - Function to check if slug exists
 * @param maxAttempts - Maximum number of attempts (default: 100)
 * @returns A unique slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 100
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (counter <= maxAttempts) {
    const exists = await checkExists(slug)
    if (!exists) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // If we've exceeded max attempts, append timestamp
  return `${baseSlug}-${Date.now()}`
}

/**
 * Validate if a string is a valid slug
 * @param slug - The slug to validate
 * @param options - Validation options
 * @returns True if valid, false otherwise
 */
export function isValidSlug(
  slug: string,
  options: {
    minLength?: number
    maxLength?: number
    allowNumbers?: boolean
    allowHyphens?: boolean
    allowUnderscores?: boolean
  } = {}
): boolean {
  const defaults = {
    minLength: 1,
    maxLength: 100,
    allowNumbers: true,
    allowHyphens: true,
    allowUnderscores: false,
  }

  const opts = { ...defaults, ...options }

  if (!slug || typeof slug !== 'string') {
    return false
  }

  // Check length
  if (slug.length < opts.minLength || slug.length > opts.maxLength) {
    return false
  }

  // Build regex pattern based on options
  let pattern = 'a-z'
  if (opts.allowNumbers) pattern += '0-9'
  if (opts.allowHyphens) pattern += '\\-'
  if (opts.allowUnderscores) pattern += '_'

  const regex = new RegExp(`^[${pattern}]+$`)
  
  // Check if slug matches pattern
  if (!regex.test(slug)) {
    return false
  }

  // Check if slug starts or ends with special characters
  if (opts.allowHyphens && (slug.startsWith('-') || slug.endsWith('-'))) {
    return false
  }

  if (opts.allowUnderscores && (slug.startsWith('_') || slug.endsWith('_'))) {
    return false
  }

  return true
}

/**
 * Extract slug from a URL path
 * @param path - The URL path
 * @returns The extracted slug
 */
export function extractSlugFromPath(path: string): string {
  if (!path || typeof path !== 'string') {
    return ''
  }

  // Remove leading/trailing slashes and split by slash
  const segments = path.replace(/^\/|\/$/g, '').split('/')
  
  // Return the last segment (which should be the slug)
  return segments[segments.length - 1] || ''
}

/**
 * Convert slug back to a readable title
 * @param slug - The slug to convert
 * @param options - Conversion options
 * @returns A readable title
 */
export function slugToTitle(
  slug: string,
  options: {
    separator?: string
    capitalize?: boolean
    titleCase?: boolean
  } = {}
): string {
  const defaults = {
    separator: '-',
    capitalize: true,
    titleCase: false,
  }

  const opts = { ...defaults, ...options }

  if (!slug || typeof slug !== 'string') {
    return ''
  }

  // Split by separator and join with spaces
  let result = slug.split(opts.separator).join(' ')

  if (opts.titleCase) {
    // Convert to title case (capitalize first letter of each word)
    result = result.replace(/\b\w/g, (char) => char.toUpperCase())
  } else if (opts.capitalize) {
    // Just capitalize the first letter
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }

  return result
}

/**
 * Generate a slug from a title with automatic deduplication
 * @param title - The title to slugify
 * @param existingSlugs - Array of existing slugs to avoid
 * @returns A unique slug
 */
export function generateSlugFromTitle(
  title: string,
  existingSlugs: string[] = []
): string {
  const baseSlug = slugify(title)
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  let slug = `${baseSlug}-${counter}`
  
  while (existingSlugs.includes(slug)) {
    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}

/**
 * Sanitize a slug by removing or replacing problematic characters
 * @param slug - The slug to sanitize
 * @param options - Sanitization options
 * @returns A sanitized slug
 */
export function sanitizeSlug(
  slug: string,
  options: {
    maxLength?: number
    removeNumbers?: boolean
    removeHyphens?: boolean
    replacement?: string
  } = {}
): string {
  const defaults = {
    maxLength: 100,
    removeNumbers: false,
    removeHyphens: false,
    replacement: '',
  }

  const opts = { ...defaults, ...options }

  if (!slug || typeof slug !== 'string') {
    return ''
  }

  let result = slug.toLowerCase().trim()

  // Remove numbers if requested
  if (opts.removeNumbers) {
    result = result.replace(/[0-9]/g, opts.replacement)
  }

  // Remove hyphens if requested
  if (opts.removeHyphens) {
    result = result.replace(/-/g, opts.replacement)
  }

  // Clean up multiple replacements
  if (opts.replacement) {
    const replacementRegex = new RegExp(`\\${opts.replacement}+`, 'g')
    result = result.replace(replacementRegex, opts.replacement)
    
    // Remove replacement from start and end
    const trimRegex = new RegExp(`^\\${opts.replacement}+|\\${opts.replacement}+$`, 'g')
    result = result.replace(trimRegex, '')
  }

  // Truncate if too long
  if (result.length > opts.maxLength) {
    result = result.substring(0, opts.maxLength)
    
    // Try to break at word boundary
    const lastHyphen = result.lastIndexOf('-')
    if (lastHyphen > opts.maxLength * 0.7) {
      result = result.substring(0, lastHyphen)
    }
  }

  return result
}

/**
 * Check if a slug contains reserved words or patterns
 * @param slug - The slug to check
 * @param reservedWords - Array of reserved words (default includes common ones)
 * @returns True if slug contains reserved words
 */
export function hasReservedWords(
  slug: string,
  reservedWords: string[] = [
    'admin',
    'api',
    'www',
    'mail',
    'ftp',
    'localhost',
    'root',
    'null',
    'undefined',
    'true',
    'false',
    'new',
    'edit',
    'create',
    'delete',
    'update',
    'index',
    'home',
    'about',
    'contact',
    'search',
    'login',
    'logout',
    'register',
    'signup',
    'signin',
    'dashboard',
    'profile',
    'settings',
    'help',
    'support',
    'privacy',
    'terms',
    'legal',
    'sitemap',
    'robots',
    'favicon',
  ]
): boolean {
  if (!slug || typeof slug !== 'string') {
    return false
  }

  const lowerSlug = slug.toLowerCase()
  return reservedWords.some(word => lowerSlug === word || lowerSlug.startsWith(`${word}-`))
}

/**
 * Generate SEO-friendly slug with additional optimizations
 * @param text - The input text
 * @param options - SEO optimization options
 * @returns An SEO-optimized slug
 */
export function generateSeoSlug(
  text: string,
  options: {
    maxLength?: number
    removeStopWords?: boolean
    preserveNumbers?: boolean
    includeYear?: boolean
  } = {}
): string {
  const defaults = {
    maxLength: 60,
    removeStopWords: true,
    preserveNumbers: true,
    includeYear: false,
  }

  const opts = { ...defaults, ...options }

  if (!text || typeof text !== 'string') {
    return ''
  }

  let result = text.toLowerCase().trim()

  // Remove stop words if requested
  if (opts.removeStopWords) {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    ]
    
    const words = result.split(/\s+/)
    const filteredWords = words.filter((word, index) => {
      // Keep first and last word, and any word that's not a stop word
      return index === 0 || index === words.length - 1 || !stopWords.includes(word)
    })
    result = filteredWords.join(' ')
  }

  // Generate basic slug
  result = slugify(result)

  // Add current year if requested
  if (opts.includeYear) {
    const currentYear = new Date().getFullYear()
    result = `${result}-${currentYear}`
  }

  // Truncate if too long
  if (result.length > opts.maxLength) {
    result = result.substring(0, opts.maxLength)
    
    // Try to break at word boundary
    const lastHyphen = result.lastIndexOf('-')
    if (lastHyphen > opts.maxLength * 0.7) {
      result = result.substring(0, lastHyphen)
    }
  }

  return result
}