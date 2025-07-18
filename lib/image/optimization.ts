// Image optimization utilities for resizing, compression, and format conversion

export interface ImageOptimizationOptions {
  quality?: number // 0-1 for compression quality
  maxWidth?: number
  maxHeight?: number
  format?: 'jpeg' | 'png' | 'webp' | 'auto'
  progressive?: boolean // For JPEG
  lossless?: boolean // For WebP
  effort?: number // 0-6 for WebP encoding effort
  background?: string // Background color for transparent images
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top' | 'center'
  blur?: number // Gaussian blur radius
  sharpen?: number // Sharpen amount
  gamma?: number // Gamma correction
}

export interface OptimizedImage {
  blob: Blob
  width: number
  height: number
  format: string
  size: number
  quality: number
}

export interface ImageProcessingResult {
  original: OptimizedImage
  optimized: OptimizedImage
  thumbnail?: OptimizedImage
  webp?: OptimizedImage
  metadata: {
    originalSize: number
    optimizedSize: number
    compressionRatio: number
    processingTime: number
  }
}

// Predefined optimization presets
export const OPTIMIZATION_PRESETS = {
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.9,
    format: 'webp' as const,
    fit: 'cover' as const,
    position: 'center' as const,
  },
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
    format: 'webp' as const,
    fit: 'cover' as const,
    position: 'center' as const,
  },
  hero: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'webp' as const,
    fit: 'cover' as const,
    position: 'center' as const,
  },
  blog: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.8,
    format: 'webp' as const,
    fit: 'inside' as const,
    progressive: true,
  },
  recipe: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.85,
    format: 'webp' as const,
    fit: 'cover' as const,
    position: 'center' as const,
  },
  icon: {
    maxWidth: 256,
    maxHeight: 256,
    quality: 1.0,
    format: 'png' as const,
    fit: 'contain' as const,
    background: 'transparent',
  },
} as const

// Main image optimization function
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const startTime = Date.now()
  
  // Create canvas for image processing
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  
  // Load image
  const img = await loadImage(file)
  
  // Calculate target dimensions
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    img.width,
    img.height,
    options
  )
  
  // Set canvas size
  canvas.width = targetWidth
  canvas.height = targetHeight
  
  // Apply background if specified
  if (options.background && options.background !== 'transparent') {
    ctx.fillStyle = options.background
    ctx.fillRect(0, 0, targetWidth, targetHeight)
  }
  
  // Apply image filters
  applyImageFilters(ctx, options)
  
  // Draw image with proper positioning
  drawImageWithFit(ctx, img, targetWidth, targetHeight, options)
  
  // Convert to blob with specified format and quality
  const blob = await canvasToBlob(canvas, options)
  
  const processingTime = Date.now() - startTime
  
  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    format: options.format || 'jpeg',
    size: blob.size,
    quality: options.quality || 0.8,
  }
}

// Process image with multiple variants
export async function processImageVariants(
  file: File,
  variants: Record<string, ImageOptimizationOptions>
): Promise<Record<string, OptimizedImage>> {
  const results: Record<string, OptimizedImage> = {}
  
  for (const [name, options] of Object.entries(variants)) {
    try {
      results[name] = await optimizeImage(file, options)
    } catch (error) {
      console.error(`Failed to process variant ${name}:`, error)
      throw new Error(`Failed to process image variant: ${name}`)
    }
  }
  
  return results
}

// Generate responsive image variants
export async function generateResponsiveVariants(
  file: File,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
): Promise<Record<string, OptimizedImage>> {
  const variants: Record<string, ImageOptimizationOptions> = {}
  
  // Get original dimensions
  const img = await loadImage(file)
  const aspectRatio = img.width / img.height
  
  breakpoints.forEach(width => {
    if (width <= img.width) { // Only generate if smaller than original
      variants[`w${width}`] = {
        maxWidth: width,
        maxHeight: Math.round(width / aspectRatio),
        quality: 0.8,
        format: 'webp',
        fit: 'inside',
      }
    }
  })
  
  return await processImageVariants(file, variants)
}

// Automatic format optimization
export async function autoOptimizeFormat(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const formats: ('webp' | 'jpeg' | 'png')[] = ['webp', 'jpeg', 'png']
  let bestResult: OptimizedImage | null = null
  let bestSize = Infinity
  
  for (const format of formats) {
    try {
      const result = await optimizeImage(file, {
        ...options,
        format,
      })
      
      if (result.size < bestSize) {
        bestSize = result.size
        bestResult = result
      }
    } catch (error) {
      console.warn(`Failed to optimize as ${format}:`, error)
    }
  }
  
  if (!bestResult) {
    throw new Error('Failed to optimize image in any format')
  }
  
  return bestResult
}

