'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { RecipeFilters as RecipeFiltersType } from '@/hooks/useRecipeSearch'
import { QuickFilterPills, DifficultyFilterPills, TimeFilterPills, TagFilterPills } from './FilterPills'

interface RecipeFiltersProps {
  filters: RecipeFiltersType
  onFiltersChange: (filters: Partial<RecipeFiltersType>) => void
  onClearFilters: () => void
  isOpen?: boolean
  onToggle?: () => void
  className?: string
  variant?: 'sidebar' | 'modal' | 'inline'
  showClearButton?: boolean
  categories?: Array<{ value: string; label: string; count?: number }>
  tags?: Array<{ value: string; label: string; count?: number }>
  resultCount?: number
}

export function RecipeFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen = true,
  onToggle,
  className,
  variant = 'sidebar',
  showClearButton = true,
  categories = [],
  tags = [],
  resultCount,
}: RecipeFiltersProps) {
  const [localFilters, setLocalFilters] = useState<RecipeFiltersType>(filters)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    const filtersChanged = JSON.stringify(localFilters) !== JSON.stringify(filters)
    setHasChanges(filtersChanged)
  }, [localFilters, filters])

  const handleFilterChange = (newFilters: Partial<RecipeFiltersType>) => {
    const updatedFilters = { ...localFilters, ...newFilters }
    setLocalFilters(updatedFilters)
    
    if (variant === 'inline') {
      // Apply changes immediately for inline variant
      onFiltersChange(newFilters)
    }
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setHasChanges(false)
  }

  const handleClearFilters = () => {
    onClearFilters()
    setHasChanges(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.difficulty !== 'all') count++
    if (filters.maxTime > 0) count++
    if (filters.servings > 0) count++
    if (filters.tags.length > 0) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  if (variant === 'modal') {
    return (
      <div className={cn('fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4', !isOpen && 'hidden', className)}>
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-mono font-bold text-black">
                Filter Recipes
              </h2>
              {onToggle && (
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <XIcon className="w-5 h-5" />
                </Button>
              )}
            </div>
            
            <FilterContent
              filters={localFilters}
              onFiltersChange={handleFilterChange}
              categories={categories}
              tags={tags}
            />
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-black">
              <div className="text-sm font-mono text-neutral-600">
                {resultCount !== undefined && (
                  <span>{resultCount} recipes found</span>
                )}
              </div>
              
              <div className="flex gap-3">
                {showClearButton && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear All
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={handleApplyFilters}
                  disabled={!hasChanges}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('w-80 bg-white border-l-2 border-black shadow-brutal', className)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-mono font-bold text-black">
              Filters
            </h2>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          
          <FilterContent
            filters={localFilters}
            onFiltersChange={handleFilterChange}
            categories={categories}
            tags={tags}
          />
          
          {variant !== 'inline' && (
            <div className="flex gap-3 mt-6 pt-6 border-t-2 border-black">
              {showClearButton && (
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  Clear
                </Button>
              )}
              <Button
                variant="default"
                onClick={handleApplyFilters}
                disabled={!hasChanges}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Inline variant
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-mono font-bold text-black">
          Filter Recipes
        </h2>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              {activeFiltersCount} active
            </Badge>
            {showClearButton && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>
      
      <FilterContent
        filters={filters}
        onFiltersChange={onFiltersChange}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}

// Filter content component
function FilterContent({
  filters,
  onFiltersChange,
  categories = [],
  tags = [],
}: {
  filters: RecipeFiltersType
  onFiltersChange: (filters: Partial<RecipeFiltersType>) => void
  categories?: Array<{ value: string; label: string; count?: number }>
  tags?: Array<{ value: string; label: string; count?: number }>
}) {
  const timeRanges = [
    { value: '0', label: 'Any Time' },
    { value: '15', label: 'Under 15 min' },
    { value: '30', label: 'Under 30 min' },
    { value: '60', label: 'Under 1 hour' },
    { value: '120', label: 'Under 2 hours' },
  ]

  const servingOptions = [
    { value: 0, label: 'Any Amount' },
    { value: 1, label: '1 serving' },
    { value: 2, label: '2 servings' },
    { value: 4, label: '4 servings' },
    { value: 6, label: '6+ servings' },
  ]

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-mono font-semibold text-black uppercase tracking-wide mb-3">
            Category
          </h3>
          <QuickFilterPills
            categories={categories}
            selectedCategory={filters.category}
            onCategoryChange={(category) => onFiltersChange({ category })}
            variant="compact"
          />
        </div>
      )}

      {/* Difficulty Filter */}
      <div>
        <h3 className="text-sm font-mono font-semibold text-black uppercase tracking-wide mb-3">
          Difficulty
        </h3>
        <DifficultyFilterPills
          selectedDifficulty={filters.difficulty}
          onDifficultyChange={(difficulty) => onFiltersChange({ difficulty })}
          variant="compact"
        />
      </div>

      {/* Time Filter */}
      <div>
        <h3 className="text-sm font-mono font-semibold text-black uppercase tracking-wide mb-3">
          Cooking Time
        </h3>
        <TimeFilterPills
          timeRanges={timeRanges}
          selectedTime={filters.maxTime.toString()}
          onTimeChange={(time) => onFiltersChange({ maxTime: parseInt(time) })}
          variant="compact"
        />
      </div>

      {/* Servings Filter */}
      <div>
        <h3 className="text-sm font-mono font-semibold text-black uppercase tracking-wide mb-3">
          Servings
        </h3>
        <div className="flex flex-wrap gap-2">
          {servingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFiltersChange({ servings: option.value })}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 text-sm font-mono border-2 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150',
                filters.servings === option.value
                  ? 'bg-primary-500 text-white border-black'
                  : 'bg-white text-black border-black hover:bg-neutral-50'
              )}
            >
              <span className="text-sm">👥</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-mono font-semibold text-black uppercase tracking-wide mb-3">
            Tags
          </h3>
          <TagFilterPills
            tags={tags}
            selectedTags={filters.tags}
            onTagToggle={(tag) => {
              const newTags = filters.tags.includes(tag)
                ? filters.tags.filter(t => t !== tag)
                : [...filters.tags, tag]
              onFiltersChange({ tags: newTags })
            }}
            variant="compact"
            maxVisible={8}
          />
        </div>
      )}
    </div>
  )
}

