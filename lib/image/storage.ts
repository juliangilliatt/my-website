// File storage utilities for handling image uploads and management

export interface StorageProvider {
  upload: (file: Blob, path: string, metadata?: Record<string, any>) => Promise<StorageResult>
  delete: (path: string) => Promise<void>
  getUrl: (path: string) => string
  exists: (path: string) => Promise<boolean>
  getMetadata: (path: string) => Promise<Record<string, any> | null>
  listFiles: (prefix?: string) => Promise<StorageFileInfo[]>
}

export interface StorageResult {
  url: string
  path: string
  size: number
  metadata?: Record<string, any>
}

export interface StorageFileInfo {
  path: string
  url: string
  size: number
  lastModified: Date
  metadata?: Record<string, any>
}

export interface StorageConfig {
  provider: 'vercel' | 'aws' | 'cloudinary' | 'local'
  bucket?: string
  region?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  basePath?: string
  maxFileSize?: number
  allowedTypes?: string[]
}

// Local storage implementation (for development)
export class LocalStorageProvider implements StorageProvider {
  private basePath: string
  private baseUrl: string

  constructor(config: { basePath?: string; baseUrl?: string } = {}) {
    this.basePath = config.basePath || '/tmp/uploads'
    this.baseUrl = config.baseUrl || '/uploads'
  }

  async upload(file: Blob, path: string, metadata?: Record<string, any>): Promise<StorageResult> {
    // In a real implementation, this would write to the filesystem
    // For now, we'll simulate with a mock implementation
    
    const fullPath = `${this.basePath}/${path}`
    const url = `${this.baseUrl}/${path}`
    
    // Mock file write
    console.log(`Would upload file to: ${fullPath}`)
    
    return {
      url,
      path: fullPath,
      size: file.size,
      metadata,
    }
  }

  async delete(path: string): Promise<void> {
    console.log(`Would delete file: ${path}`)
  }

  getUrl(path: string): string {
    return `${this.baseUrl}/${path}`
  }

  async exists(path: string): Promise<boolean> {
    // Mock implementation
    return false
  }

  async getMetadata(path: string): Promise<Record<string, any> | null> {
    // Mock implementation
    return null
  }

  async listFiles(prefix?: string): Promise<StorageFileInfo[]> {
    // Mock implementation
    return []
  }
}

