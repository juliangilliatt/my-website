// CDN configuration and optimization utilities

export interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'vercel' | 'custom'
  domain: string
  zones: {
    images: string
    static: string
    api: string
    video: string
  }
  caching: {
    static: number
    images: number
    api: number
    html: number
  }
  compression: {
    gzip: boolean
    brotli: boolean
    minify: boolean
  }
  security: {
    hotlinkProtection: boolean
    ddosProtection: boolean
    firewall: boolean
  }
  optimization: {
    imageOptimization: boolean
    autoWebP: boolean
    polish: boolean
    mirage: boolean
    rocketLoader: boolean
  }
}

export interface CDNAsset {
  url: string
  type: 'image' | 'css' | 'js' | 'font' | 'video' | 'document'
  size: number
  lastModified: Date
  etag: string
  cacheControl: string
}

export interface CDNMetrics {
  bandwidth: number
  requests: number
  cacheHitRatio: number
  originRequests: number
  savings: number
  topCountries: Array<{ country: string; requests: number }>
  topPaths: Array<{ path: string; requests: number }>
}

// CDN Manager class
export class CDNManager {
  private config: CDNConfig

  constructor(config: CDNConfig) {
    this.config = config
  }

  // Generate CDN URL
  generateCDNUrl(
    path: string,
    type: 'images' | 'static' | 'api' | 'video' = 'static',
    options: {
      version?: string
      transform?: Record<string, any>
      cacheBuster?: boolean
    } = {}
  ): string {
    const zone = this.config.zones[type]
    const { version, transform, cacheBuster } = options

    let url = `https://${zone}${path}`

    // Add version parameter
    if (version) {
      url += `?v=${version}`
    }

    // Add cache buster
    if (cacheBuster) {
      const separator = url.includes('?') ? '&' : '?'
      url += `${separator}t=${Date.now()}`
    }

    // Add transformation parameters for images
    if (type === 'images' && transform) {
      const separator = url.includes('?') ? '&' : '?'
      const params = Object.entries(transform)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
      url += `${separator}${params}`
    }

    return url
  }

