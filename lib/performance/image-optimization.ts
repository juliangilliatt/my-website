// Image optimization utilities and helpers

export interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto'
  width?: number
  height?: number
  blur?: number
  brightness?: number
  contrast?: number
  saturation?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  progressive?: boolean
  lossless?: boolean
}

export interface ResponsiveImageConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
    large: number
  }
  formats: string[]
  qualities: {
    low: number
    medium: number
    high: number
  }
  placeholders: {
    blur: boolean
    color: string
    width: number
    height: number
  }
}

// Default configuration
export const DEFAULT_IMAGE_CONFIG: ResponsiveImageConfig = {
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1920
  },
  formats: ['webp', 'avif', 'jpeg'],
  qualities: {
    low: 50,
    medium: 75,
    high: 90
  },
  placeholders: {
    blur: true,
    color: '#f3f4f6',
    width: 20,
    height: 20
  }
}

// Image optimization class
export class ImageOptimizer {
  private config: ResponsiveImageConfig

  constructor(config: Partial<ResponsiveImageConfig> = {}) {
    this.config = { ...DEFAULT_IMAGE_CONFIG, ...config }
  }

  // Generate optimized image URL
  generateOptimizedUrl(
    src: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN || ''
    const params = new URLSearchParams()

    // Add image source
    params.set('url', src)

    // Add optimization parameters
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('fm', options.format)
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.fit) params.set('fit', options.fit)
    if (options.position) params.set('position', options.position)
    if (options.blur) params.set('blur', options.blur.toString())
    if (options.brightness) params.set('brightness', options.brightness.toString())
    if (options.contrast) params.set('contrast', options.contrast.toString())
    if (options.saturation) params.set('saturation', options.saturation.toString())
    if (options.progressive) params.set('progressive', 'true')
    if (options.lossless) params.set('lossless', 'true')