// Batch image optimization
export async function batchOptimizeImages(
  files: File[],
  options: ImageOptimizationOptions = {},
  onProgress?: (progress: number, current: string) => void
): Promise<OptimizedImage[]> {
  const results: OptimizedImage[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name)
    }
    
    try {
      const optimized = await optimizeImage(file, options)
      results.push(optimized)
    } catch (error) {
      console.error(`Failed to optimize ${file.name}:`, error)
      throw error
    }
  }
  
  if (onProgress) {
    onProgress(100, '')
  }
  
  return results
}

// Utility functions

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ImageOptimizationOptions
): { width: number; height: number } {
  const { maxWidth = originalWidth, maxHeight = originalHeight, fit = 'inside' } = options
  
  let targetWidth = originalWidth
  let targetHeight = originalHeight
  
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight
  
  switch (fit) {
    case 'cover':
      // Fill the entire area, may crop image
      if (maxWidth / maxHeight > aspectRatio) {
        targetWidth = maxWidth
        targetHeight = maxWidth / aspectRatio
      } else {
        targetHeight = maxHeight
        targetWidth = maxHeight * aspectRatio
      }
      break
      
    case 'contain':
      // Fit entire image within bounds
      if (maxWidth / maxHeight > aspectRatio) {
        targetHeight = maxHeight
        targetWidth = maxHeight * aspectRatio
      } else {
        targetWidth = maxWidth
        targetHeight = maxWidth / aspectRatio
      }
      break
      
    case 'fill':
      // Stretch to fill exact dimensions
      targetWidth = maxWidth
      targetHeight = maxHeight
      break
      
    case 'inside':
      // Only scale down, never up
      if (originalWidth > maxWidth || originalHeight > maxHeight) {
        if (maxWidth / maxHeight > aspectRatio) {
          targetHeight = maxHeight
          targetWidth = maxHeight * aspectRatio
        } else {
          targetWidth = maxWidth
          targetHeight = maxWidth / aspectRatio
        }
      }
      break
      
    case 'outside':
      // Only scale up, never down
      if (originalWidth < maxWidth || originalHeight < maxHeight) {
        if (maxWidth / maxHeight > aspectRatio) {
          targetWidth = maxWidth
          targetHeight = maxWidth / aspectRatio
        } else {
          targetHeight = maxHeight
          targetWidth = maxHeight * aspectRatio
        }
      }
      break
  }
  
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  }
}

function applyImageFilters(
  ctx: CanvasRenderingContext2D,
  options: ImageOptimizationOptions
): void {
  const filters: string[] = []
  
  if (options.blur) {
    filters.push(`blur(${options.blur}px)`)
  }
  
  if (options.sharpen) {
    // Sharpen filter approximation
    filters.push(`contrast(${1 + options.sharpen})`)
  }
  
  if (options.gamma && options.gamma !== 1) {
    // Gamma correction approximation
    const brightness = Math.pow(options.gamma, -1) * 100
    filters.push(`brightness(${brightness}%)`)
  }
  
  if (filters.length > 0) {
    ctx.filter = filters.join(' ')
  }
}

function drawImageWithFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  options: ImageOptimizationOptions
): void {
  const { fit = 'inside', position = 'center' } = options
  
  let sourceX = 0
  let sourceY = 0
  let sourceWidth = img.width
  let sourceHeight = img.height
  
  let destX = 0
  let destY = 0
  let destWidth = canvasWidth
  let destHeight = canvasHeight
  
  if (fit === 'cover') {
    // Calculate crop area
    const aspectRatio = canvasWidth / canvasHeight
    const imageAspectRatio = img.width / img.height
    
    if (imageAspectRatio > aspectRatio) {
      // Image is wider, crop horizontally
      sourceWidth = img.height * aspectRatio
      sourceX = (img.width - sourceWidth) / 2
      
      // Adjust based on position
      if (position.includes('left')) sourceX = 0
      if (position.includes('right')) sourceX = img.width - sourceWidth
    } else {
      // Image is taller, crop vertically
      sourceHeight = img.width / aspectRatio
      sourceY = (img.height - sourceHeight) / 2
      
      // Adjust based on position
      if (position.includes('top')) sourceY = 0
      if (position.includes('bottom')) sourceY = img.height - sourceHeight
    }
  } else if (fit === 'contain') {
    // Calculate letterbox/pillarbox
    const aspectRatio = canvasWidth / canvasHeight
    const imageAspectRatio = img.width / img.height
    
    if (imageAspectRatio > aspectRatio) {
      // Image is wider, add top/bottom bars
      destHeight = canvasWidth / imageAspectRatio
      destY = (canvasHeight - destHeight) / 2
    } else {
      // Image is taller, add left/right bars
      destWidth = canvasHeight * imageAspectRatio
      destX = (canvasWidth - destWidth) / 2
    }
  }
  
  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    destX, destY, destWidth, destHeight
  )
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  options: ImageOptimizationOptions
): Promise<Blob> {
  const { format = 'jpeg', quality = 0.8, progressive = false } = options
  
  return new Promise((resolve, reject) => {
    const mimeType = `image/${format}`
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error(`Failed to convert canvas to ${format}`))
        }
      },
      mimeType,
      quality
    )
  })
}

