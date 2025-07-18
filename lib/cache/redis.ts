// Redis caching utilities for API responses and data caching

import { Redis } from 'ioredis'

// Redis configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'recipe-website:',
  db: 0
}

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  RECIPES: 3600,        // 1 hour
  RECIPE_DETAIL: 7200,  // 2 hours
  BLOG_POSTS: 3600,     // 1 hour
  BLOG_POST_DETAIL: 7200, // 2 hours
  CATEGORIES: 86400,    // 24 hours
  TAGS: 86400,          // 24 hours
  SEARCH_RESULTS: 1800, // 30 minutes
  USER_PREFERENCES: 604800, // 7 days
  POPULAR_RECIPES: 3600,    // 1 hour
  TRENDING_TAGS: 1800,      // 30 minutes
  SITEMAP: 43200,           // 12 hours
  ANALYTICS: 300,           // 5 minutes
  SESSION: 1800,            // 30 minutes
  RATE_LIMIT: 3600,         // 1 hour
  TEMPORARY: 300            // 5 minutes
}

// Cache keys
export const CACHE_KEYS = {
  RECIPES: 'recipes',
  RECIPE_DETAIL: 'recipe',
  BLOG_POSTS: 'blog-posts',
  BLOG_POST_DETAIL: 'blog-post',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  SEARCH: 'search',
  USER_PREFS: 'user-prefs',
  POPULAR: 'popular-recipes',
  TRENDING: 'trending-tags',
  SITEMAP: 'sitemap',
  ANALYTICS: 'analytics',
  RATE_LIMIT: 'rate-limit',
  SESSION: 'session'
}

// Redis client singleton
class RedisClient {
  private client: Redis | null = null
  private connected = false

  constructor() {
    this.connect()
  }

  private async connect() {
    try {
      this.client = new Redis(REDIS_CONFIG)

      this.client.on('connect', () => {
        console.log('Redis: Connected')
        this.connected = true
      })

      this.client.on('error', (error) => {
        console.error('Redis: Connection error', error)
        this.connected = false
      })

      this.client.on('close', () => {
        console.log('Redis: Connection closed')
        this.connected = false
      })

      this.client.on('reconnecting', () => {
        console.log('Redis: Reconnecting...')
      })

      await this.client.ping()
    } catch (error) {
      console.error('Redis: Failed to connect', error)
      this.connected = false
    }
  }

  async get(key: string): Promise<any> {
    if (!this.connected || !this.client) {
      return null
    }

    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis: Get error', error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_TTL.TEMPORARY): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false
    }

    try {
      await this.client.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Redis: Set error', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false
    }

    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Redis: Delete error', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false
    }

    try {
      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      console.error('Redis: Exists error', error)
      return false
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false
    }

    try {
      await this.client.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Redis: Expire error', error)
      return false
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.connected || !this.client) {
      return []
    }

    try {
      return await this.client.keys(pattern)
    } catch (error) {
      console.error('Redis: Keys error', error)
      return []
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false
    }

    try {
      const keys = await this.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Redis: Flush pattern error', error)
      return false
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.connected || !this.client) {
      return 0
    }

    try {
      return await this.client.incrby(key, amount)
    } catch (error) {
      console.error('Redis: Increment error', error)
      return 0
    }
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    if (!this.connected || !this.client) {
      return 0
    }

    try {
      return await this.client.decrby(key, amount)
    } catch (error) {
      console.error('Redis: Decrement error', error)
      return 0
    }
  }

  async ping(): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false
    }

    try {
      const response = await this.client.ping()
      return response === 'PONG'
    } catch (error) {
      console.error('Redis: Ping error', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.connected = false
    }
  }
}

// Global Redis client instance
const redis = new RedisClient()

// Cache utility functions
export class CacheManager {
  // Generate cache key
  static generateKey(type: string, identifier: string, params?: Record<string, any>): string {
    let key = `${type}:${identifier}`
    
    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&')
      key += `:${Buffer.from(sortedParams).toString('base64')}`
    }
    