  // Optimize image URL
  optimizeImageUrl(
    src: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto'
      fit?: 'cover' | 'contain' | 'fill'
      gravity?: 'center' | 'north' | 'south' | 'east' | 'west'
      sharpen?: boolean
      blur?: number
    } = {}
  ): string {
    const transform: Record<string, any> = {}

    if (options.width) transform.w = options.width
    if (options.height) transform.h = options.height
    if (options.quality) transform.q = options.quality
    if (options.format) transform.f = options.format
    if (options.fit) transform.fit = options.fit
    if (options.gravity) transform.g = options.gravity
    if (options.sharpen) transform.sharpen = 1
    if (options.blur) transform.blur = options.blur

    return this.generateCDNUrl(src, 'images', { transform })
  }

  // Generate responsive image set
  generateResponsiveImageSet(
    src: string,
    breakpoints: number[] = [480, 768, 1024, 1920],
    options: {
      quality?: number
      format?: string
      fit?: string
    } = {}
  ): {
    srcSet: string
    sizes: string
  } {
    const srcSet = breakpoints
      .map(width => {
        const url = this.optimizeImageUrl(src, { ...options, width })
        return `${url} ${width}w`
      })
      .join(', ')

    const sizes = breakpoints
      .map((width, index) => {
        if (index === breakpoints.length - 1) {
          return `${width}px`
        }
        return `(max-width: ${width}px) ${width}px`
      })
      .join(', ')

    return { srcSet, sizes }
  }

  // Preload critical assets
  preloadCriticalAssets(assets: Array<{
    url: string
    type: 'image' | 'script' | 'style' | 'font'
    importance?: 'high' | 'low'
    crossOrigin?: boolean
  }>): void {
    assets.forEach(asset => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = asset.type
      link.href = this.generateCDNUrl(asset.url)
      
      if (asset.importance) {
        link.setAttribute('importance', asset.importance)
      }
      
      if (asset.crossOrigin) {
        link.crossOrigin = 'anonymous'
      }
      
      if (asset.type === 'font') {
        link.crossOrigin = 'anonymous'
      }

      document.head.appendChild(link)
    })
  }

  // Prefetch resources
  prefetchResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = this.generateCDNUrl(url)
      document.head.appendChild(link)
    })
  }

  // Set cache headers
  generateCacheHeaders(
    type: 'static' | 'images' | 'api' | 'html',
    options: {
      maxAge?: number
      staleWhileRevalidate?: number
      staleIfError?: number
      mustRevalidate?: boolean
      noCache?: boolean
      noStore?: boolean
    } = {}
  ): Record<string, string> {
    const headers: Record<string, string> = {}
    
    const defaultMaxAge = this.config.caching[type]
    const maxAge = options.maxAge || defaultMaxAge
    
    if (options.noStore) {
      headers['Cache-Control'] = 'no-store'
    } else if (options.noCache) {
      headers['Cache-Control'] = 'no-cache'
    } else {
      let cacheControl = `max-age=${maxAge}`
      
      if (options.staleWhileRevalidate) {
        cacheControl += `, stale-while-revalidate=${options.staleWhileRevalidate}`
      }
      
      if (options.staleIfError) {
        cacheControl += `, stale-if-error=${options.staleIfError}`
      }
      
      if (options.mustRevalidate) {
        cacheControl += ', must-revalidate'
      }
      
      headers['Cache-Control'] = cacheControl
    }

    // Add ETag for better caching
    headers['ETag'] = `"${Date.now()}"`
    
    return headers
  }

  // Purge cache
  async purgeCache(
    paths: string[],
    options: {
      zone?: string
      tags?: string[]
      everything?: boolean
    } = {}
  ): Promise<boolean> {
    try {
      const purgeData = {
        files: paths.map(path => this.generateCDNUrl(path)),
        tags: options.tags,
        purge_everything: options.everything
      }

      // Mock API call - replace with actual CDN API
      const response = await fetch(`https://api.${this.config.provider}.com/purge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CDN_API_KEY}`
        },
        body: JSON.stringify(purgeData)
      })

      return response.ok
    } catch (error) {
      console.error('CDN purge failed:', error)
      return false
    }
  }

  // Get CDN metrics
  async getCDNMetrics(
    dateRange: {
      start: Date
      end: Date
    }
  ): Promise<CDNMetrics> {
    try {
      // Mock API call - replace with actual CDN API
      const response = await fetch(`https://api.${this.config.provider}.com/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CDN_API_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch CDN metrics')
      }

      const data = await response.json()
      
      return {
        bandwidth: data.bandwidth || 0,
        requests: data.requests || 0,
        cacheHitRatio: data.cacheHitRatio || 0,
        originRequests: data.originRequests || 0,
        savings: data.savings || 0,
        topCountries: data.topCountries || [],
        topPaths: data.topPaths || []
      }
    } catch (error) {
      console.error('Failed to get CDN metrics:', error)
      return {
        bandwidth: 0,
        requests: 0,
        cacheHitRatio: 0,
        originRequests: 0,
        savings: 0,
        topCountries: [],
        topPaths: []
      }
    }
  }

  // Upload asset to CDN
  async uploadAsset(
    file: File | Buffer,
    path: string,
    options: {
      contentType?: string
      cacheControl?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<CDNAsset> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path)
      
      if (options.contentType) {
        formData.append('contentType', options.contentType)
      }
      
      if (options.cacheControl) {
        formData.append('cacheControl', options.cacheControl)
      }
      
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata))
      }

      const response = await fetch(`https://api.${this.config.provider}.com/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CDN_API_KEY}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload asset')
      }

      const data = await response.json()
      
      return {
        url: this.generateCDNUrl(path),
        type: this.detectAssetType(path),
        size: data.size || 0,
        lastModified: new Date(data.lastModified),
        etag: data.etag || '',
        cacheControl: options.cacheControl || ''
      }
    } catch (error) {
      console.error('Failed to upload asset:', error)
      throw error
    }
  }

  // Delete asset from CDN
  async deleteAsset(path: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.${this.config.provider}.com/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CDN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to delete asset:', error)
      return false
    }
  }

  // Batch upload assets
  async batchUploadAssets(
    assets: Array<{
      file: File | Buffer
      path: string
      options?: {
        contentType?: string
        cacheControl?: string
        metadata?: Record<string, any>
      }
    }>,
    onProgress?: (progress: number) => void
  ): Promise<CDNAsset[]> {
    const results: CDNAsset[] = []
    
    for (let i = 0; i < assets.length; i++) {
      const { file, path, options = {} } = assets[i]
      
      try {
        const asset = await this.uploadAsset(file, path, options)
        results.push(asset)
      } catch (error) {
        console.error(`Failed to upload ${path}:`, error)
        // Continue with other uploads
      }
      
      if (onProgress) {
        onProgress(((i + 1) / assets.length) * 100)
      }
    }
    
    return results
  }

  // Optimize asset delivery
  optimizeAssetDelivery(): void {
    // Add resource hints
    this.addResourceHints()
    
    // Enable compression
    this.enableCompression()
    
    // Configure service worker
    this.configureServiceWorker()
  }

  // Add resource hints
  private addResourceHints(): void {
    // DNS prefetch for CDN domains
    Object.values(this.config.zones).forEach(zone => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = `//${zone}`
      document.head.appendChild(link)
    })

    // Preconnect to CDN
    const preconnectLink = document.createElement('link')
    preconnectLink.rel = 'preconnect'
    preconnectLink.href = `//${this.config.zones.static}`
    preconnectLink.crossOrigin = 'anonymous'
    document.head.appendChild(preconnectLink)
  }

  // Enable compression
  private enableCompression(): void {
    // This would typically be configured at the server/CDN level
    // Here we're just documenting the configuration
    console.log('Compression enabled:', this.config.compression)
  }

  // Configure service worker for CDN caching
  private configureServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      // Register service worker with CDN configuration
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          registration.addEventListener('message', event => {
            if (event.data.type === 'CDN_CONFIG') {
              // Send CDN configuration to service worker
              event.ports[0].postMessage({
                config: this.config,
                zones: this.config.zones
              })
            }
          })
        })
    }
  }

  // Detect asset type from path
  private detectAssetType(path: string): CDNAsset['type'] {
    const extension = path.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'avif':
      case 'svg':
        return 'image'
      case 'css':
        return 'css'
      case 'js':
        return 'js'
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font'
      case 'mp4':
      case 'webm':
      case 'mov':
        return 'video'
      default:
        return 'document'
    }
  }

  // Generate security headers
  generateSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    
    if (this.config.security.hotlinkProtection) {
      headers['X-Frame-Options'] = 'SAMEORIGIN'
    }
    
    if (this.config.security.ddosProtection) {
      headers['X-Content-Type-Options'] = 'nosniff'
    }
    
    if (this.config.security.firewall) {
      headers['X-XSS-Protection'] = '1; mode=block'
    }
    
    return headers
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    responseTime: number
    cacheStatus: string
  }> {
    const start = Date.now()
    
    try {
      const response = await fetch(this.generateCDNUrl('/health'))
      const responseTime = Date.now() - start
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        cacheStatus: response.headers.get('CF-Cache-Status') || 'unknown'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        cacheStatus: 'error'
      }
    }
  }
}

