// Database query optimization utilities and helpers

import { CacheManager } from '@/lib/cache/redis'

export interface QueryOptions {
  select?: string[]
  where?: Record<string, any>
  orderBy?: Record<string, 'asc' | 'desc'>
  skip?: number
  take?: number
  include?: Record<string, any>
  cache?: boolean
  cacheTTL?: number
  cacheKey?: string
}

export interface QueryResult<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
  totalPages: number
}

export interface DatabaseMetrics {
  queryCount: number
  totalDuration: number
  averageDuration: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: number
  }>
  cacheHits: number
  cacheMisses: number
}

// Database optimization class
export class DatabaseOptimizer {
  private metrics: DatabaseMetrics = {
    queryCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    slowQueries: [],
    cacheHits: 0,
    cacheMisses: 0
  }

  private slowQueryThreshold = 1000 // 1 second
  private maxSlowQueries = 100

  // Execute optimized query with caching
  async executeQuery<T>(
    queryFn: () => Promise<T>,
    options: {
      cacheKey?: string
      cacheTTL?: number
      enableCache?: boolean
      queryName?: string
    } = {}
  ): Promise<T> {
    const startTime = performance.now()
    const { cacheKey, cacheTTL, enableCache = true, queryName = 'unknown' } = options

    // Try cache first
    if (enableCache && cacheKey) {
      const cached = await CacheManager.get(cacheKey)
      if (cached) {
        this.metrics.cacheHits++
        return cached
      }
      this.metrics.cacheMisses++
    }

    // Execute query
    try {
      const result = await queryFn()
      const duration = performance.now() - startTime

      // Update metrics
      this.updateMetrics(queryName, duration)

      // Cache result if enabled
      if (enableCache && cacheKey && result) {
        await CacheManager.set(cacheKey, result, cacheTTL)
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.updateMetrics(queryName, duration)
      throw error
    }
  }

  // Optimized recipe queries
  async getRecipes(options: QueryOptions = {}): Promise<QueryResult> {
    const cacheKey = CacheManager.generateKey('recipes', 'list', options)
    
    return this.executeQuery(
      async () => {
        const { skip = 0, take = 10, where = {}, orderBy = {}, include = {} } = options

        // Build optimized query
        const queryOptions = {
          skip,
          take,
          where: this.buildWhereClause(where),
          orderBy: this.buildOrderByClause(orderBy),
          include: this.buildIncludeClause(include),
          select: this.buildSelectClause(options.select)
        }

        // Execute query with optimizations
        const [data, total] = await Promise.all([
          this.executeRecipeQuery(queryOptions),
          this.executeRecipeCountQuery(queryOptions.where)
        ])

        return this.buildQueryResult(data, total, skip, take)
      },
      {
        cacheKey,
        cacheTTL: 3600, // 1 hour
        enableCache: options.cache !== false,
        queryName: 'getRecipes'
      }
    )
  }

  // Optimized recipe detail query
  async getRecipeBySlug(slug: string, includeRelated = false): Promise<any> {
    const cacheKey = CacheManager.generateKey('recipe', slug, { includeRelated })
    
    return this.executeQuery(
      async () => {
        const recipe = await this.executeRecipeDetailQuery(slug, includeRelated)
        
        if (!recipe) {
          throw new Error('Recipe not found')
        }

        return recipe
      },
      {
        cacheKey,
        cacheTTL: 7200, // 2 hours
        queryName: 'getRecipeBySlug'
      }
    )
  }

  // Optimized search query
  async searchRecipes(
    query: string,
    filters: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    const cacheKey = CacheManager.generateKey('search', query, { ...filters, ...options })
    
    return this.executeQuery(
      async () => {
        const searchOptions = {
          ...options,
          where: {
            ...this.buildSearchWhereClause(query),
            ...this.buildWhereClause(filters)
          }
        }

        return this.getRecipes(searchOptions)
      },
      {
        cacheKey,
        cacheTTL: 1800, // 30 minutes
        queryName: 'searchRecipes'
      }
    )
  }

  // Optimized popular recipes query
  async getPopularRecipes(limit = 10): Promise<any[]> {
    const cacheKey = CacheManager.generateKey('popular', 'recipes', { limit })
    
    return this.executeQuery(
      async () => {
        return this.executePopularRecipesQuery(limit)
      },
      {
        cacheKey,
        cacheTTL: 3600, // 1 hour
        queryName: 'getPopularRecipes'
      }
    )
  }

  // Optimized related recipes query
  async getRelatedRecipes(recipeId: string, limit = 6): Promise<any[]> {
    const cacheKey = CacheManager.generateKey('related', recipeId, { limit })
    
    return this.executeQuery(
      async () => {
        return this.executeRelatedRecipesQuery(recipeId, limit)
      },
      {
        cacheKey,
        cacheTTL: 7200, // 2 hours
        queryName: 'getRelatedRecipes'
      }
    )
  }

  // Optimized blog post queries
  async getBlogPosts(options: QueryOptions = {}): Promise<QueryResult> {
    const cacheKey = CacheManager.generateKey('blog-posts', 'list', options)
    
    return this.executeQuery(
      async () => {
        const { skip = 0, take = 10, where = {}, orderBy = {} } = options

        const [data, total] = await Promise.all([
          this.executeBlogPostQuery({ skip, take, where, orderBy }),
          this.executeBlogPostCountQuery(where)
        ])

        return this.buildQueryResult(data, total, skip, take)
      },
      {
        cacheKey,
        cacheTTL: 3600, // 1 hour
        queryName: 'getBlogPosts'
      }
    )
  }

  // Optimized categories query
  async getCategories(type?: 'recipe' | 'blog'): Promise<any[]> {
    const cacheKey = CacheManager.generateKey('categories', type || 'all')
    
    return this.executeQuery(
      async () => {
        return this.executeCategoriesQuery(type)
      },
      {
        cacheKey,
        cacheTTL: 86400, // 24 hours
        queryName: 'getCategories'
      }
    )
  }

  // Optimized tags query
  async getTags(type?: 'recipe' | 'blog', limit?: number): Promise<any[]> {
    const cacheKey = CacheManager.generateKey('tags', type || 'all', { limit })
    
    return this.executeQuery(
      async () => {
        return this.executeTagsQuery(type, limit)
      },
      {
        cacheKey,
        cacheTTL: 86400, // 24 hours
        queryName: 'getTags'
      }
    )
  }

  // Batch operations
  async batchCreateRecipes(recipes: any[]): Promise<any[]> {
    return this.executeQuery(
      async () => {
        return this.executeBatchCreateRecipes(recipes)
      },
      {
        queryName: 'batchCreateRecipes',
        enableCache: false
      }
    )
  }

  async batchUpdateRecipes(updates: Array<{ id: string; data: any }>): Promise<any[]> {
    return this.executeQuery(
      async () => {
        return this.executeBatchUpdateRecipes(updates)
      },
      {
        queryName: 'batchUpdateRecipes',
        enableCache: false
      }
    )
  }

  // Query builders
  private buildWhereClause(where: Record<string, any>): any {
    const clause: any = {}

    Object.entries(where).forEach(([key, value]) => {
      if (value === null || value === undefined) return

      if (Array.isArray(value)) {
        clause[key] = { in: value }
      } else if (typeof value === 'object' && value.contains) {
        clause[key] = { contains: value.contains, mode: 'insensitive' }
      } else if (typeof value === 'object' && value.gte) {
        clause[key] = { gte: value.gte }
      } else if (typeof value === 'object' && value.lte) {
        clause[key] = { lte: value.lte }
      } else {
        clause[key] = value
      }
    })

    return clause
  }

  private buildOrderByClause(orderBy: Record<string, 'asc' | 'desc'>): any {
    if (Object.keys(orderBy).length === 0) {
      return { createdAt: 'desc' }
    }

    return orderBy
  }

  private buildIncludeClause(include: Record<string, any>): any {
    const clause: any = {}

    Object.entries(include).forEach(([key, value]) => {
      if (value === true) {
        clause[key] = true
      } else if (typeof value === 'object') {
        clause[key] = value
      }
    })

    return clause
  }

  private buildSelectClause(select?: string[]): any {
    if (!select || select.length === 0) {
      return undefined
    }

    const clause: any = {}
    select.forEach(field => {
      clause[field] = true
    })

    return clause
  }

  private buildSearchWhereClause(query: string): any {
    return {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { ingredients: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } }
      ]
    }
  }

  private buildQueryResult<T>(
    data: T[],
    total: number,
    skip: number,
    take: number
  ): QueryResult<T> {
    const page = Math.floor(skip / take) + 1
    const totalPages = Math.ceil(total / take)

    return {
      data,
      total,
      page,
      limit: take,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      totalPages
    }
  }

  // Mock query implementations (replace with actual database queries)
  private async executeRecipeQuery(options: any): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 50))
    return []
  }

  private async executeRecipeCountQuery(where: any): Promise<number> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 20))
    return 0
  }

  private async executeRecipeDetailQuery(slug: string, includeRelated: boolean): Promise<any> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 30))
    return null
  }

  private async executePopularRecipesQuery(limit: number): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 40))
    return []
  }

  private async executeRelatedRecipesQuery(recipeId: string, limit: number): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 35))
    return []
  }

  private async executeBlogPostQuery(options: any): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 45))
    return []
  }

  private async executeBlogPostCountQuery(where: any): Promise<number> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 25))
    return 0
  }

  private async executeCategoriesQuery(type?: string): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 20))
    return []
  }

  private async executeTagsQuery(type?: string, limit?: number): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 20))
    return []
  }

  private async executeBatchCreateRecipes(recipes: any[]): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 100))
    return []
  }

  private async executeBatchUpdateRecipes(updates: any[]): Promise<any[]> {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 100))
    return []
  }

  // Metrics methods
  private updateMetrics(queryName: string, duration: number): void {
    this.metrics.queryCount++
    this.metrics.totalDuration += duration
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.queryCount

    // Track slow queries
    if (duration > this.slowQueryThreshold) {
      this.metrics.slowQueries.push({
        query: queryName,
        duration,
        timestamp: Date.now()
      })

      // Keep only recent slow queries
      if (this.metrics.slowQueries.length > this.maxSlowQueries) {
        this.metrics.slowQueries.shift()
      }
    }
  }

  // Get performance metrics
  getMetrics(): DatabaseMetrics {
    return { ...this.metrics }
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      queryCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowQueries: [],
      cacheHits: 0,
      cacheMisses: 0
    }
  }

  // Cache invalidation helpers
  async invalidateRecipeCache(recipeId?: string): Promise<void> {
    await CacheManager.invalidateRecipeCache(recipeId)
  }

  async invalidateBlogCache(postId?: string): Promise<void> {
    await CacheManager.invalidateBlogCache(postId)
  }

  async invalidateTaxonomyCache(): Promise<void> {
    await CacheManager.invalidateTaxonomyCache()
  }

  // Query optimization suggestions
  generateOptimizationSuggestions(): string[] {
    const suggestions: string[] = []

    if (this.metrics.averageDuration > 500) {
      suggestions.push('Consider adding database indexes for frequently queried fields')
    }

    if (this.metrics.slowQueries.length > 10) {
      suggestions.push('Multiple slow queries detected - review query optimization')
    }

    const cacheHitRatio = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
    if (cacheHitRatio < 0.5) {
      suggestions.push('Low cache hit ratio - consider increasing cache TTL or improving cache keys')
    }

    if (this.metrics.queryCount > 1000) {
      suggestions.push('High query count - consider query consolidation and batching')
    }

    return suggestions
  }
}

// Export default instance
export const databaseOptimizer = new DatabaseOptimizer()

// Utility functions
export const optimizeQuery = async <T>(
  queryFn: () => Promise<T>,
  options: {
    cacheKey?: string
    cacheTTL?: number
    enableCache?: boolean
    queryName?: string
  } = {}
): Promise<T> => {
  return databaseOptimizer.executeQuery(queryFn, options)
}

export const getOptimizedRecipes = (options: QueryOptions = {}): Promise<QueryResult> => {
  return databaseOptimizer.getRecipes(options)
}

export const getOptimizedRecipeBySlug = (slug: string, includeRelated = false): Promise<any> => {
  return databaseOptimizer.getRecipeBySlug(slug, includeRelated)
}

export const searchOptimizedRecipes = (
  query: string,
  filters: Record<string, any> = {},
  options: QueryOptions = {}
): Promise<QueryResult> => {
  return databaseOptimizer.searchRecipes(query, filters, options)
}

export default databaseOptimizer