// Image analysis utilities
export async function analyzeImage(file: File): Promise<{
  dominantColors: string[]
  brightness: number
  contrast: number
  hasTransparency: boolean
  colorProfile: 'rgb' | 'grayscale' | 'cmyk'
}> {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  
  // Scale down for analysis performance
  const analysisSize = 100
  canvas.width = analysisSize
  canvas.height = analysisSize
  
  ctx.drawImage(img, 0, 0, analysisSize, analysisSize)
  
  const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize)
  const pixels = imageData.data
  
  // Color analysis
  const colorCounts: Record<string, number> = {}
  let totalBrightness = 0
  let hasTransparency = false
  let grayscalePixels = 0
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]
    
    // Check transparency
    if (a < 255) {
      hasTransparency = true
    }
    
    // Calculate brightness
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    totalBrightness += brightness
    
    // Check if grayscale
    if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10) {
      grayscalePixels++
    }
    
    // Group similar colors
    const colorKey = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1
  }
  
  // Get dominant colors
  const dominantColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number)
      return `rgb(${r}, ${g}, ${b})`
    })
  
  // Calculate average brightness
  const avgBrightness = totalBrightness / (pixels.length / 4)
  
  // Determine color profile
  const grayscaleRatio = grayscalePixels / (pixels.length / 4)
  const colorProfile = grayscaleRatio > 0.9 ? 'grayscale' : 'rgb'
  
  return {
    dominantColors,
    brightness: avgBrightness,
    contrast: calculateContrast(pixels),
    hasTransparency,
    colorProfile,
  }
}

function calculateContrast(pixels: Uint8ClampedArray): number {
  const brightnesses: number[] = []
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    brightnesses.push(brightness)
  }
  
  // Calculate standard deviation as a measure of contrast
  const mean = brightnesses.reduce((sum, b) => sum + b, 0) / brightnesses.length
  const variance = brightnesses.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) / brightnesses.length
  
  return Math.sqrt(variance)
}

// Smart crop detection
export async function detectSmartCrop(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<{ x: number; y: number; width: number; height: number }> {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  
  // Scale down for analysis
  const analysisSize = 200
  canvas.width = analysisSize
  canvas.height = analysisSize
  
  ctx.drawImage(img, 0, 0, analysisSize, analysisSize)
  
  const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize)
  
  // Simple smart crop: find area with highest detail/contrast
  const blockSize = 20
  const blocks: Array<{ x: number; y: number; score: number }> = []
  
  for (let y = 0; y < analysisSize - blockSize; y += blockSize / 2) {
    for (let x = 0; x < analysisSize - blockSize; x += blockSize / 2) {
      const blockData = ctx.getImageData(x, y, blockSize, blockSize)
      const score = calculateContrast(blockData.data)
      blocks.push({ x, y, score })
    }
  }
  
  // Find the block with highest score
  const bestBlock = blocks.reduce((best, current) => 
    current.score > best.score ? current : best
  )
  
  // Scale back to original dimensions
  const scaleX = img.width / analysisSize
  const scaleY = img.height / analysisSize
  
  const cropX = Math.max(0, bestBlock.x * scaleX - targetWidth / 2)
  const cropY = Math.max(0, bestBlock.y * scaleY - targetHeight / 2)
  
  return {
    x: Math.min(cropX, img.width - targetWidth),
    y: Math.min(cropY, img.height - targetHeight),
    width: Math.min(targetWidth, img.width),
    height: Math.min(targetHeight, img.height),
  }
}

// Export preset functions
export const presets = {
  avatar: (file: File) => optimizeImage(file, OPTIMIZATION_PRESETS.avatar),
  thumbnail: (file: File) => optimizeImage(file, OPTIMIZATION_PRESETS.thumbnail),
  hero: (file: File) => optimizeImage(file, OPTIMIZATION_PRESETS.hero),
  blog: (file: File) => optimizeImage(file, OPTIMIZATION_PRESETS.blog),
  recipe: (file: File) => optimizeImage(file, OPTIMIZATION_PRESETS.recipe),
  icon: (file: File) => optimizeImage(file, OPTIMIZATION_PRESETS.icon),
}