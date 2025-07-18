'use client'

import { useState, useEffect } from 'react'
import { useRecipeSearch, RecipeFilters } from '@/hooks/useRecipeSearch'
import { AdvancedSearchBar } from './SearchBar'
import { RecipeGrid, RecipeGridControls } from './RecipeGrid'
import { RecipeFilters as RecipeFiltersComponent, QuickFiltersBar, MobileFilterSheet } from './RecipeFilters'
import { FilterPills } from './FilterPills'
import { NoResults } from './NoResults'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface RecipeSearchInterfaceProps {
  initialQuery?: string
  initialFilters?: Partial<RecipeFilters>
  initialSort?: string
  initialPage?: number
  initialView?: 'grid' | 'list'
  className?: string
}

export function RecipeSearchInterface({
  initialQuery = '',
  initialFilters = {},
  initialSort = 'newest',
  initialPage = 1,
  initialView = 'grid',
  className,
}: RecipeSearchInterfaceProps) {
  const [view, setView] = useState<'grid' | 'list' | 'masonry'>(initialView)
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([])

  const {
    query,
    filters,
    sortBy,
    isLoading,
    results,
    totalResults,
    currentPage,
    totalPages,
    hasMore,
    hasActiveFilters,
    hasSearchQuery,
    isEmpty,
    searchSummary,
    setQuery,
    setFilters,
    setSortBy,
    setPage,
    clearFilters,
    clearSearch,
    reset,
  } = useRecipeSearch()

  // Initialize with props
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
    if (Object.keys(initialFilters).length > 0) setFilters(initialFilters)
    if (initialSort) setSortBy(initialSort)
    if (initialPage > 1) setPage(initialPage)
  }, [initialQuery, initialFilters, initialSort, initialPage, setQuery, setFilters, setSortBy, setPage])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteRecipes')
    if (savedFavorites) {
      try {
        setFavoriteRecipes(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
  }, [])

  const handleFavorite = (recipeId: string) => {
    setFavoriteRecipes(prev => {
      const newFavorites = prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
      
      try {
        localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites))
      } catch (error) {
        console.error('Error saving favorites:', error)
      }
      
      return newFavorites
    })
  }

  const handleShare = (recipe: any) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: `/recipes/${recipe.slug}`,
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/recipes/${recipe.slug}`)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage(currentPage + 1)
    }
  }

  const getActiveFilterPills = () => {
    const pills = []
    
    if (filters.category !== 'all') {
      pills.push({
        id: 'category',
        label: filters.category.charAt(0).toUpperCase() + filters.category.slice(1).replace('-', ' '),
        value: filters.category,
        type: 'category' as const,
      })
    }
    
    if (filters.difficulty !== 'all') {
      pills.push({
        id: 'difficulty',
        label: filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1),
        value: filters.difficulty,
        type: 'difficulty' as const,
      })
    }
    
    if (filters.maxTime > 0) {
      pills.push({
        id: 'maxTime',
        label: `Under ${filters.maxTime} min`,
        value: filters.maxTime.toString(),
        type: 'time' as const,
      })
    }
    
    if (filters.servings > 0) {
      pills.push({
        id: 'servings',
        label: `${filters.servings} servings`,
        value: filters.servings.toString(),
        type: 'servings' as const,
      })
    }
    
    filters.tags.forEach(tag => {
      pills.push({
        id: `tag-${tag}`,
        label: tag,
        value: tag,
        type: 'tag' as const,
      })
    })
    
    return pills
  }

  const handleRemoveFilter = (filterId: string) => {
    if (filterId === 'category') {
      setFilters({ category: 'all' })
    } else if (filterId === 'difficulty') {
      setFilters({ difficulty: 'all' })
    } else if (filterId === 'maxTime') {
      setFilters({ maxTime: 0 })
    } else if (filterId === 'servings') {
      setFilters({ servings: 0 })
    } else if (filterId.startsWith('tag-')) {
      const tagToRemove = filterId.replace('tag-', '')
      setFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) })
    }
  }

  const activeFilterPills = getActiveFilterPills()

  // Mock data for categories and tags (in real app, fetch from API)
  const categories = [
    { value: 'appetizers', label: 'Appetizers', count: 25 },
    { value: 'main-course', label: 'Main Course', count: 45 },
    { value: 'desserts', label: 'Desserts', count: 30 },
    { value: 'beverages', label: 'Beverages', count: 15 },
    { value: 'breakfast', label: 'Breakfast', count: 20 },
    { value: 'lunch', label: 'Lunch', count: 35 },
    { value: 'dinner', label: 'Dinner', count: 50 },
    { value: 'snacks', label: 'Snacks', count: 18 },
    { value: 'vegetarian', label: 'Vegetarian', count: 28 },
    { value: 'vegan', label: 'Vegan', count: 22 },
  ]

  const tags = [
    { value: 'gluten-free', label: 'Gluten Free', count: 15 },
    { value: 'dairy-free', label: 'Dairy Free', count: 12 },
    { value: 'low-carb', label: 'Low Carb', count: 18 },
    { value: 'keto', label: 'Keto', count: 10 },
    { value: 'paleo', label: 'Paleo', count: 8 },
    { value: 'quick-easy', label: 'Quick & Easy', count: 25 },
    { value: 'one-pot', label: 'One Pot', count: 14 },
    { value: 'meal-prep', label: 'Meal Prep', count: 16 },
    { value: 'kid-friendly', label: 'Kid Friendly', count: 20 },
    { value: 'healthy', label: 'Healthy', count: 30 },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Bar */}
      <AdvancedSearchBar
        value={query}
        onChange={setQuery}
        onFiltersToggle={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        placeholder="Search recipes by name, ingredient, or category..."
      />

      {/* Quick Filters */}
      <QuickFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* Active Filter Pills */}
      {activeFilterPills.length > 0 && (
        <FilterPills
          filters={activeFilterPills}
          onRemove={handleRemoveFilter}
          onClear={clearFilters}
          showClearAll={true}
        />
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-mono text-sm text-neutral-600">
            {searchSummary}
          </p>
          
          {hasSearchQuery && (
            <Badge variant="outline" className="text-xs">
              "{query}"
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </Button>

          {/* Grid controls */}
          <RecipeGridControls
            view={view}
            onViewChange={setView}
            sortBy={sortBy}
            onSortChange={setSortBy}
            className="hidden md:flex"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar Filters (Desktop) */}
        {showFilters && (
          <div className="hidden md:block">
            <RecipeFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              variant="sidebar"
              categories={categories}
              tags={tags}
              resultCount={totalResults}
            />
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isEmpty ? (
            <NoResults
              searchTerm={query}
              activeFilters={activeFilterPills.map(pill => ({ label: pill.label, value: pill.value }))}
              suggestions={['pasta', 'chicken', 'vegetarian', 'dessert', 'quick meal']}
              popularRecipes={[
                { title: 'Spaghetti Carbonara', slug: 'spaghetti-carbonara', category: 'main-course' },
                { title: 'Chocolate Chip Cookies', slug: 'chocolate-chip-cookies', category: 'desserts' },
                { title: 'Caesar Salad', slug: 'caesar-salad', category: 'appetizers' },
              ]}
              onClearFilters={clearFilters}
              onClearSearch={clearSearch}
              onReset={reset}
            />
          ) : (
            <RecipeGrid
              recipes={results}
              variant={view === 'list' ? 'compact' : 'default'}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onFavorite={handleFavorite}
              onShare={handleShare}
              favoriteRecipes={favoriteRecipes}
              searchTerm={query}
              emptyState={
                <NoResults
                  searchTerm={query}
                  activeFilters={activeFilterPills.map(pill => ({ label: pill.label, value: pill.value }))}
                  onClearFilters={clearFilters}
                  onClearSearch={clearSearch}
                  onReset={reset}
                />
              }
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        categories={categories}
        tags={tags}
        resultCount={totalResults}
      />
    </div>
  )
}

// Icon component
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  )
}