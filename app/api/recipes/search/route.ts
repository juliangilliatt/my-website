import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET /api/recipes/search - Search recipes with advanced filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const cuisine = searchParams.get('cuisine') || ''
    const maxTime = searchParams.get('maxTime')
    const servings = searchParams.get('servings')
    const tags = searchParams.get('tags')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured') === 'true'

    // Build where clause
    const where: any = {
      published: true,
    }

    // Full-text search
    if (q) {
      // For MongoDB with JSON fields, we'll use text search on title and description
      // Ingredient search would require more complex aggregation with MongoDB
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (category && category !== 'all') {
      where.category = category
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty
    }

    // Cuisine filter
    if (cuisine && cuisine !== 'all') {
      where.cuisine = cuisine
    }

    // Time filter
    if (maxTime) {
      const maxTimeNum = parseInt(maxTime)
      if (maxTimeNum > 0) {
        where.totalTime = { lte: maxTimeNum }
      }
    }

    // Servings filter
    if (servings) {
      const servingsNum = parseInt(servings)
      if (servingsNum > 0) {
        where.servings = { gte: servingsNum }
      }
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',').filter(Boolean)
      if (tagList.length > 0) {
        where.tags = {
          some: {
            name: { in: tagList }
          }
        }
      }
    }

    // Featured filter
    if (featured) {
      where.featured = true
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' } // default: newest
    
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'time':
        orderBy = { totalTime: 'asc' }
        break
      case 'difficulty':
        orderBy = { difficulty: 'asc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Calculate offset
    const skip = (page - 1) * limit

    // Execute queries
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          tags: {
            select: { id: true, name: true, slug: true }
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      query: {
        q,
        category,
        difficulty,
        cuisine,
        maxTime: maxTime ? parseInt(maxTime) : null,
        servings: servings ? parseInt(servings) : null,
        tags: tags ? tags.split(',').filter(Boolean) : [],
        sort,
        featured,
      },
    })
  } catch (error) {
    console.error('Error searching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    )
  }
}