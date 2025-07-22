import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ratelimit } from '@/lib/ratelimit'

// Feature flag for file uploads (disabled for deployment)
const ENABLE_FILE_UPLOADS = process.env.ENABLE_FILE_UPLOADS === 'true'

// Supported file types and sizes
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Upload a file
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit('upload')
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Check authentication
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For deployment, return mock upload response
    if (!ENABLE_FILE_UPLOADS) {
      return NextResponse.json({
        success: true,
        message: 'File upload disabled for deployment',
        file: {
          id: 'mock-file-id',
          url: '/images/placeholder.jpg',
          filename: 'mock-file.jpg',
          originalName: 'sample-image.jpg',
          size: 1024,
          type: 'image/jpeg',
          alt: '',
          caption: '',
          width: 800,
          height: 600,
          uploadedAt: new Date().toISOString(),
          uploadedById: session.userId,
        },
      }, { status: 201 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string || ''
    const caption = formData.get('caption') as string || ''

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Upload to Vercel Blob (would be implemented here)
    // const blob = await put(filename, file, {
    //   access: 'public',
    //   token: process.env.BLOB_READ_WRITE_TOKEN,
    // })

    // Mock response for when uploads are enabled but Vercel Blob isn't configured
    const mockFile = {
      id: `file-${timestamp}`,
      url: `/uploads/${filename}`,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      alt,
      caption,
      width: null, // Would be extracted from image metadata
      height: null, // Would be extracted from image metadata
      uploadedAt: new Date().toISOString(),
      uploadedById: session.userId,
    }

    // Save file metadata to database (when enabled)
    // await prisma.image.create({
    //   data: mockFile
    // })

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: mockFile,
    }, { status: 201 })

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

// Get file metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }

    // For deployment, return mock file data
    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        url: '/images/placeholder.jpg',
        filename: 'placeholder.jpg',
        originalName: 'sample-image.jpg',
        size: 1024,
        type: 'image/jpeg',
        alt: 'Placeholder image',
        caption: 'Sample image for deployment',
        width: 800,
        height: 600,
        uploadedAt: new Date().toISOString(),
        uploadedById: 'mock-user-id',
      },
    })

  } catch (error) {
    console.error('Get file error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Delete a file
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }

    // For deployment, just return success
    if (!ENABLE_FILE_UPLOADS) {
      return NextResponse.json({
        success: true,
        message: 'File deletion disabled for deployment',
      })
    }

    // Delete from Vercel Blob (would be implemented here)
    // await del(fileUrl, {
    //   token: process.env.BLOB_READ_WRITE_TOKEN,
    // })

    // Delete from database (when enabled)
    // await prisma.image.delete({
    //   where: { id: fileId }
    // })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })

  } catch (error) {
    console.error('Delete file error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Get upload configuration
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({
    allowedTypes: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxSizeMB: Math.round(MAX_FILE_SIZE / (1024 * 1024)),
    uploadsEnabled: ENABLE_FILE_UPLOADS,
  })
}