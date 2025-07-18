'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { getCategoryColor, getCategoryIcon, getDifficultyColor, getDifficultyIcon } from '@/lib/utils/recipe-helpers'

interface FilterPill {
  id: string
  label: string
  value: string
  type: 'category' | 'difficulty' | 'time' | 'servings' | 'tag' | 'custom'
  icon?: string
  color?: string
  count?: number
  removable?: boolean
}

interface FilterPillsProps {
  filters: FilterPill[]
  onRemove: (filterId: string) => void
  onClear?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'rounded'
  showCounts?: boolean
  showClearAll?: boolean
  maxVisible?: number
}

export function FilterPills({
  filters,
  onRemove,
  onClear,
  className,
  variant = 'default',
  showCounts = false,
  showClearAll = true,
  maxVisible,
}: FilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const getPillColor = (filter: FilterPill) => {
    if (filter.color) return filter.color
    
    switch (filter.type) {
      case 'category':
        return getCategoryColor(filter.value)
      case 'difficulty':
        return getDifficultyColor(filter.value)
      case 'time':
        return 'bg-blue-100 text-blue-800 border-blue-500'
      case 'servings':
        return 'bg-green-100 text-green-800 border-green-500'
      case 'tag':
        return 'bg-purple-100 text-purple-800 border-purple-500'
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-500'
    }
  }

  const getPillIcon = (filter: FilterPill) => {
    if (filter.icon) return filter.icon
    
    switch (filter.type) {
      case 'category':
        return getCategoryIcon(filter.value)
      case 'difficulty':
        return getDifficultyIcon(filter.value)
      case 'time':
        return '⏱️'
      case 'servings':
        return '👥'
      case 'tag':
        return '🏷️'
      default:
        return ''
    }
  }

  const visibleFilters = maxVisible ? filters.slice(0, maxVisible) : filters
  const hiddenCount = maxVisible ? Math.max(0, filters.length - maxVisible) : 0

  if (filters.length === 0) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        {/* Scroll left button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="flex-shrink-0 p-2 hidden sm:flex"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        {/* Scrollable pills container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {visibleFilters.map((filter) => (
            <FilterPill
              key={filter.id}
              filter={filter}
              onRemove={onRemove}
              variant={variant}
              showCount={showCounts}
              color={getPillColor(filter)}
              icon={getPillIcon(filter)}
            />
          ))}
          
          {/* Hidden count indicator */}
          {hiddenCount > 0 && (
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              +{hiddenCount} more
            </Badge>
          )}
        </div>

        {/* Scroll right button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="flex-shrink-0 p-2 hidden sm:flex"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>

        {/* Clear all button */}
        {showClearAll && filters.length > 1 && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="flex-shrink-0 text-xs text-neutral-500 hover:text-neutral-700"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}

// Individual filter pill component
function FilterPill({
  filter,
  onRemove,
  variant = 'default',
  showCount = false,
  color,
  icon,
}: {
  filter: FilterPill
  onRemove: (filterId: string) => void
  variant?: 'default' | 'compact' | 'rounded'
  showCount?: boolean
  color?: string
  icon?: string
}) {
  const baseClasses = cn(
    'inline-flex items-center gap-1 px-3 py-1 text-sm font-mono border-2 shadow-brutal-sm transition-all duration-150',
    variant === 'rounded' && 'rounded-full',
    variant === 'compact' && 'px-2 py-0.5 text-xs',
    color || 'bg-neutral-100 text-neutral-800 border-neutral-500'
  )

  const handleRemove = () => {
    onRemove(filter.id)
  }

  return (
    <div className={baseClasses}>
      {icon && (
        <span className="text-sm">{icon}</span>
      )}
      <span className="whitespace-nowrap">{filter.label}</span>
      {showCount && filter.count !== undefined && (
        <span className="text-xs opacity-75">({filter.count})</span>
      )}
      {filter.removable !== false && (
        <button
          onClick={handleRemove}
          className="ml-1 p-0.5 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors duration-150"
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// Quick filter pills for common categories
export function QuickFilterPills({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  className,
  variant = 'default',
}: {
  categories?: Array<{ value: string; label: string; count?: number }>
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'rounded'
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const allCategories = [
    { value: 'all', label: 'All Recipes', count: undefined },
    ...categories,
  ]

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        {/* Scroll left button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="flex-shrink-0 p-2 hidden sm:flex"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        {/* Scrollable pills container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange?.(category.value)}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 text-sm font-mono border-2 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150 whitespace-nowrap',
                variant === 'rounded' && 'rounded-full',
                variant === 'compact' && 'px-2 py-0.5 text-xs',
                selectedCategory === category.value
                  ? 'bg-primary-500 text-white border-black'
                  : 'bg-white text-black border-black hover:bg-neutral-50'
              )}
            >
              {category.value !== 'all' && (
                <span className="text-sm">{getCategoryIcon(category.value)}</span>
              )}
              <span>{category.label}</span>
              {category.count !== undefined && (
                <span className="text-xs opacity-75">({category.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Scroll right button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="flex-shrink-0 p-2 hidden sm:flex"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Difficulty filter pills
export function DifficultyFilterPills({
  difficulties = ['easy', 'medium', 'hard'],
  selectedDifficulty = 'all',
  onDifficultyChange,
  className,
  variant = 'default',
}: {
  difficulties?: string[]
  selectedDifficulty?: string
  onDifficultyChange?: (difficulty: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'rounded'
}) {
  const allDifficulties = [
    { value: 'all', label: 'All Levels' },
    ...difficulties.map(difficulty => ({
      value: difficulty,
      label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    })),
  ]

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {allDifficulties.map((difficulty) => (
        <button
          key={difficulty.value}
          onClick={() => onDifficultyChange?.(difficulty.value)}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1 text-sm font-mono border-2 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150',
            variant === 'rounded' && 'rounded-full',
            variant === 'compact' && 'px-2 py-0.5 text-xs',
            selectedDifficulty === difficulty.value
              ? 'bg-primary-500 text-white border-black'
              : cn(
                  'bg-white border-black hover:bg-neutral-50',
                  difficulty.value !== 'all' && getDifficultyColor(difficulty.value)
                )
          )}
        >
          {difficulty.value !== 'all' && (
            <span className="text-sm">{getDifficultyIcon(difficulty.value)}</span>
          )}
          <span>{difficulty.label}</span>
        </button>
      ))}
    </div>
  )
}

// Time filter pills
export function TimeFilterPills({
  timeRanges = [
    { value: '0', label: 'Any Time' },
    { value: '30', label: 'Under 30 min' },
    { value: '60', label: 'Under 1 hour' },
    { value: '120', label: 'Under 2 hours' },
  ],
  selectedTime = '0',
  onTimeChange,
  className,
  variant = 'default',
}: {
  timeRanges?: Array<{ value: string; label: string }>
  selectedTime?: string
  onTimeChange?: (time: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'rounded'
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {timeRanges.map((timeRange) => (
        <button
          key={timeRange.value}
          onClick={() => onTimeChange?.(timeRange.value)}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1 text-sm font-mono border-2 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150',
            variant === 'rounded' && 'rounded-full',
            variant === 'compact' && 'px-2 py-0.5 text-xs',
            selectedTime === timeRange.value
              ? 'bg-primary-500 text-white border-black'
              : 'bg-white text-black border-black hover:bg-neutral-50'
          )}
        >
          <span className="text-sm">⏱️</span>
          <span>{timeRange.label}</span>
        </button>
      ))}
    </div>
  )
}

// Tag filter pills
export function TagFilterPills({
  tags = [],
  selectedTags = [],
  onTagToggle,
  className,
  variant = 'default',
  maxVisible = 10,
}: {
  tags?: Array<{ value: string; label: string; count?: number }>
  selectedTags?: string[]
  onTagToggle?: (tag: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'rounded'
  maxVisible?: number
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleTags = showAll ? tags : tags.slice(0, maxVisible)
  const hasMore = tags.length > maxVisible

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => (
          <button
            key={tag.value}
            onClick={() => onTagToggle?.(tag.value)}
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 text-sm font-mono border-2 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150',
              variant === 'rounded' && 'rounded-full',
              variant === 'compact' && 'px-2 py-0.5 text-xs',
              selectedTags.includes(tag.value)
                ? 'bg-primary-500 text-white border-black'
                : 'bg-white text-black border-black hover:bg-neutral-50'
            )}
          >
            <span className="text-sm">🏷️</span>
            <span>{tag.label}</span>
            {tag.count !== undefined && (
              <span className="text-xs opacity-75">({tag.count})</span>
            )}
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-sm font-mono text-neutral-500 hover:text-neutral-700 transition-colors duration-150"
        >
          {showAll ? 'Show Less' : `Show ${tags.length - maxVisible} More`}
        </button>
      )}
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}