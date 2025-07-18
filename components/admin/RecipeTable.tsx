'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { cn } from '@/lib/utils'

interface Recipe {
  id: string
  slug: string
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number
  cookTime: number
  servings: number
  image?: string
  tags: string[]
  author: string
  createdAt: string
  updatedAt: string
  published: boolean
  featured: boolean
}

interface RecipeTableProps {
  className?: string
  searchQuery?: string
  categoryFilter?: string
  statusFilter?: 'all' | 'published' | 'draft'
}

export function RecipeTable({ 
  className, 
  searchQuery = '', 
  categoryFilter = '', 
  statusFilter = 'all' 
}: RecipeTableProps) {
  const { checkPermission } = useAdminAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<keyof Recipe>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchRecipes()
  }, [searchQuery, categoryFilter, statusFilter])

  const fetchRecipes = async () => {
    setIsLoading(true)
    try {
      // Mock data - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          slug: 'chocolate-chip-cookies',
          title: 'Chocolate Chip Cookies',
          description: 'Classic homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.',
          category: 'Desserts',
          difficulty: 'easy',
          prepTime: 15,
          cookTime: 12,
          servings: 24,
          image: '/images/recipes/chocolate-chip-cookies.jpg',
          tags: ['cookies', 'dessert', 'chocolate'],
          author: 'Chef Admin',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          published: true,
          featured: true,
        },
        {
          id: '2',
          slug: 'beef-stew',
          title: 'Hearty Beef Stew',
          description: 'A comforting beef stew with tender meat and vegetables in a rich broth.',
          category: 'Main Courses',
          difficulty: 'medium',
          prepTime: 30,
          cookTime: 120,
          servings: 6,
          image: '/images/recipes/beef-stew.jpg',
          tags: ['beef', 'stew', 'comfort food'],
          author: 'Chef Admin',
          createdAt: '2024-01-08T14:30:00Z',
          updatedAt: '2024-01-09T09:15:00Z',
          published: true,
          featured: false,
        },
        {
          id: '3',
          slug: 'caesar-salad',
          title: 'Classic Caesar Salad',
          description: 'Fresh romaine lettuce with homemade Caesar dressing and parmesan cheese.',
          category: 'Salads',
          difficulty: 'easy',
          prepTime: 20,
          cookTime: 0,
          servings: 4,
          tags: ['salad', 'healthy', 'vegetarian'],
          author: 'Chef Admin',
          createdAt: '2024-01-05T16:45:00Z',
          updatedAt: '2024-01-05T16:45:00Z',
          published: false,
          featured: false,
        },
        {
          id: '4',
          slug: 'spaghetti-carbonara',
          title: 'Spaghetti Carbonara',
          description: 'Traditional Italian pasta dish with eggs, cheese, and pancetta.',
          category: 'Pasta',
          difficulty: 'medium',
          prepTime: 10,
          cookTime: 20,
          servings: 4,
          image: '/images/recipes/spaghetti-carbonara.jpg',
          tags: ['pasta', 'italian', 'eggs'],
          author: 'Chef Admin',
          createdAt: '2024-01-03T12:20:00Z',
          updatedAt: '2024-01-04T08:30:00Z',
          published: true,
          featured: true,
        },
      ]

      // Apply filters
      let filteredRecipes = mockRecipes

      if (searchQuery) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      if (categoryFilter) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.category.toLowerCase() === categoryFilter.toLowerCase()
        )
      }

      if (statusFilter !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe =>
          statusFilter === 'published' ? recipe.published : !recipe.published
        )
      }

      setRecipes(filteredRecipes)
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof Recipe) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedRecipes = [...recipes].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const toggleRecipeSelection = (recipeId: string) => {
    const newSelected = new Set(selectedRecipes)
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId)
    } else {
      newSelected.add(recipeId)
    }
    setSelectedRecipes(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set())
    } else {
      setSelectedRecipes(new Set(recipes.map(recipe => recipe.id)))
    }
  }

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedRecipes)
    console.log(`Bulk action: ${action} on recipes:`, selectedIds)
    
    // Mock action execution
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Clear selection after action
    setSelectedRecipes(new Set())
    
    // Refresh data
    fetchRecipes()
  }

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <LoadingSpinner className="w-8 h-8 mx-auto" />
        <p className="text-center text-neutral-600 font-mono mt-2">Loading recipes...</p>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Actions */}
      {selectedRecipes.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-500 shadow-brutal">
          <span className="font-mono text-sm text-blue-700">
            {selectedRecipes.size} recipe{selectedRecipes.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {checkPermission('recipes:update') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('publish')}
                className="font-mono text-sm"
              >
                Publish
              </Button>
            )}
            {checkPermission('recipes:update') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('unpublish')}
                className="font-mono text-sm"
              >
                Unpublish
              </Button>
            )}
            {checkPermission('recipes:delete') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="font-mono text-sm text-red-600 border-red-500"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b-2 border-black">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRecipes.size === recipes.length && recipes.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-3 text-left font-mono font-bold text-black">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:text-primary-500"
                  >
                    Recipe
                    <SortIcon className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-mono font-bold text-black">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 hover:text-primary-500"
                  >
                    Category
                    <SortIcon className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-mono font-bold text-black">Status</th>
                <th className="px-4 py-3 text-left font-mono font-bold text-black">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 hover:text-primary-500"
                  >
                    Created
                    <SortIcon className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-mono font-bold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRecipes.has(recipe.id)}
                      onChange={() => toggleRecipeSelection(recipe.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {recipe.image && (
                        <div className="relative w-12 h-12 bg-neutral-100 border-2 border-black shadow-brutal-sm overflow-hidden">
                          <Image
                            src={recipe.image}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-mono font-medium text-black">{recipe.title}</div>
                        <div className="text-sm font-mono text-neutral-600">
                          {recipe.prepTime + recipe.cookTime} min • {recipe.servings} servings
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {recipe.featured && (
                            <Badge variant="default" className="font-mono text-xs">
                              Featured
                            </Badge>
                          )}
                          <Badge variant="outline" className={cn('font-mono text-xs', getDifficultyColor(recipe.difficulty))}>
                            {recipe.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {recipe.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('font-mono text-xs', 
                      recipe.published ? 'text-green-600' : 'text-yellow-600'
                    )}>
                      {recipe.published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-mono text-neutral-600">
                      {formatDate(recipe.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/recipes/${recipe.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="p-1">
                          <ViewIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      {checkPermission('recipes:update') && (
                        <Link href={`/admin/recipes/${recipe.id}/edit`}>
                          <Button variant="ghost" size="sm" className="p-1">
                            <EditIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      {checkPermission('recipes:delete') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 text-red-600 hover:text-red-800"
                          onClick={() => handleBulkAction('delete')}
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {recipes.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-mono font-bold text-black mb-2">No recipes found</h3>
          <p className="text-neutral-600 font-mono mb-6">
            {searchQuery || categoryFilter || statusFilter !== 'all'
              ? "Try adjusting your filters or search criteria."
              : "Get started by creating your first recipe."}
          </p>
          {checkPermission('recipes:create') && (
            <Link href="/admin/recipes/create">
              <Button className="font-mono">
                Create Recipe
              </Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}

// Utility functions
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600'
    case 'medium':
      return 'text-yellow-600'
    case 'hard':
      return 'text-red-600'
    default:
      return 'text-neutral-600'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Icon components
function SortIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  )
}

function ViewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}