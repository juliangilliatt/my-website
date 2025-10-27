import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts from database
    const [totalRecipes, totalBlogPosts] = await Promise.all([
      prisma.recipe.count(),
      prisma.blogPost.count(),
    ])

    return NextResponse.json({
      totalRecipes,
      totalBlogPosts,
      totalUsers: 0, // Not used anymore
      totalViews: 0, // Not used anymore
      recentActivity: [], // Not used anymore
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