    return `${baseUrl}/api/image?${params.toString()}`
  }

  // Generate responsive image sources
  generateResponsiveSources(
    src: string,
    options: ImageOptimizationOptions = {}
  ): Array<{
    srcSet: string
    media: string
    type: string
  }> {
    const sources: Array<{
      srcSet: string
      media: string
      type: string
    }> = []

    // Generate sources for each format
    for (const format of this.config.formats) {
      const srcSets: string[] = []

      // Generate srcSet for each breakpoint
      Object.entries(this.config.breakpoints).forEach(([key, width]) => {
        const optimizedOptions = {
          ...options,
          format: format as ImageOptimizationOptions['format'],
          width,
          quality: this.getQualityForBreakpoint(key)
        }

        const url = this.generateOptimizedUrl(src, optimizedOptions)
        srcSets.push(`${url} ${width}w`)
      })

      // Add media queries for different breakpoints
      const mediaQueries = [
        `(max-width: ${this.config.breakpoints.mobile}px)`,
        `(max-width: ${this.config.breakpoints.tablet}px)`,
        `(max-width: ${this.config.breakpoints.desktop}px)`,
        `(min-width: ${this.config.breakpoints.large}px)`
      ]

      sources.push({
        srcSet: srcSets.join(', '),
        media: mediaQueries.join(', '),
        type: `image/${format}`
      })
    }

    return sources
  }

  // Generate sizes attribute
  generateSizes(
    customSizes?: string,
    defaultWidth?: number
  ): string {
    if (customSizes) return customSizes

    const { mobile, tablet, desktop } = this.config.breakpoints
    const defaultSize = defaultWidth || desktop

    return [
      `(max-width: ${mobile}px) ${mobile}px`,
      `(max-width: ${tablet}px) ${tablet}px`,
      `(max-width: ${desktop}px) ${desktop}px`,
      `${defaultSize}px`
    ].join(', ')
  }

  // Generate blur placeholder
  generateBlurPlaceholder(
    src: string,
    width: number = this.config.placeholders.width,
    height: number = this.config.placeholders.height
  ): string {
    const options: ImageOptimizationOptions = {
      width,
      height,
      quality: this.config.qualities.low,
      blur: 10,
      format: 'jpeg'
    }

    return this.generateOptimizedUrl(src, options)
  }

  // Generate color placeholder
  generateColorPlaceholder(
    color: string = this.config.placeholders.color,
    width: number = 400,
    height: number = 300
  ): string {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, width, height)
    }

    return canvas.toDataURL()
  }

  // Get quality based on breakpoint
  private getQualityForBreakpoint(breakpoint: string): number {
    switch (breakpoint) {
      case 'mobile':
        return this.config.qualities.low
      case 'tablet':
        return this.config.qualities.medium
      case 'desktop':
      case 'large':
        return this.config.qualities.high
      default:
        return this.config.qualities.medium
    }
  }

  // Preload critical images
  preloadCriticalImages(images: Array<{ src: string; options?: ImageOptimizationOptions }>): void {
    images.forEach(({ src, options = {} }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = this.generateOptimizedUrl(src, options)
      
      // Add responsive preload for modern browsers
      if (options.width && options.height) {
        link.setAttribute('imagesrcset', this.generateResponsiveSources(src, options)
          .map(source => source.srcSet)
          .join(', '))
        link.setAttribute('imagesizes', this.generateSizes())
      }

      document.head.appendChild(link)
    })
  }

  // Lazy load images with Intersection Observer
  lazyLoadImages(selector: string = 'img[data-src]'): void {
    const images = document.querySelectorAll(selector)
    
    if (!images.length) return

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src

            if (src) {
              img.src = src
              img.classList.remove('lazy')
              img.classList.add('loaded')
              imageObserver.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    images.forEach(img => imageObserver.observe(img))
  }

  // Progressive image loading
  progressiveLoad(
    img: HTMLImageElement,
    lowQualitySrc: string,
    highQualitySrc: string,
    onLoad?: () => void
  ): void {
    // Load low quality first
    img.src = lowQualitySrc
    img.classList.add('loading')

    // Create a new image for high quality
    const highQualityImg = new Image()
    
    highQualityImg.onload = () => {
      img.src = highQualitySrc
      img.classList.remove('loading')
      img.classList.add('loaded')
      onLoad?.()
    }

    highQualityImg.onerror = () => {
      img.classList.remove('loading')
      img.classList.add('error')
    }

    // Start loading high quality image
    highQualityImg.src = highQualitySrc
  }

  // Image format detection
  detectOptimalFormat(): string {
    // Check for AVIF support
    if (this.supportsFormat('avif')) {
      return 'avif'
    }

    // Check for WebP support
    if (this.supportsFormat('webp')) {
      return 'webp'
    }

    // Fallback to JPEG
    return 'jpeg'
  }

  // Check if browser supports image format
  private supportsFormat(format: string): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    try {
      const dataURL = canvas.toDataURL(`image/${format}`)
      return dataURL.includes(`data:image/${format}`)
    } catch {
      return false
    }
  }

  // Calculate image dimensions maintaining aspect ratio
  calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  // Generate image metadata
  generateImageMetadata(
    src: string,
    options: ImageOptimizationOptions = {}
  ): {
    url: string
    width?: number
    height?: number
    format: string
    quality: number
    sizes: string
  } {
    return {
      url: this.generateOptimizedUrl(src, options),
      width: options.width,
      height: options.height,
      format: options.format || this.detectOptimalFormat(),
      quality: options.quality || this.config.qualities.medium,
      sizes: this.generateSizes()
    }
  }

  // Image compression utility
  compressImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: string
    } = {}
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          options.maxWidth,
          options.maxHeight
        )

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          options.format || 'image/jpeg',
          options.quality || 0.8
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Batch image optimization
  async batchOptimize(
    images: Array<{ src: string; options: ImageOptimizationOptions }>,
    onProgress?: (progress: number) => void
  ): Promise<Array<{ src: string; optimized: string; error?: string }>> {
    const results: Array<{ src: string; optimized: string; error?: string }> = []
    
    for (let i = 0; i < images.length; i++) {
      const { src, options } = images[i]
      
      try {
        const optimized = this.generateOptimizedUrl(src, options)
        results.push({ src, optimized })
      } catch (error) {
        results.push({ 
          src, 
          optimized: src,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Report progress
      if (onProgress) {
        onProgress(((i + 1) / images.length) * 100)
      }
    }

    return results
  }
}

// Default image optimizer instance
export const imageOptimizer = new ImageOptimizer()

// Utility functions
export const optimizeImage = (
  src: string,
  options: ImageOptimizationOptions = {}
): string => {
  return imageOptimizer.generateOptimizedUrl(src, options)
}

export const generateResponsiveImages = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  return imageOptimizer.generateResponsiveSources(src, options)
}

export const generateBlurPlaceholder = (
  src: string,
  width?: number,
  height?: number
): string => {
  return imageOptimizer.generateBlurPlaceholder(src, width, height)
}

export const preloadImages = (
  images: Array<{ src: string; options?: ImageOptimizationOptions }>
): void => {
  imageOptimizer.preloadCriticalImages(images)
}

export const lazyLoadImages = (selector?: string): void => {
  imageOptimizer.lazyLoadImages(selector)
}

export default imageOptimizer