import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { ratelimit } from '@/lib/ratelimit'
import { 
  validateImageFile, 
  validateImageSecurity,
  IMAGE_VALIDATION_CONFIGS,
  type ImageValidationConfig 
} from '@/lib/image/validation'
import { 
  optimizeImage, 
  generateResponsiveVariants, 
  OPTIMIZATION_PRESETS 
} from '@/lib/image/optimization'
import { 
  createStorageManager, 
  ImageVariantsManager 
} from '@/lib/image/storage'
import { requirePermission } from '@/lib/auth/admin-guards'

// Maximum upload size (10MB)
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

interface UploadOptions {
  type?: 'avatar' | 'recipe' | 'blog' | 'general'
  generateVariants?: boolean
  optimize?: boolean
  quality?: number
  maxWidth?: number
  maxHeight?: number
  prefix?: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success, limit, reset, remaining } = await ratelimit.limit('upload')
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          }
        }
      )
    }

    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Permission check for admin uploads
    const url = new URL(request.url)
    const isAdminUpload = url.searchParams.get('admin') === 'true'
    
    if (isAdminUpload) {
      try {
        await requirePermission('content:create')
      } catch (error) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsJson = formData.get('options') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Parse upload options
    const options: UploadOptions = optionsJson 
      ? JSON.parse(optionsJson) 
      : { type: 'general' }

    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Get validation config
    const validationConfig = IMAGE_VALIDATION_CONFIGS[options.type || 'general']

    // Validate image file
    const validation = await validateImageFile(file, validationConfig)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid image file', details: validation.errors },
        { status: 400 }
      )
    }

    // Security validation
    const securityValidation = validateImageSecurity(file)
    if (!securityValidation.isValid) {
      return NextResponse.json(
        { error: 'Security validation failed', details: securityValidation.errors },
        { status: 400 }
      )
    }

    // Initialize storage manager
    const storage = createStorageManager({
      provider: process.env.STORAGE_PROVIDER as any || 'local',
      maxFileSize: MAX_UPLOAD_SIZE,
      allowedTypes: validationConfig.allowedTypes,
    })

    // Process image
    let processedFile: Blob = file
    let processingMetadata: any = {}

    if (options.optimize !== false) {
      try {
        const optimizationOptions = {
          ...OPTIMIZATION_PRESETS[options.type || 'general'],
          quality: options.quality,
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight,
        }

        const optimized = await optimizeImage(file, optimizationOptions)
        processedFile = optimized.blob
        processingMetadata = {
          originalSize: file.size,
          optimizedSize: optimized.size,
          compressionRatio: (1 - optimized.size / file.size) * 100,
          width: optimized.width,
          height: optimized.height,
          format: optimized.format,
        }
      } catch (error) {
        console.error('Image optimization failed:', error)
        // Continue with original file if optimization fails
      }
    }

    // Generate file path
    const timestamp = Date.now()
    const userId_clean = userId.replace(/[^a-zA-Z0-9]/g, '')
    const prefix = options.prefix || `${options.type || 'general'}/${userId_clean}`
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${timestamp}-${Math.random().toString(36).substring(2, 8)}.${extension}`
    const filePath = `${prefix}/${filename}`

    // Upload metadata
    const uploadMetadata = {
      userId,
      originalName: file.name,
      originalSize: file.size,
      uploadedAt: new Date().toISOString(),
      type: options.type || 'general',
      ...processingMetadata,
      ...validation.metadata,
    }

    // Upload file
    const uploadResult = await storage.uploadFile(processedFile, {
      path: filePath,
      metadata: uploadMetadata,
    })

    // Generate variants if requested
    const variants: Record<string, any> = {}
    if (options.generateVariants) {
      try {
        const variantsManager = new ImageVariantsManager(storage)
        const variantResults = await variantsManager.uploadWithVariants(
          processedFile,
          filePath.replace(/\.[^/.]+$/, ''), // Remove extension
          uploadMetadata
        )
        
        Object.assign(variants, variantResults)
      } catch (error) {
        console.error('Variant generation failed:', error)
        // Continue without variants if generation fails
      }
    }

    // Generate responsive variants for web images
    if (options.type === 'blog' || options.type === 'recipe') {
      try {
        const responsiveVariants = await generateResponsiveVariants(file)
        const responsiveResults: Record<string, any> = {}
        
        for (const [size, variant] of Object.entries(responsiveVariants)) {
          const variantPath = `${filePath.replace(/\.[^/.]+$/, '')}-${size}.${extension}`
          const variantResult = await storage.uploadFile(variant.blob, {
            path: variantPath,
            metadata: {
              ...uploadMetadata,
              variant: size,
              width: variant.width,
              height: variant.height,
            },
          })
          responsiveResults[size] = variantResult
        }
        
        Object.assign(variants, responsiveResults)
      } catch (error) {
        console.error('Responsive variant generation failed:', error)
      }
    }

    // Response data
    const response = {
      success: true,
      file: {
        id: `${timestamp}-${Math.random().toString(36).substring(2, 8)}`,
        url: uploadResult.url,
        path: uploadResult.path,
        name: file.name,
        size: uploadResult.size,
        type: file.type,
        metadata: uploadMetadata,
      },
      variants: Object.keys(variants).length > 0 ? variants : undefined,
      processing: processingMetadata,
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
      },
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving upload information
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const path = url.searchParams.get('path')
    
    if (!path) {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      )
    }

    const storage = createStorageManager({
      provider: process.env.STORAGE_PROVIDER as any || 'local',
    })

    // Check if file exists
    const exists = await storage.fileExists(path)
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Get file metadata
    const metadata = await storage.getFileMetadata(path)
    const fileUrl = storage.getFileUrl(path)

    return NextResponse.json({
      success: true,
      file: {
        path,
        url: fileUrl,
        metadata,
        exists: true,
      },
    })

  } catch (error) {
    console.error('File retrieval error:', error)
    
    return NextResponse.json(
      { 
        error: 'File retrieval failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// DELETE endpoint for removing uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const path = url.searchParams.get('path')
    const isAdmin = url.searchParams.get('admin') === 'true'
    
    if (!path) {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      )
    }

    // Permission check for admin deletions
    if (isAdmin) {
      try {
        await requirePermission('content:delete')
      } catch (error) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    const storage = createStorageManager({
      provider: process.env.STORAGE_PROVIDER as any || 'local',
    })

    // Check if file exists
    const exists = await storage.fileExists(path)
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Get file metadata to check ownership
    const metadata = await storage.getFileMetadata(path)
    
    // Check if user owns the file (unless admin)
    if (!isAdmin && metadata?.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this file' },
        { status: 403 }
      )
    }

    // Delete file
    await storage.deleteFile(path)

    // Also delete variants if they exist
    try {
      const variantsManager = new ImageVariantsManager(storage)
      const basePath = path.replace(/\.[^/.]+$/, '') // Remove extension
      await variantsManager.deleteVariants(basePath)
    } catch (error) {
      console.error('Variant deletion failed:', error)
      // Continue even if variant deletion fails
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })

  } catch (error) {
    console.error('File deletion error:', error)
    
    return NextResponse.json(
      { 
        error: 'File deletion failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// OPTIONS endpoint for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// Helper functions
function generateUniqueFilename(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars
    .substring(0, 30) // Limit length
  
  return `${timestamp}-${randomId}-${cleanName}.${extension}`
}

function validateUploadPermissions(userId: string, fileType: string): boolean {
  // Basic permission validation
  // In a real app, this would check user roles and permissions
  return true
}

function createUploadResponse(
  file: File,
  uploadResult: any,
  variants: Record<string, any> = {},
  metadata: any = {}
) {
  return {
    success: true,
    file: {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      url: uploadResult.url,
      path: uploadResult.path,
      name: file.name,
      size: uploadResult.size,
      type: file.type,
      metadata,
    },
    variants: Object.keys(variants).length > 0 ? variants : undefined,
    uploadedAt: new Date().toISOString(),
  }
}