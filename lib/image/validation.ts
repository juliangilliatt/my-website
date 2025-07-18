import { z } from 'zod'

// Image validation configuration
export interface ImageValidationConfig {
  maxFileSize: number // in bytes
  maxWidth: number
  maxHeight: number
  minWidth: number
  minHeight: number
  allowedTypes: string[]
  allowedExtensions: string[]
  maxFiles: number
  requireAspectRatio?: number // width/height ratio
  allowedAspectRatios?: number[] // array of acceptable ratios
}

// Default validation configurations
export const IMAGE_VALIDATION_CONFIGS = {
  avatar: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 512,
    maxHeight: 512,
    minWidth: 64,
    minHeight: 64,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFiles: 1,
    requireAspectRatio: 1, // square
  },
  recipe: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxWidth: 2048,
    maxHeight: 2048,
    minWidth: 300,
    minHeight: 200,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFiles: 10,
    allowedAspectRatios: [16/9, 4/3, 1/1], // landscape, standard, square
  },
  blog: {
    maxFileSize: 8 * 1024 * 1024, // 8MB
    maxWidth: 1920,
    maxHeight: 1080,
    minWidth: 400,
    minHeight: 300,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFiles: 5,
    allowedAspectRatios: [16/9, 4/3], // landscape ratios
  },
  general: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxWidth: 1200,
    maxHeight: 1200,
    minWidth: 100,
    minHeight: 100,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFiles: 5,
  },
} as const

// Validation result interface
export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    width: number
    height: number
    size: number
    type: string
    aspectRatio: number
    filename: string
  }
}

// Validate image file
export async function validateImageFile(
  file: File,
  config: ImageValidationConfig
): Promise<ImageValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic file validation
  if (!file) {
    errors.push('No file provided')
    return { isValid: false, errors, warnings }
  }

  // File size validation
  if (file.size > config.maxFileSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxFileSize)})`)
  }

  // File type validation
  if (!config.allowedTypes.includes(file.type)) {
    errors.push(`File type '${file.type}' is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`)
  }

  // File extension validation
  const extension = getFileExtension(file.name).toLowerCase()
  if (!config.allowedExtensions.includes(extension)) {
    errors.push(`File extension '${extension}' is not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`)
  }

  // Filename validation
  if (file.name.length > 255) {
    errors.push('Filename is too long (maximum 255 characters)')
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    errors.push('Filename contains invalid characters. Only letters, numbers, dots, hyphens, and underscores are allowed')
  }

  // Get image dimensions for further validation
  let metadata: ImageValidationResult['metadata']
  
  try {
    const dimensions = await getImageDimensions(file)
    const aspectRatio = dimensions.width / dimensions.height
    
    metadata = {
      width: dimensions.width,
      height: dimensions.height,
      size: file.size,
      type: file.type,
      aspectRatio,
      filename: file.name,
    }

    // Dimension validation
    if (dimensions.width > config.maxWidth) {
      errors.push(`Image width (${dimensions.width}px) exceeds maximum allowed width (${config.maxWidth}px)`)
    }

    if (dimensions.height > config.maxHeight) {
      errors.push(`Image height (${dimensions.height}px) exceeds maximum allowed height (${config.maxHeight}px)`)
    }

    if (dimensions.width < config.minWidth) {
      errors.push(`Image width (${dimensions.width}px) is below minimum required width (${config.minWidth}px)`)
    }

    if (dimensions.height < config.minHeight) {
      errors.push(`Image height (${dimensions.height}px) is below minimum required height (${config.minHeight}px)`)
    }

    // Aspect ratio validation
    if (config.requireAspectRatio) {
      const tolerance = 0.1 // 10% tolerance
      const expectedRatio = config.requireAspectRatio
      if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
        errors.push(`Image aspect ratio (${aspectRatio.toFixed(2)}) does not match required ratio (${expectedRatio.toFixed(2)})`)
      }
    }

    if (config.allowedAspectRatios) {
      const tolerance = 0.1
      const isValidRatio = config.allowedAspectRatios.some(ratio => 
        Math.abs(aspectRatio - ratio) <= tolerance
      )
      if (!isValidRatio) {
        errors.push(`Image aspect ratio (${aspectRatio.toFixed(2)}) is not one of the allowed ratios: ${config.allowedAspectRatios.map(r => r.toFixed(2)).join(', ')}`)
      }
    }

    // Performance warnings
    if (file.size > config.maxFileSize * 0.8) {
      warnings.push('Large file size may affect loading performance')
    }

    if (dimensions.width > config.maxWidth * 0.8 || dimensions.height > config.maxHeight * 0.8) {
      warnings.push('Large image dimensions may affect loading performance')
    }

  } catch (error) {
    errors.push('Failed to read image dimensions. File may be corrupted or not a valid image.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata,
  }
}

// Validate multiple image files
export async function validateImageFiles(
  files: File[],
  config: ImageValidationConfig
): Promise<{
  isValid: boolean
  results: ImageValidationResult[]
  globalErrors: string[]
}> {
  const globalErrors: string[] = []

  // Check file count
  if (files.length > config.maxFiles) {
    globalErrors.push(`Too many files (${files.length}). Maximum allowed: ${config.maxFiles}`)
  }

  if (files.length === 0) {
    globalErrors.push('No files provided')
  }

  // Validate each file
  const results = await Promise.all(
    files.map(file => validateImageFile(file, config))
  )

  // Check total file size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const maxTotalSize = config.maxFileSize * config.maxFiles
  if (totalSize > maxTotalSize) {
    globalErrors.push(`Total file size (${formatFileSize(totalSize)}) exceeds maximum allowed (${formatFileSize(maxTotalSize)})`)
  }

  const isValid = globalErrors.length === 0 && results.every(result => result.isValid)

  return {
    isValid,
    results,
    globalErrors,
  }
}

// Get image dimensions from file
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// Validate image URL
export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const response = await fetch(url, { method: 'HEAD' })
    
    if (!response.ok) {
      errors.push(`Image URL returned ${response.status} ${response.statusText}`)
      return { isValid: false, errors, warnings }
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      errors.push(`URL does not point to an image (content-type: ${contentType})`)
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      if (size > IMAGE_VALIDATION_CONFIGS.general.maxFileSize) {
        errors.push(`Image size (${formatFileSize(size)}) exceeds maximum allowed size`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width: 0, // Can't determine without downloading
        height: 0,
        size: contentLength ? parseInt(contentLength, 10) : 0,
        type: contentType || '',
        aspectRatio: 0,
        filename: getFilenameFromUrl(url),
      }
    }
  } catch (error) {
    errors.push(`Failed to validate image URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { isValid: false, errors, warnings }
  }
}

