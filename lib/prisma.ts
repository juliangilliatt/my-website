// Simplified prisma stub for deployment (no database dependencies)

// Mock Prisma client for deployment
export const prisma = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({ id: 'mock-id' }),
    update: async () => ({ id: 'mock-id' }),
    delete: async () => ({ id: 'mock-id' }),
    upsert: async () => ({ id: 'mock-id' }),
  },
  recipe: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({ id: 'mock-id' }),
    update: async () => ({ id: 'mock-id' }),
    delete: async () => ({ id: 'mock-id' }),
    count: async () => 0,
    groupBy: async () => [],
  },
  blogPost: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({ id: 'mock-id' }),
    update: async () => ({ id: 'mock-id' }),
    delete: async () => ({ id: 'mock-id' }),
    count: async () => 0,
    groupBy: async () => [],
  },
  tag: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({ id: 'mock-id' }),
    update: async () => ({ id: 'mock-id' }),
    delete: async () => ({ id: 'mock-id' }),
    upsert: async () => ({ id: 'mock-id' }),
    groupBy: async () => [],
  },
  analytics: {
    create: async () => ({ id: 'mock-id' }),
    count: async () => 0,
    groupBy: async () => [],
  },
  $connect: async () => {},
  $disconnect: async () => {},
  $queryRaw: async () => [],
  $transaction: async (fn: any) => fn(prisma),
}

// Connection management (stub for deployment)
export async function connectToDB() {
  console.log('✅ Mock database connection for deployment')
}

export async function disconnectFromDB() {
  console.log('✅ Mock database disconnection for deployment')
}

// Health check (stub for deployment)
export async function checkDBConnection() {
  return true
}

// Transaction wrapper (stub for deployment)
export async function withTransaction<T>(
  fn: (tx: any) => Promise<T>
): Promise<T> {
  return await fn(prisma)
}

// Utility functions for common operations (stub for deployment)
export const db = {
  user: {
    findByEmail: async () => null,
    create: async () => ({ id: 'mock-id' }),
  },
  recipe: {
    findPublished: async () => [],
    findBySlug: async () => null,
    findFeatured: async () => [],
    count: async () => 0,
  },
  blogPost: {
    findPublished: async () => [],
    findBySlug: async () => null,
    findFeatured: async () => [],
    incrementViews: async () => ({ id: 'mock-id' }),
    count: async () => 0,
  },
  tag: {
    findAll: async () => [],
    findPopular: async () => [],
    findOrCreate: async () => ({ id: 'mock-id' }),
  },
  analytics: {
    track: async () => ({ id: 'mock-id' }),
    getPageViews: async () => 0,
    getPopularPages: async () => [],
  },
}

export default prisma