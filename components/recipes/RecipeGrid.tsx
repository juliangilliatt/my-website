'use client'

import { useState, useEffect, useRef } from 'react'
import { Recipe } from '@prisma/client'
import { RecipeCard, RecipeCardSkeleton } from './RecipeCard'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface RecipeGridProps {
  recipes: Recipe[]
  className?: string
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'featured'
  showImage?: boolean
  showDescription?: boolean
  showTags?: boolean
  showActions?: boolean
  isLoading?: boolean
  loadingCount?: number
  hasMore?: boolean
  onLoadMore?: () => void
  onFavorite?: (recipeId: string) => void
  onShare?: (recipe: Recipe) => void
  favoriteRecipes?: string[]
  searchTerm?: string
  emptyState?: React.ReactNode
  gridRef?: React.RefObject<HTMLDivElement>
}

export function RecipeGrid({
  recipes,
  className,
  columns,
  gap = 'md',
  variant = 'default',
  showImage = true,
  showDescription = true,
  showTags = true,
  showActions = true,
  isLoading = false,
  loadingCount = 8,
  hasMore = false,
  onLoadMore,
  onFavorite,
  onShare,
  favoriteRecipes = [],
  searchTerm,
  emptyState,
  gridRef,
}: RecipeGridProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  // Auto-detect responsive columns if not specified
  const getResponsiveColumns = () => {
    if (columns) {
      return {
        'grid-cols-1': columns === 1,
        'grid-cols-2': columns === 2,
        'grid-cols-3': columns === 3,
        'grid-cols-4': columns === 4,
        'grid-cols-5': columns === 5,
        'grid-cols-6': columns === 6,
      }
    }

    // Default responsive behavior
    return {
      'grid-cols-1': true,
      'sm:grid-cols-2': true,
      'md:grid-cols-3': true,
      'lg:grid-cols-4': variant === 'compact',
      'xl:grid-cols-5': variant === 'compact',
      'lg:grid-cols-3': variant === 'default',
      'xl:grid-cols-4': variant === 'default',
      'lg:grid-cols-2': variant === 'featured',
      'xl:grid-cols-3': variant === 'featured',
    }
  }

  const getGapClass = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4'
      case 'lg':
        return 'gap-8'
      default:
        return 'gap-6'
    }
  }

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !onLoadMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, onLoadMore, isLoadingMore])

  const handleLoadMore = async () => {
    if (isLoadingMore || !onLoadMore) return

    setIsLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleFavorite = (recipeId: string) => {
    onFavorite?.(recipeId)
  }

  const handleShare = (recipe: Recipe) => {
    onShare?.(recipe)
  }

  if (isLoading && recipes.length === 0) {
    return (
      <div className={cn('grid', getResponsiveColumns(), getGapClass(), className)} ref={gridRef}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <RecipeCardSkeleton
            key={index}
            variant={variant}
            showImage={showImage}
          />
        ))}
      </div>
    )
  }

  if (recipes.length === 0 && !isLoading) {
    return (
      <div className={cn('text-center py-12', className)}>
        {emptyState || (
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-mono font-bold text-black mb-2">
              No recipes found
            </h3>
            <p className="font-mono text-neutral-600 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => window.location.href = '/recipes'}
              variant="outline"
            >
              View All Recipes
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={cn('grid', getResponsiveColumns(), getGapClass())} ref={gridRef}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            variant={variant}
            showImage={showImage}
            showDescription={showDescription}
            showTags={showTags}
            showActions={showActions}
            onFavorite={handleFavorite}
            onShare={handleShare}
            isFavorited={favoriteRecipes.includes(recipe.id)}
            searchTerm={searchTerm}
          />
        ))}
        
        {/* Loading more cards */}
        {isLoadingMore && (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <RecipeCardSkeleton
                key={`loading-${index}`}
                variant={variant}
                showImage={showImage}
              />
            ))}
          </>
        )}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div className="mt-8 text-center">
          {onLoadMore && (
            <div ref={observerRef} className="pb-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="min-w-32"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Masonry grid variant for varied card heights
export function RecipeMasonryGrid({
  recipes,
  className,
  columns = 3,
  gap = 'md',
  variant = 'default',
  showImage = true,
  showDescription = true,
  showTags = true,
  showActions = true,
  onFavorite,
  onShare,
  favoriteRecipes = [],
  searchTerm,
}: {
  recipes: Recipe[]
  className?: string
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'featured'
  showImage?: boolean
  showDescription?: boolean
  showTags?: boolean
  showActions?: boolean
  onFavorite?: (recipeId: string) => void
  onShare?: (recipe: Recipe) => void
  favoriteRecipes?: string[]
  searchTerm?: string
}) {
  const [columnRecipes, setColumnRecipes] = useState<Recipe[][]>([])

  useEffect(() => {
    // Distribute recipes across columns
    const cols: Recipe[][] = Array.from({ length: columns }, () => [])
    
    recipes.forEach((recipe, index) => {
      const columnIndex = index % columns
      cols[columnIndex].push(recipe)
    })
    
    setColumnRecipes(cols)
  }, [recipes, columns])

  const getGapClass = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4'
      case 'lg':
        return 'gap-8'
      default:
        return 'gap-6'
    }
  }

  const getColumnsClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-2'
      case 4:
        return 'grid-cols-4'
      default:
        return 'grid-cols-3'
    }
  }

  if (recipes.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🍳</div>
          <h3 className="text-xl font-mono font-bold text-black mb-2">
            No recipes found
          </h3>
          <p className="font-mono text-neutral-600">
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('grid', getColumnsClass(), getGapClass(), className)}>
      {columnRecipes.map((columnRecipes, columnIndex) => (
        <div key={columnIndex} className={cn('space-y-6')}>
          {columnRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant={variant}
              showImage={showImage}
              showDescription={showDescription}
              showTags={showTags}
              showActions={showActions}
              onFavorite={onFavorite}
              onShare={onShare}
              isFavorited={favoriteRecipes.includes(recipe.id)}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// List view variant
export function RecipeListView({
  recipes,
  className,
  showImage = true,
  showDescription = true,
  showTags = true,
  showActions = true,
  onFavorite,
  onShare,
  favoriteRecipes = [],
  searchTerm,
}: {
  recipes: Recipe[]
  className?: string
  showImage?: boolean
  showDescription?: boolean
  showTags?: boolean
  showActions?: boolean
  onFavorite?: (recipeId: string) => void
  onShare?: (recipe: Recipe) => void
  favoriteRecipes?: string[]
  searchTerm?: string
}) {
  if (recipes.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🍳</div>
          <h3 className="text-xl font-mono font-bold text-black mb-2">
            No recipes found
          </h3>
          <p className="font-mono text-neutral-600">
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          variant="compact"
          showImage={showImage}
          showDescription={showDescription}
          showTags={showTags}
          showActions={showActions}
          onFavorite={onFavorite}
          onShare={onShare}
          isFavorited={favoriteRecipes.includes(recipe.id)}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  )
}

// Grid view controls
export function RecipeGridControls({
  view,
  onViewChange,
  sortBy,
  onSortChange,
  className,
}: {
  view: 'grid' | 'list' | 'masonry'
  onViewChange: (view: 'grid' | 'list' | 'masonry') => void
  sortBy: string
  onSortChange: (sortBy: string) => void
  className?: string
}) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'time', label: 'Quick First' },
    { value: 'difficulty', label: 'Easy First' },
  ]

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-neutral-600">View:</span>
        <div className="flex border-2 border-black shadow-brutal">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('grid')}
            className="border-r-2 border-black rounded-none"
          >
            <GridIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('list')}
            className="border-r-2 border-black rounded-none"
          >
            <ListIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'masonry' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('masonry')}
            className="rounded-none"
          >
            <MasonryIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-neutral-600">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1 text-sm font-mono bg-white border-2 border-black shadow-brutal focus:shadow-brutal-sm focus:outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Icon components
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function MasonryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  )
}