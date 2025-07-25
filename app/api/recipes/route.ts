import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { recipeSchema } from '@/lib/validations/recipe'
import { z } from 'zod'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET /api/recipes - Get recipes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const search = searchParams.get('search') || ''
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

    // Search functionality
    if (search) {
      // For MongoDB with JSON fields, we'll use text search on title and description
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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
        where.servings = servingsNum
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
    })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create a new recipe (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate data
    const validatedData = recipeSchema.parse(body)

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        ...validatedData,
        authorId: userId,
        ingredients: {
          create: validatedData.ingredients,
        },
        tags: validatedData.tagIds ? {
          connect: validatedData.tagIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        },
        ingredients: true,
      },
    })

    return NextResponse.json({ data: recipe }, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}