// Zod schema for image validation
export const imageFileSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= IMAGE_VALIDATION_CONFIGS.general.maxFileSize, 
      `File size must be less than ${formatFileSize(IMAGE_VALIDATION_CONFIGS.general.maxFileSize)}`)
    .refine(file => IMAGE_VALIDATION_CONFIGS.general.allowedTypes.includes(file.type),
      `File type must be one of: ${IMAGE_VALIDATION_CONFIGS.general.allowedTypes.join(', ')}`),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text must not exceed 200 characters'),
  caption: z.string().max(300, 'Caption must not exceed 300 characters').optional(),
})

export const imageUrlSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text must not exceed 200 characters'),
  caption: z.string().max(300, 'Caption must not exceed 300 characters').optional(),
})

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : ''
}

export function getFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    return pathname.split('/').pop() || 'image'
  } catch {
    return 'image'
  }
}

export function isValidImageType(type: string): boolean {
  return IMAGE_VALIDATION_CONFIGS.general.allowedTypes.includes(type)
}

export function isValidImageExtension(filename: string): boolean {
  const extension = getFileExtension(filename).toLowerCase()
  return IMAGE_VALIDATION_CONFIGS.general.allowedExtensions.includes(extension)
}

// Generate safe filename
export function generateSafeFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(originalName).toLowerCase()
  
  // Clean the original name
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase()
    .substring(0, 50) // Limit length
  
  return `${prefix}${timestamp}-${randomId}-${cleanName}${extension}`
}

// Image metadata extraction
export interface ImageMetadata {
  filename: string
  size: number
  type: string
  width: number
  height: number
  aspectRatio: number
  colorDepth?: number
  hasAlpha?: boolean
}

export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  const dimensions = await getImageDimensions(file)
  
  return {
    filename: file.name,
    size: file.size,
    type: file.type,
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: dimensions.width / dimensions.height,
    // Additional metadata would require more complex image processing
  }
}

// Image security validation
export function validateImageSecurity(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check for suspicious file extensions
  const suspiciousExtensions = ['.php', '.js', '.html', '.htm', '.exe', '.bat', '.cmd']
  const filename = file.name.toLowerCase()
  
  if (suspiciousExtensions.some(ext => filename.includes(ext))) {
    errors.push('File appears to contain suspicious content')
  }
  
  // Check for double extensions
  if ((filename.match(/\./g) || []).length > 1) {
    const parts = filename.split('.')
    if (parts.length > 2) {
      errors.push('File has multiple extensions which may indicate malicious content')
    }
  }
  
  // Check MIME type vs extension mismatch
  const extension = getFileExtension(filename)
  const expectedMimeTypes: Record<string, string[]> = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
    '.gif': ['image/gif'],
  }
  
  if (expectedMimeTypes[extension]) {
    if (!expectedMimeTypes[extension].includes(file.type)) {
      errors.push(`MIME type '${file.type}' does not match file extension '${extension}'`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}