    return key
  }

  // Get from cache
  static async get(key: string): Promise<any> {
    return await redis.get(key)
  }

  // Set in cache
  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    return await redis.set(key, value, ttl)
  }

  // Delete from cache
  static async delete(key: string): Promise<boolean> {
    return await redis.del(key)
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    return await redis.exists(key)
  }

  // Cache recipes list
  static async cacheRecipes(params: any, recipes: any[], ttl: number = CACHE_TTL.RECIPES): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.RECIPES, 'list', params)
    await redis.set(key, recipes, ttl)
  }

  // Get cached recipes
  static async getCachedRecipes(params: any): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.RECIPES, 'list', params)
    return await redis.get(key)
  }

  // Cache recipe detail
  static async cacheRecipeDetail(slug: string, recipe: any, ttl: number = CACHE_TTL.RECIPE_DETAIL): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.RECIPE_DETAIL, slug)
    await redis.set(key, recipe, ttl)
  }

  // Get cached recipe detail
  static async getCachedRecipeDetail(slug: string): Promise<any | null> {
    const key = this.generateKey(CACHE_KEYS.RECIPE_DETAIL, slug)
    return await redis.get(key)
  }

  // Cache blog posts
  static async cacheBlogPosts(params: any, posts: any[], ttl: number = CACHE_TTL.BLOG_POSTS): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.BLOG_POSTS, 'list', params)
    await redis.set(key, posts, ttl)
  }

  // Get cached blog posts
  static async getCachedBlogPosts(params: any): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.BLOG_POSTS, 'list', params)
    return await redis.get(key)
  }

  // Cache search results
  static async cacheSearchResults(query: string, filters: any, results: any[], ttl: number = CACHE_TTL.SEARCH_RESULTS): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.SEARCH, query, filters)
    await redis.set(key, results, ttl)
  }

  // Get cached search results
  static async getCachedSearchResults(query: string, filters: any): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.SEARCH, query, filters)
    return await redis.get(key)
  }

  // Cache categories
  static async cacheCategories(categories: any[], ttl: number = CACHE_TTL.CATEGORIES): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.CATEGORIES, 'all')
    await redis.set(key, categories, ttl)
  }

  // Get cached categories
  static async getCachedCategories(): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.CATEGORIES, 'all')
    return await redis.get(key)
  }

  // Cache tags
  static async cacheTags(tags: any[], ttl: number = CACHE_TTL.TAGS): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.TAGS, 'all')
    await redis.set(key, tags, ttl)
  }

  // Get cached tags
  static async getCachedTags(): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.TAGS, 'all')
    return await redis.get(key)
  }

  // Cache user preferences
  static async cacheUserPreferences(userId: string, preferences: any, ttl: number = CACHE_TTL.USER_PREFERENCES): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.USER_PREFS, userId)
    await redis.set(key, preferences, ttl)
  }

  // Get cached user preferences
  static async getCachedUserPreferences(userId: string): Promise<any | null> {
    const key = this.generateKey(CACHE_KEYS.USER_PREFS, userId)
    return await redis.get(key)
  }

  // Cache popular recipes
  static async cachePopularRecipes(recipes: any[], ttl: number = CACHE_TTL.POPULAR_RECIPES): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.POPULAR, 'recipes')
    await redis.set(key, recipes, ttl)
  }

  // Get cached popular recipes
  static async getCachedPopularRecipes(): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.POPULAR, 'recipes')
    return await redis.get(key)
  }

  // Cache trending tags
  static async cacheTrendingTags(tags: any[], ttl: number = CACHE_TTL.TRENDING_TAGS): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.TRENDING, 'tags')
    await redis.set(key, tags, ttl)
  }

  // Get cached trending tags
  static async getCachedTrendingTags(): Promise<any[] | null> {
    const key = this.generateKey(CACHE_KEYS.TRENDING, 'tags')
    return await redis.get(key)
  }

  // Invalidate related caches
  static async invalidateRecipeCache(recipeId?: string): Promise<void> {
    if (recipeId) {
      const key = this.generateKey(CACHE_KEYS.RECIPE_DETAIL, recipeId)
      await redis.del(key)
    }
    
    // Clear recipe listings
    await redis.flushPattern(`${CACHE_KEYS.RECIPES}:*`)
    await redis.flushPattern(`${CACHE_KEYS.POPULAR}:*`)
    await redis.flushPattern(`${CACHE_KEYS.SEARCH}:*`)
  }

  // Invalidate blog cache
  static async invalidateBlogCache(postId?: string): Promise<void> {
    if (postId) {
      const key = this.generateKey(CACHE_KEYS.BLOG_POST_DETAIL, postId)
      await redis.del(key)
    }
    
    // Clear blog listings
    await redis.flushPattern(`${CACHE_KEYS.BLOG_POSTS}:*`)
    await redis.flushPattern(`${CACHE_KEYS.SEARCH}:*`)
  }

  // Invalidate categories/tags cache
  static async invalidateTaxonomyCache(): Promise<void> {
    await redis.flushPattern(`${CACHE_KEYS.CATEGORIES}:*`)
    await redis.flushPattern(`${CACHE_KEYS.TAGS}:*`)
    await redis.flushPattern(`${CACHE_KEYS.TRENDING}:*`)
  }

  // Rate limiting
  static async checkRateLimit(identifier: string, limit: number, window: number = CACHE_TTL.RATE_LIMIT): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.generateKey(CACHE_KEYS.RATE_LIMIT, identifier)
    const current = await redis.get(key) || 0
    
    if (current >= limit) {
      const ttl = await redis.client?.ttl(key) || 0
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (ttl * 1000)
      }
    }
    
    const newCount = await redis.increment(key)
    if (newCount === 1) {
      await redis.expire(key, window)
    }
    
    return {
      allowed: true,
      remaining: limit - newCount,
      resetTime: Date.now() + (window * 1000)
    }
  }

  // Session management
  static async setSession(sessionId: string, data: any, ttl: number = CACHE_TTL.SESSION): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.SESSION, sessionId)
    await redis.set(key, data, ttl)
  }

  static async getSession(sessionId: string): Promise<any | null> {
    const key = this.generateKey(CACHE_KEYS.SESSION, sessionId)
    return await redis.get(key)
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.SESSION, sessionId)
    await redis.del(key)
  }

  // Analytics caching
  static async cacheAnalytics(type: string, data: any, ttl: number = CACHE_TTL.ANALYTICS): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.ANALYTICS, type)
    await redis.set(key, data, ttl)
  }

  static async getCachedAnalytics(type: string): Promise<any | null> {
    const key = this.generateKey(CACHE_KEYS.ANALYTICS, type)
    return await redis.get(key)
  }

  // Health check
  static async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now()
    const isHealthy = await redis.ping()
    const latency = Date.now() - start
    
    return {
      healthy: isHealthy,
      latency
    }
  }

  // Cache statistics
  static async getCacheStats(): Promise<any> {
    if (!redis.client) {
      return null
    }

    try {
      const info = await redis.client.info('memory')
      const keyspace = await redis.client.info('keyspace')
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: redis.connected
      }
    } catch (error) {
      console.error('Redis: Stats error', error)
      return null
    }
  }
}

// Export Redis client and cache manager
export { redis, RedisClient }
export default CacheManager