// Default CDN configuration
const defaultCDNConfig: CDNConfig = {
  provider: 'vercel',
  domain: process.env.NEXT_PUBLIC_CDN_DOMAIN || 'cdn.example.com',
  zones: {
    images: process.env.NEXT_PUBLIC_CDN_IMAGES || 'images.example.com',
    static: process.env.NEXT_PUBLIC_CDN_STATIC || 'static.example.com',
    api: process.env.NEXT_PUBLIC_CDN_API || 'api.example.com',
    video: process.env.NEXT_PUBLIC_CDN_VIDEO || 'video.example.com'
  },
  caching: {
    static: 31536000, // 1 year
    images: 2592000,  // 30 days
    api: 300,         // 5 minutes
    html: 3600        // 1 hour
  },
  compression: {
    gzip: true,
    brotli: true,
    minify: true
  },
  security: {
    hotlinkProtection: true,
    ddosProtection: true,
    firewall: true
  },
  optimization: {
    imageOptimization: true,
    autoWebP: true,
    polish: true,
    mirage: true,
    rocketLoader: false
  }
}

// Export CDN manager instance
export const cdnManager = new CDNManager(defaultCDNConfig)

// Utility functions
export const generateCDNUrl = (path: string, type?: 'images' | 'static' | 'api' | 'video'): string => {
  return cdnManager.generateCDNUrl(path, type)
}

export const optimizeImageUrl = (src: string, options: Parameters<CDNManager['optimizeImageUrl']>[1]): string => {
  return cdnManager.optimizeImageUrl(src, options)
}

export const generateResponsiveImages = (src: string, breakpoints?: number[]): ReturnType<CDNManager['generateResponsiveImageSet']> => {
  return cdnManager.generateResponsiveImageSet(src, breakpoints)
}

export const preloadCriticalAssets = (assets: Parameters<CDNManager['preloadCriticalAssets']>[0]): void => {
  cdnManager.preloadCriticalAssets(assets)
}

export default cdnManager