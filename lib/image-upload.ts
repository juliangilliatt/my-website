// Image upload and processing utilities

export interface ImageUploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1 for compression
  generateThumbnail?: boolean
  thumbnailSize?: number
}

export interface ImageUploadResult {
  url: string
  thumbnailUrl?: string
  width: number
  height: number
  size: number
  type: string
  filename: string
}

export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Default upload options
const DEFAULT_OPTIONS: ImageUploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.8,
  generateThumbnail: true,
  thumbnailSize: 300,
}

// Validate image file
export function validateImageFile(
  file: File,
  options: ImageUploadOptions = {}
): ImageValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  const warnings: string[] = []

  // Check file size
  if (file.size > opts.maxSize!) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(opts.maxSize!)})`)
  }

  // Check file type
  if (!opts.allowedTypes!.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes!.join(', ')}`)
  }

  // Check filename
  if (file.name.length > 255) {
    errors.push('Filename is too long (max 255 characters)')
  }

  // File size warnings
  if (file.size > 2 * 1024 * 1024) { // 2MB
    warnings.push('Large file size may affect loading performance')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Get image dimensions
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

// Resize image
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      // Calculate new dimensions
      const { width: newWidth, height: newHeight } = calculateResizedDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      )
      
      // Set canvas dimensions
      canvas.width = newWidth
      canvas.height = newHeight
      
      // Draw and resize image
      ctx!.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to resize image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// Calculate resized dimensions while maintaining aspect ratio
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight
  
  let newWidth = originalWidth
  let newHeight = originalHeight
  
  // Scale down if necessary
  if (newWidth > maxWidth) {
    newWidth = maxWidth
    newHeight = newWidth / aspectRatio
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = newHeight * aspectRatio
  }
  
  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  }
}

// Generate thumbnail
export function generateThumbnail(
  file: File,
  size: number = 300,
  quality: number = 0.8
): Promise<Blob> {
  return resizeImage(file, size, size, quality)
}

// Convert image to WebP format
export function convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      ctx!.drawImage(img, 0, 0)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert image to WebP'))
          }
        },
        'image/webp',
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// Process image file
export async function processImageFile(
  file: File,
  options: ImageUploadOptions = {}
): Promise<{
  original: Blob
  resized?: Blob
  thumbnail?: Blob
  dimensions: { width: number; height: number }
}> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Validate file
  const validation = validateImageFile(file, opts)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }
  
  // Get dimensions
  const dimensions = await getImageDimensions(file)
  
  // Resize if needed
  let resized: Blob | undefined
  if (dimensions.width > opts.maxWidth! || dimensions.height > opts.maxHeight!) {
    resized = await resizeImage(file, opts.maxWidth!, opts.maxHeight!, opts.quality!)
  }
  
  // Generate thumbnail if requested
  let thumbnail: Blob | undefined
  if (opts.generateThumbnail) {
    thumbnail = await generateThumbnail(file, opts.thumbnailSize!, opts.quality!)
  }
  
  return {
    original: file,
    resized,
    thumbnail,
    dimensions,
  }
}

// Upload image to server (mock implementation)
export async function uploadImageToServer(
  file: File,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  const processed = await processImageFile(file, options)
  
  // Mock upload - in real implementation, this would upload to your storage service
  const mockUpload = async (blob: Blob, suffix: string = '') => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock URL
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.type.split('/')[1]
    const filename = `${timestamp}-${randomId}${suffix}.${extension}`
    
    return {
      url: `/uploads/${filename}`,
      filename,
    }
  }
  
  // Upload processed files
  const originalUpload = await mockUpload(processed.original)
  const thumbnailUpload = processed.thumbnail 
    ? await mockUpload(processed.thumbnail, '-thumb')
    : undefined
  
  return {
    url: originalUpload.url,
    thumbnailUrl: thumbnailUpload?.url,
    width: processed.dimensions.width,
    height: processed.dimensions.height,
    size: file.size,
    type: file.type,
    filename: originalUpload.filename,
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Generate unique filename
export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = getFileExtension(originalName)
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
  
  return `${prefix}${timestamp}-${randomId}-${baseName}.${extension}`
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

// Get image metadata
export function getImageMetadata(file: File): Promise<{
  name: string
  size: number
  type: string
  lastModified: number
  dimensions: { width: number; height: number }
}> {
  return new Promise(async (resolve, reject) => {
    try {
      const dimensions = await getImageDimensions(file)
      
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dimensions,
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Create image preview URL
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// Cleanup preview URL
export function cleanupImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// Batch upload images
export async function batchUploadImages(
  files: File[],
  options: ImageUploadOptions = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name)
    }
    
    try {
      const result = await uploadImageToServer(file, options)
      results.push(result)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      // Continue with other files
    }
  }
  
  if (onProgress) {
    onProgress(100, '')
  }
  
  return results
}

// Image optimization settings
export const imageOptimizationPresets = {
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
  },
  medium: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.85,
  },
  large: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.9,
  },
  hero: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
  },
}

// Extract dominant color from image
export function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      // Scale down for performance
      const size = 50
      canvas.width = size
      canvas.height = size
      
      ctx!.drawImage(img, 0, 0, size, size)
      
      const imageData = ctx!.getImageData(0, 0, size, size)
      const pixels = imageData.data
      
      const colorCounts: { [key: string]: number } = {}
      
      // Sample pixels and count colors
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        
        // Group similar colors
        const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`
        colorCounts[key] = (colorCounts[key] || 0) + 1
      }
      
      // Find most common color
      let dominantColor = '128,128,128' // default gray
      let maxCount = 0
      
      for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count
          dominantColor = color
        }
      }
      
      // Convert to hex
      const [r, g, b] = dominantColor.split(',').map(Number)
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      
      resolve(hex)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// Image upload progress tracker
export class ImageUploadProgress {
  private listeners: Array<(progress: number, file: string) => void> = []
  
  addListener(callback: (progress: number, file: string) => void): void {
    this.listeners.push(callback)
  }
  
  removeListener(callback: (progress: number, file: string) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }
  
  updateProgress(progress: number, file: string): void {
    this.listeners.forEach(listener => listener(progress, file))
  }
}

// Export singleton instance
export const imageUploadProgress = new ImageUploadProgress()