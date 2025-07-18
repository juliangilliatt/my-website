'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface NoResultsProps {
  searchTerm?: string
  activeFilters?: Array<{ label: string; value: string }>
  suggestions?: string[]
  popularRecipes?: Array<{ title: string; slug: string; category: string }>
  onClearFilters?: () => void
  onClearSearch?: () => void
  onReset?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'detailed'
}

export function NoResults({
  searchTerm,
  activeFilters = [],
  suggestions = [],
  popularRecipes = [],
  onClearFilters,
  onClearSearch,
  onReset,
  className,
  variant = 'default',
}: NoResultsProps) {
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showPopular, setShowPopular] = useState(true)

  const hasActiveFilters = activeFilters.length > 0
  const hasSearchTerm = searchTerm && searchTerm.length > 0
  const hasSuggestions = suggestions.length > 0
  const hasPopularRecipes = popularRecipes.length > 0

  if (variant === 'minimal') {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-mono font-semibold text-black mb-2">
          No recipes found
        </h3>
        <p className="font-mono text-sm text-neutral-600 mb-4">
          Try adjusting your search or filters
        </p>
        <div className="flex justify-center gap-2">
          {hasSearchTerm && onClearSearch && (
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Clear Search
            </Button>
          )}
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('max-w-4xl mx-auto py-12', className)}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍳</div>
          <h2 className="text-3xl font-mono font-bold text-black mb-4">
            No recipes found
          </h2>
          
          {hasSearchTerm && (
            <p className="text-lg font-mono text-neutral-600 mb-2">
              We couldn't find any recipes matching "<span className="text-black font-semibold">{searchTerm}</span>"
            </p>
          )}
          
          {hasActiveFilters && (
            <div className="flex justify-center mb-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-mono text-neutral-600">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {filter.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search suggestions */}
          {hasSuggestions && showSuggestions && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono font-semibold text-black">
                  Try searching for:
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => window.location.href = `/recipes?q=${encodeURIComponent(suggestion)}`}
                    className="block w-full text-left px-3 py-2 text-sm font-mono text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Popular recipes */}
          {hasPopularRecipes && showPopular && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono font-semibold text-black">
                  Popular recipes:
                </h3>
                <button
                  onClick={() => setShowPopular(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {popularRecipes.slice(0, 5).map((recipe, index) => (
                  <Link
                    key={index}
                    href={`/recipes/${recipe.slug}`}
                    className="block px-3 py-2 text-sm font-mono text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span>{recipe.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {recipe.category}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-mono font-semibold text-black mb-4">
              What you can do:
            </h3>
            <div className="space-y-3">
              {hasSearchTerm && onClearSearch && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onClearSearch}
                >
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Clear search term
                </Button>
              )}
              {hasActiveFilters && onClearFilters && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onClearFilters}
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              )}
              {onReset && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onReset}
                >
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Reset search
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = '/recipes'}
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                View all recipes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="max-w-lg mx-auto">
        <div className="text-6xl mb-6">🍳</div>
        
        <h2 className="text-2xl font-mono font-bold text-black mb-4">
          No recipes found
        </h2>
        
        {hasSearchTerm && (
          <p className="font-mono text-neutral-600 mb-2">
            We couldn't find any recipes matching "<span className="text-black font-semibold">{searchTerm}</span>"
          </p>
        )}
        
        {hasActiveFilters && (
          <div className="flex justify-center mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-mono text-neutral-600">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <p className="font-mono text-sm text-neutral-600">
            Try adjusting your search terms or removing some filters to see more results.
          </p>
          
          {hasSuggestions && (
            <div className="text-sm font-mono text-neutral-600">
              <p className="mb-2">You might want to try:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => window.location.href = `/recipes?q=${encodeURIComponent(suggestion)}`}
                    className="px-2 py-1 bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 transition-colors duration-150 text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-3">
          {hasSearchTerm && onClearSearch && (
            <Button variant="outline" onClick={onClearSearch}>
              Clear Search
            </Button>
          )}
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
          {onReset && (
            <Button variant="default" onClick={onReset}>
              Reset All
            </Button>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="font-mono text-sm text-neutral-600 mb-4">
            Or browse our popular categories:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['main-course', 'desserts', 'appetizers', 'vegetarian'].map((category) => (
              <Link
                key={category}
                href={`/recipes?category=${category}`}
                className="px-3 py-1 bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 text-sm font-mono text-black hover:bg-neutral-50"
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty state for when there are no recipes at all
export function EmptyRecipesState({
  title = "No recipes yet",
  description = "There are no recipes to display. Check back later or try adjusting your search.",
  showCreateButton = false,
  onCreateClick,
  className,
}: {
  title?: string
  description?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  className?: string
}) {
  return (
    <div className={cn('text-center py-16', className)}>
      <div className="max-w-md mx-auto">
        <div className="text-8xl mb-6">🍽️</div>
        
        <h2 className="text-2xl font-mono font-bold text-black mb-4">
          {title}
        </h2>
        
        <p className="font-mono text-neutral-600 mb-8">
          {description}
        </p>
        
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Go Home
          </Button>
          
          {showCreateButton && onCreateClick && (
            <Button variant="default" onClick={onCreateClick}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading state placeholder
export function NoResultsLoading({ className }: { className?: string }) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="max-w-lg mx-auto">
        <div className="text-6xl mb-6 animate-pulse">🔍</div>
        
        <div className="space-y-4">
          <div className="h-8 w-48 bg-neutral-200 animate-pulse mx-auto" />
          <div className="h-4 w-64 bg-neutral-200 animate-pulse mx-auto" />
          <div className="h-4 w-56 bg-neutral-200 animate-pulse mx-auto" />
        </div>
        
        <div className="flex justify-center gap-3 mt-6">
          <div className="h-10 w-24 bg-neutral-200 animate-pulse" />
          <div className="h-10 w-24 bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Icon components
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}