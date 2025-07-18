import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/recipes/route'
import { mockRecipe, mockFetch, mockFetchError } from '@/lib/test/utils'

// Mock database/ORM
vi.mock('@/lib/database', () => ({
  db: {
    recipe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    }
  }
}))

// Mock authentication
vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn(),
  requireAuth: vi.fn()
}))

describe('/api/recipes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/recipes', () => {
    it('returns list of recipes', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
      expect(data.data[0]).toEqual(mockRecipe)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      })
    })

    it('handles pagination parameters', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(25)

      const request = new NextRequest('http://localhost:3000/api/recipes?page=2&limit=5')
      const response = await GET(request)
      const data = await response.json()

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        where: {},
        orderBy: { createdAt: 'desc' }
      })
      expect(data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5
      })
    })

    it('handles search query', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes?search=chocolate')
      const response = await GET(request)

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          OR: [
            { title: { contains: 'chocolate', mode: 'insensitive' } },
            { description: { contains: 'chocolate', mode: 'insensitive' } },
            { ingredients: { some: { name: { contains: 'chocolate', mode: 'insensitive' } } } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('handles category filter', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes?category=desserts')
      const response = await GET(request)

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          category: { slug: 'desserts' }
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('handles multiple filters', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes?category=desserts&difficulty=easy&cuisine=american')
      const response = await GET(request)

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          category: { slug: 'desserts' },
          difficulty: 'easy',
          cuisine: 'american'
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('handles sorting options', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes?sort=rating')
      const response = await GET(request)

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { rating: 'desc' }
      })
    })

    it('handles database errors', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/recipes')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('validates pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/recipes?page=0&limit=101')
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid pagination parameters')
    })

    it('returns featured recipes only', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes?featured=true')
      const response = await GET(request)

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          featured: true
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('handles tag filtering', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockResolvedValue([mockRecipe])
      mockDb.db.recipe.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/recipes?tags=chocolate,dessert')
      const response = await GET(request)

      expect(mockDb.db.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          tags: {
            some: {
              name: { in: ['chocolate', 'dessert'] }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('POST /api/recipes', () => {
    it('creates a new recipe', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.create.mockResolvedValue(mockRecipe)

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Recipe',
          description: 'A delicious new recipe',
          ingredients: ['flour', 'sugar'],
          instructions: ['Mix ingredients', 'Bake'],
          prepTime: 15,
          cookTime: 30,
          servings: 4,
          difficulty: 'easy',
          category: 'desserts'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data).toEqual(mockRecipe)
    })

    it('validates required fields', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: '',
          description: 'A recipe'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Validation failed')
    })

    it('requires authentication', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockRejectedValue(new Error('Unauthorized'))

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Recipe',
          description: 'A recipe'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('handles duplicate recipe titles', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.create.mockRejectedValue(new Error('Unique constraint failed'))

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Existing Recipe',
          description: 'A recipe'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toBe('Recipe with this title already exists')
    })

    it('validates ingredient format', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Recipe',
          description: 'A recipe',
          ingredients: 'invalid format'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Ingredients must be an array')
    })

    it('validates time values', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Recipe',
          description: 'A recipe',
          prepTime: -5,
          cookTime: 'invalid'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid time values')
    })
  })

  describe('PUT /api/recipes/[id]', () => {
    it('updates an existing recipe', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findUnique.mockResolvedValue(mockRecipe)
      mockDb.db.recipe.update.mockResolvedValue({ ...mockRecipe, title: 'Updated Recipe' })

      const request = new NextRequest('http://localhost:3000/api/recipes/123', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Recipe',
          description: 'Updated description'
        })
      })

      const response = await PUT(request, { params: { id: '123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.title).toBe('Updated Recipe')
    })

    it('returns 404 for non-existent recipe', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/recipes/999', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Recipe'
        })
      })

      const response = await PUT(request, { params: { id: '999' } })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Recipe not found')
    })

    it('prevents unauthorized updates', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user2', email: 'other@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 'user1' })

      const request = new NextRequest('http://localhost:3000/api/recipes/123', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Recipe'
        })
      })

      const response = await PUT(request, { params: { id: '123' } })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized to update this recipe')
    })
  })

  describe('DELETE /api/recipes/[id]', () => {
    it('deletes an existing recipe', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findUnique.mockResolvedValue(mockRecipe)
      mockDb.db.recipe.delete.mockResolvedValue(mockRecipe)

      const request = new NextRequest('http://localhost:3000/api/recipes/123', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: '123' } })

      expect(response.status).toBe(200)
      expect(mockDb.db.recipe.delete).toHaveBeenCalledWith({
        where: { id: '123' }
      })
    })

    it('returns 404 for non-existent recipe', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/recipes/999', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: '999' } })

      expect(response.status).toBe(404)
    })

    it('prevents unauthorized deletions', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user2', email: 'other@example.com' })

      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 'user1' })

      const request = new NextRequest('http://localhost:3000/api/recipes/123', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: '123' } })

      expect(response.status).toBe(403)
    })
  })

  describe('Rate Limiting', () => {
    it('enforces rate limits', async () => {
      // Mock rate limiter
      const mockRateLimit = vi.fn().mockResolvedValue(false)
      vi.mock('@/lib/rate-limit', () => ({
        rateLimit: mockRateLimit
      }))

      const request = new NextRequest('http://localhost:3000/api/recipes')
      const response = await GET(request)

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.error).toBe('Rate limit exceeded')
    })
  })

  describe('Error Handling', () => {
    it('handles malformed JSON', async () => {
      const mockAuth = await import('@/lib/auth')
      mockAuth.requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid JSON')
    })

    it('handles database connection errors', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockRejectedValue(new Error('Connection failed'))

      const request = new NextRequest('http://localhost:3000/api/recipes')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('handles timeout errors', async () => {
      const mockDb = await import('@/lib/database')
      mockDb.db.recipe.findMany.mockRejectedValue(new Error('Timeout'))

      const request = new NextRequest('http://localhost:3000/api/recipes')
      const response = await GET(request)

      expect(response.status).toBe(504)
      const data = await response.json()
      expect(data.error).toBe('Request timeout')
    })
  })
})