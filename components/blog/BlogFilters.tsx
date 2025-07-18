'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface BlogFiltersProps {
  tags: string[]
  categories: string[]
  selectedTag?: string
  selectedCategory?: string
  className?: string
  onFilterChange?: (filters: {
    tag?: string
    category?: string
  }) => void
}

export function BlogFilters({
  tags,
  categories,
  selectedTag,
  selectedCategory,
  className,
  onFilterChange,
}: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? undefined : tag
    
    if (onFilterChange) {
      onFilterChange({ tag: newTag, category: selectedCategory })
    } else {
      updateURL({ tag: newTag, category: selectedCategory })
    }
  }

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    
    if (onFilterChange) {
      onFilterChange({ tag: selectedTag, category: newCategory })
    } else {
      updateURL({ tag: selectedTag, category: newCategory })
    }
  }

  const updateURL = (filters: { tag?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams)
    
    if (filters.tag) {
      params.set('tag', filters.tag)
    } else {
      params.delete('tag')
    }
    
    if (filters.category) {
      params.set('category', filters.category)
    } else {
      params.delete('category')
    }
    
    params.delete('page') // Reset pagination
    
    const queryString = params.toString()
    router.push(`/blog${queryString ? `?${queryString}` : ''}`)
  }

  const clearFilters = () => {
    if (onFilterChange) {
      onFilterChange({})
    } else {
      updateURL({})
    }
  }

  const hasActiveFilters = selectedTag || selectedCategory

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter toggle button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {[selectedTag, selectedCategory].filter(Boolean).length}
            </span>
          )}
          <ChevronDownIcon className={cn('w-4 h-4 transform transition-transform duration-150', isExpanded && 'rotate-180')} />
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2 text-neutral-600"
          >
            <XIcon className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedTag && (
            <Badge
              variant="default"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleTagClick(selectedTag)}
            >
              Tag: {selectedTag}
              <XIcon className="w-3 h-3" />
            </Badge>
          )}
          {selectedCategory && (
            <Badge
              variant="default"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleCategoryClick(selectedCategory)}
            >
              Category: {selectedCategory}
              <XIcon className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Expanded filters */}
      {isExpanded && (
        <div className="p-4 bg-white border-2 border-black shadow-brutal">
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-mono font-semibold text-black mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={cn(
                      'px-3 py-1 text-sm font-mono border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-150',
                      selectedCategory === category
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-black hover:bg-neutral-50'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-mono font-semibold text-black mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      'px-3 py-1 text-sm font-mono border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-150',
                      selectedTag === tag
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-black hover:bg-neutral-50'
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Horizontal filter pills
export function FilterPills({
  tags,
  categories,
  selectedTag,
  selectedCategory,
  className,
  onFilterChange,
}: BlogFiltersProps) {
  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? undefined : tag
    onFilterChange?.({ tag: newTag, category: selectedCategory })
  }

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    onFilterChange?.({ tag: selectedTag, category: newCategory })
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Categories */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={cn(
            'px-3 py-1 text-sm font-mono border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-150',
            selectedCategory === category
              ? 'bg-primary-500 text-white'
              : 'bg-white text-black hover:bg-neutral-50'
          )}
        >
          {category}
        </button>
      ))}
      
      {/* Tags */}
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={cn(
            'px-3 py-1 text-sm font-mono border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-150',
            selectedTag === tag
              ? 'bg-blue-500 text-white'
              : 'bg-white text-black hover:bg-neutral-50'
          )}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

// Sidebar filters
export function SidebarFilters({
  tags,
  categories,
  selectedTag,
  selectedCategory,
  className,
  onFilterChange,
}: BlogFiltersProps) {
  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? undefined : tag
    onFilterChange?.({ tag: newTag, category: selectedCategory })
  }

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    onFilterChange?.({ tag: selectedTag, category: newCategory })
  }

  const hasActiveFilters = selectedTag || selectedCategory

  return (
    <div className={cn('bg-white border-2 border-black shadow-brutal', className)}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono font-bold text-black">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange?.({})}
              className="text-neutral-600"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-mono font-semibold text-black mb-3">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-sm font-mono text-left hover:bg-neutral-50 transition-colors duration-150',
                    selectedCategory === category && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <span>{category}</span>
                  {selectedCategory === category && (
                    <CheckIcon className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-mono font-semibold text-black mb-3">Tags</h4>
            <div className="space-y-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-sm font-mono text-left hover:bg-neutral-50 transition-colors duration-150',
                    selectedTag === tag && 'bg-blue-50 text-blue-700'
                  )}
                >
                  <span>#{tag}</span>
                  {selectedTag === tag && (
                    <CheckIcon className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter dropdown
export function FilterDropdown({
  tags,
  categories,
  selectedTag,
  selectedCategory,
  className,
  onFilterChange,
}: BlogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? undefined : tag
    onFilterChange?.({ tag: newTag, category: selectedCategory })
  }

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    onFilterChange?.({ tag: selectedTag, category: newCategory })
  }

  const hasActiveFilters = selectedTag || selectedCategory

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <FilterIcon className="w-4 h-4" />
        Filter
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
            {[selectedTag, selectedCategory].filter(Boolean).length}
          </span>
        )}
        <ChevronDownIcon className={cn('w-4 h-4 transform transition-transform duration-150', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border-2 border-black shadow-brutal z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-mono font-bold text-black">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-mono font-semibold text-black mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={cn(
                        'px-2 py-1 text-xs font-mono border border-black hover:bg-neutral-50 transition-colors duration-150',
                        selectedCategory === category
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-black'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-mono font-semibold text-black mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        'px-2 py-1 text-xs font-mono border border-black hover:bg-neutral-50 transition-colors duration-150',
                        selectedTag === tag
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-black'
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterChange?.({})}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Icon components
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}