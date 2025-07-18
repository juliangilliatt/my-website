import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Connection management
export async function connectToDB() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw error
  }
}

export async function disconnectFromDB() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
    throw error
  }
}

// Health check
export async function checkDBConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    return false
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn)
}

// Utility functions for common operations
export const db = {
  // User operations
  user: {
    findByEmail: async (email: string) => {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          recipes: {
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          blogPosts: {
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: 5,
          },
        },
      })
    },
    create: async (data: {
      email: string
      name: string
      avatar?: string
      role?: 'USER' | 'ADMIN'
    }) => {
      return await prisma.user.create({
        data,
      })
    },
  },

  // Recipe operations
  recipe: {
    findPublished: async (params: {
      skip?: number
      take?: number
      category?: string
      cuisine?: string
      difficulty?: string
      search?: string
    } = {}) => {
      const { skip = 0, take = 12, category, cuisine, difficulty, search } = params
      
      const where: any = {
        published: true,
      }

      if (category) where.category = category
      if (cuisine) where.cuisine = cuisine
      if (difficulty) where.difficulty = difficulty
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      return await prisma.recipe.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      })
    },
    findBySlug: async (slug: string) => {
      return await prisma.recipe.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
      })
    },
    findFeatured: async (limit = 6) => {
      return await prisma.recipe.findMany({
        where: {
          published: true,
          featured: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
    },
    count: async (where: any = {}) => {
      return await prisma.recipe.count({
        where: {
          published: true,
          ...where,
        },
      })
    },
  },

  // Blog operations
  blogPost: {
    findPublished: async (params: {
      skip?: number
      take?: number
      category?: string
      search?: string
    } = {}) => {
      const { skip = 0, take = 12, category, search } = params
      
      const where: any = {
        status: 'PUBLISHED',
      }

      if (category) where.category = category
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      }

      return await prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take,
      })
    },
    findBySlug: async (slug: string) => {
      return await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
      })
    },
    findFeatured: async (limit = 3) => {
      return await prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
          featured: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      })
    },
    incrementViews: async (id: string) => {
      return await prisma.blogPost.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      })
    },
    count: async (where: any = {}) => {
      return await prisma.blogPost.count({
        where: {
          status: 'PUBLISHED',
          ...where,
        },
      })
    },
  },

  // Tag operations
  tag: {
    findAll: async () => {
      return await prisma.tag.findMany({
        orderBy: { name: 'asc' },
      })
    },
    findPopular: async (limit = 20) => {
      return await prisma.tag.findMany({
        where: {
          count: {
            gt: 0,
          },
        },
        orderBy: { count: 'desc' },
        take: limit,
      })
    },
    findOrCreate: async (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-')
      
      return await prisma.tag.upsert({
        where: { slug },
        update: {
          count: {
            increment: 1,
          },
        },
        create: {
          name,
          slug,
          count: 1,
        },
      })
    },
  },

  // Analytics operations
  analytics: {
    track: async (data: {
      event: string
      path: string
      userAgent?: string
      ip?: string
      properties?: any
    }) => {
      return await prisma.analytics.create({
        data,
      })
    },
    getPageViews: async (path: string, days = 30) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      return await prisma.analytics.count({
        where: {
          event: 'page_view',
          path,
          createdAt: {
            gte: startDate,
          },
        },
      })
    },
    getPopularPages: async (limit = 10, days = 30) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      return await prisma.analytics.groupBy({
        by: ['path'],
        where: {
          event: 'page_view',
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
      })
    },
  },
}

export default prisma