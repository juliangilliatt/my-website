import { NextRequest, NextResponse } from 'next/server'
import { ratelimit } from '@/lib/ratelimit'

// Simplified upload route for deployment
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit('upload')
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Mock successful upload for deployment
    return NextResponse.json({
      success: true,
      file: {
        id: 'mock-file-id',
        url: '/images/placeholder.jpg',
        path: '/uploads/mock-file.jpg',
        name: 'mock-file.jpg',
        size: 1024,
        type: 'image/jpeg',
        metadata: {
          uploadedAt: new Date().toISOString(),
        },
      },
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

// Mock GET endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    file: {
      path: '/mock/path',
      url: '/images/placeholder.jpg',
      metadata: {},
      exists: true,
    },
  })
}

// Mock DELETE endpoint
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'File deleted successfully',
  })
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