// Collapsible filter section
export function CollapsibleFilterSection({
  title,
  children,
  defaultOpen = true,
  className,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border-b border-neutral-200 pb-4', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <h3 className="text-sm font-mono font-semibold text-black uppercase tracking-wide">
          {title}
        </h3>
        <ChevronIcon className={cn('w-4 h-4 transition-transform duration-200', isOpen ? 'rotate-180' : '')} />
      </button>
      
      {isOpen && (
        <div className="mt-3 animate-slide-in">
          {children}
        </div>
      )}
    </div>
  )
}

// Quick filters bar
export function QuickFiltersBar({
  filters,
  onFiltersChange,
  categories = [],
  className,
}: {
  filters: RecipeFiltersType
  onFiltersChange: (filters: Partial<RecipeFiltersType>) => void
  categories?: Array<{ value: string; label: string; count?: number }>
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {/* Category quick filter */}
      <div className="flex-1 min-w-0">
        <QuickFilterPills
          categories={categories}
          selectedCategory={filters.category}
          onCategoryChange={(category) => onFiltersChange({ category })}
          variant="compact"
        />
      </div>

      {/* Difficulty quick filter */}
      <div className="flex-shrink-0">
        <DifficultyFilterPills
          selectedDifficulty={filters.difficulty}
          onDifficultyChange={(difficulty) => onFiltersChange({ difficulty })}
          variant="compact"
        />
      </div>
    </div>
  )
}

// Mobile filter sheet
export function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  categories = [],
  tags = [],
  resultCount,
}: {
  isOpen: boolean
  onClose: () => void
  filters: RecipeFiltersType
  onFiltersChange: (filters: Partial<RecipeFiltersType>) => void
  onClearFilters: () => void
  categories?: Array<{ value: string; label: string; count?: number }>
  tags?: Array<{ value: string; label: string; count?: number }>
  resultCount?: number
}) {
  const [localFilters, setLocalFilters] = useState<RecipeFiltersType>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    onClearFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center md:hidden">
      <div className="w-full max-w-lg bg-white border-t-2 border-black shadow-brutal max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-mono font-bold text-black">
              Filter Recipes
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <FilterContent
            filters={localFilters}
            onFiltersChange={(newFilters) => setLocalFilters({ ...localFilters, ...newFilters })}
            categories={categories}
            tags={tags}
          />
          
          <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-black">
            <div className="text-sm font-mono text-neutral-600">
              {resultCount !== undefined && (
                <span>{resultCount} recipes</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All
              </Button>
              <Button variant="default" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}