import { PrismaClient } from '@prisma/client'

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Create a single instance of Prisma Client
// In development, store it globally to prevent multiple instances during hot reloading
const prismaClientSingleton = () => {
  // For now, return a Prisma client that's not connected
  // This allows TypeScript to work properly without actual DB connection
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Export the Prisma client instance
export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Connection management (disabled for now)
export async function connectToDB() {
  // Disabled for deployment - no actual connection
  console.log('Database connection disabled for deployment')
  return Promise.resolve()
}

export async function disconnectFromDB() {
  // Disabled for deployment
  console.log('Database disconnection disabled for deployment')
  return Promise.resolve()
}

// Health check
export async function checkDBConnection() {
  try {
    // For now, always return false since DB is not connected
    return false
  } catch (error) {
    return false
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  // For now, just run the function with the main client
  // Real transactions will work once DB is connected
  return await fn(prisma)
}

// Utility functions for common operations
export const db = {
  user: {
    findByEmail: async (email: string) => {
      return null // Disabled for deployment
    },
    create: async (data: any) => {
      return { id: 'mock-id', ...data } // Mock response
    },
  },
  recipe: {
    findPublished: async () => {
      return [] // Empty array for deployment
    },
    findBySlug: async (slug: string) => {
      return null // Not found for deployment
    },
    findFeatured: async () => {
      return [] // Empty array for deployment
    },
    count: async () => {
      return 0 // Zero count for deployment
    },
  },
  blogPost: {
    findPublished: async () => {
      return [] // Empty array for deployment
    },
    findBySlug: async (slug: string) => {
      return null // Not found for deployment
    },
    findFeatured: async () => {
      return [] // Empty array for deployment
    },
    incrementViews: async (id: string) => {
      return { id, views: 0 } // Mock response
    },
    count: async () => {
      return 0 // Zero count for deployment
    },
  },
  tag: {
    findAll: async () => {
      return [] // Empty array for deployment
    },
    findPopular: async (limit: number = 10) => {
      return [] // Empty array for deployment
    },
    findOrCreate: async (name: string) => {
      return { id: 'mock-id', name, slug: name.toLowerCase() } // Mock response
    },
  },
  analytics: {
    track: async (event: any) => {
      return { id: 'mock-id', ...event } // Mock response
    },
    getPageViews: async (path: string) => {
      return 0 // Zero views for deployment
    },
    getPopularPages: async (limit: number = 10) => {
      return [] // Empty array for deployment
    },
  },
}

export default prisma