// Vercel Blob storage implementation
export class VercelBlobProvider implements StorageProvider {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async upload(file: Blob, path: string, metadata?: Record<string, any>): Promise<StorageResult> {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': file.type,
          'x-content-type': file.type,
        },
        body: file,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        url: result.url,
        path: result.pathname,
        size: file.size,
        metadata,
      }
    } catch (error) {
      throw new Error(`Vercel Blob upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      throw new Error(`Vercel Blob delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getUrl(path: string): string {
    return `https://blob.vercel-storage.com/${path}`
  }

  async exists(path: string): Promise<boolean> {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${path}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async getMetadata(path: string): Promise<Record<string, any> | null> {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${path}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      return {
        size: response.headers.get('content-length'),
        type: response.headers.get('content-type'),
        lastModified: response.headers.get('last-modified'),
      }
    } catch {
      return null
    }
  }

  async listFiles(prefix?: string): Promise<StorageFileInfo[]> {
    // Vercel Blob doesn't have a native list operation
    // This would need to be implemented using a database or index
    return []
  }
}

// AWS S3 storage implementation
export class S3StorageProvider implements StorageProvider {
  private accessKey: string
  private secretKey: string
  private bucket: string
  private region: string
  private endpoint?: string

  constructor(config: {
    accessKey: string
    secretKey: string
    bucket: string
    region: string
    endpoint?: string
  }) {
    this.accessKey = config.accessKey
    this.secretKey = config.secretKey
    this.bucket = config.bucket
    this.region = config.region
    this.endpoint = config.endpoint
  }

  async upload(file: Blob, path: string, metadata?: Record<string, any>): Promise<StorageResult> {
    // This would use AWS SDK in a real implementation
    // For now, return mock data
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`
    
    return {
      url,
      path,
      size: file.size,
      metadata,
    }
  }

  async delete(path: string): Promise<void> {
    // AWS S3 delete implementation
    console.log(`Would delete from S3: ${path}`)
  }

  getUrl(path: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`
  }

  async exists(path: string): Promise<boolean> {
    // S3 head object implementation
    return false
  }

  async getMetadata(path: string): Promise<Record<string, any> | null> {
    // S3 head object implementation
    return null
  }

  async listFiles(prefix?: string): Promise<StorageFileInfo[]> {
    // S3 list objects implementation
    return []
  }
}

// Cloudinary storage implementation
export class CloudinaryProvider implements StorageProvider {
  private cloudName: string
  private apiKey: string
  private apiSecret: string

  constructor(config: {
    cloudName: string
    apiKey: string
    apiSecret: string
  }) {
    this.cloudName = config.cloudName
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
  }

  async upload(file: Blob, path: string, metadata?: Record<string, any>): Promise<StorageResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'unsigned') // You'd need to set this up
    formData.append('public_id', path)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`)
    }

    const result = await response.json()
    
    return {
      url: result.secure_url,
      path: result.public_id,
      size: result.bytes,
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        ...metadata,
      },
    }
  }

  async delete(path: string): Promise<void> {
    const timestamp = Math.round(Date.now() / 1000)
    const signature = this.generateSignature({ public_id: path, timestamp })

    const formData = new FormData()
    formData.append('public_id', path)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', this.apiKey)
    formData.append('signature', signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Cloudinary delete failed: ${response.status}`)
    }
  }

  getUrl(path: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${path}`
  }

  async exists(path: string): Promise<boolean> {
    try {
      const response = await fetch(this.getUrl(path), { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  async getMetadata(path: string): Promise<Record<string, any> | null> {
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/resources/image/upload/${path}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
          },
        }
      )

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      return null
    }
  }

  async listFiles(prefix?: string): Promise<StorageFileInfo[]> {
    // Cloudinary resources API implementation
    return []
  }

  private generateSignature(params: Record<string, any>): string {
    // This would use crypto to generate HMAC SHA1 signature
    // Mock implementation for now
    return 'mock-signature'
  }
}

// Storage manager class
export class StorageManager {
  private provider: StorageProvider
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
    this.provider = this.createProvider(config)
  }

  private createProvider(config: StorageConfig): StorageProvider {
    switch (config.provider) {
      case 'vercel':
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required for Vercel Blob')
        }
        return new VercelBlobProvider(process.env.BLOB_READ_WRITE_TOKEN)

      case 'aws':
        return new S3StorageProvider({
          accessKey: config.accessKey || process.env.AWS_ACCESS_KEY_ID || '',
          secretKey: config.secretKey || process.env.AWS_SECRET_ACCESS_KEY || '',
          bucket: config.bucket || process.env.AWS_S3_BUCKET || '',
          region: config.region || process.env.AWS_REGION || 'us-east-1',
          endpoint: config.endpoint,
        })

      case 'cloudinary':
        return new CloudinaryProvider({
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
          apiKey: process.env.CLOUDINARY_API_KEY || '',
          apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        })

      case 'local':
      default:
        return new LocalStorageProvider({
          basePath: config.basePath,
          baseUrl: '/api/uploads',
        })
    }
  }

  async uploadFile(
    file: Blob,
    options: {
      path?: string
      prefix?: string
      generatePath?: boolean
      metadata?: Record<string, any>
    } = {}
  ): Promise<StorageResult> {
    const { path, prefix = '', generatePath = true, metadata } = options

    // Validate file
    if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`)
    }

    if (this.config.allowedTypes && !this.config.allowedTypes.includes(file.type)) {
      throw new Error(`File type '${file.type}' is not allowed`)
    }

    // Generate path if not provided
    let filePath = path
    if (generatePath || !filePath) {
      filePath = this.generateFilePath(file, prefix)
    }

    // Upload file
    return await this.provider.upload(file, filePath, metadata)
  }

  async deleteFile(path: string): Promise<void> {
    return await this.provider.delete(path)
  }

  async fileExists(path: string): Promise<boolean> {
    return await this.provider.exists(path)
  }

  async getFileMetadata(path: string): Promise<Record<string, any> | null> {
    return await this.provider.getMetadata(path)
  }

  async listFiles(prefix?: string): Promise<StorageFileInfo[]> {
    return await this.provider.listFiles(prefix)
  }

  getFileUrl(path: string): string {
    return this.provider.getUrl(path)
  }

  private generateFilePath(file: Blob, prefix: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = this.getExtensionFromType(file.type)
    
    const datePath = new Date().toISOString().split('T')[0].replace(/-/g, '/')
    const filename = `${timestamp}-${random}${extension}`
    
    return `${prefix}/${datePath}/${filename}`.replace(/\/+/g, '/')
  }

  private getExtensionFromType(type: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
    }
    
    return mimeToExt[type] || '.bin'
  }
}

// Utility functions
export function createStorageManager(config?: Partial<StorageConfig>): StorageManager {
  const defaultConfig: StorageConfig = {
    provider: 'local',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  }

  return new StorageManager({ ...defaultConfig, ...config })
}

// File path utilities
export function generateSecureFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || ''
  
  // Clean the original name
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars
    .replace(/-+/g, '-') // Replace multiple hyphens
    .substring(0, 30) // Limit length
    .toLowerCase()
  
  return `${prefix}${timestamp}-${random}-${cleanName}.${extension}`
}

export function getFileTypeFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  const extToMime: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
  }
  
  return extToMime[extension || ''] || 'application/octet-stream'
}

// Image variants management
export class ImageVariantsManager {
  private storage: StorageManager
  private variants: Record<string, { width: number; height: number; quality: number }>

  constructor(storage: StorageManager) {
    this.storage = storage
    this.variants = {
      thumbnail: { width: 300, height: 300, quality: 0.8 },
      medium: { width: 800, height: 600, quality: 0.85 },
      large: { width: 1200, height: 900, quality: 0.9 },
    }
  }

  async uploadWithVariants(
    file: Blob,
    basePath: string,
    metadata?: Record<string, any>
  ): Promise<Record<string, StorageResult>> {
    const results: Record<string, StorageResult> = {}
    
    // Upload original
    results.original = await this.storage.uploadFile(file, {
      path: `${basePath}.original`,
      metadata,
    })
    
    // Generate and upload variants
    for (const [name, config] of Object.entries(this.variants)) {
      // In a real implementation, this would use the optimization library
      // to generate the variant before uploading
      const variantPath = `${basePath}.${name}`
      results[name] = await this.storage.uploadFile(file, {
        path: variantPath,
        metadata: { ...metadata, variant: name, ...config },
      })
    }
    
    return results
  }

  async deleteVariants(basePath: string): Promise<void> {
    const variants = ['original', ...Object.keys(this.variants)]
    
    await Promise.all(
      variants.map(variant => 
        this.storage.deleteFile(`${basePath}.${variant}`)
      )
    )
  }
}

// Default storage instance
export const defaultStorage = createStorageManager({
  provider: process.env.STORAGE_PROVIDER as any || 'local',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
})

// Storage providers are already exported above