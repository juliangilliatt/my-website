'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getCategoryIcon, getCategoryColor } from '@/lib/blog-helpers'
import { cn } from '@/lib/utils'

interface BlogCategoriesProps {
  categories: string[]
  selectedCategory?: string
  className?: string
  variant?: 'default' | 'grid' | 'list' | 'pills'
  showCounts?: boolean
  categoryCounts?: Record<string, number>
  onCategoryChange?: (category: string | undefined) => void
}

export function BlogCategories({
  categories,
  selectedCategory,
  className,
  variant = 'default',
  showCounts = false,
  categoryCounts = {},
  onCategoryChange,
}: BlogCategoriesProps) {
  const router = useRouter()

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    
    if (onCategoryChange) {
      onCategoryChange(newCategory)
    } else {
      // Navigate to category page
      if (newCategory) {
        router.push(`/blog?category=${encodeURIComponent(newCategory)}`)
      } else {
        router.push('/blog')
      }
    }
  }

  if (variant === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
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
            <span className="flex items-center gap-1">
              <span>{getCategoryIcon(category)}</span>
              <span>{category}</span>
              {showCounts && categoryCounts[category] && (
                <span className="ml-1 px-1 py-0.5 text-xs bg-neutral-200 text-neutral-700 rounded">
                  {categoryCounts[category]}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
        {categories.map((category) => (
          <Card
            key={category}
            className={cn(
              'group cursor-pointer bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150',
              selectedCategory === category && 'bg-primary-50 border-primary-500'
            )}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="p-4 text-center">
              <div className="text-2xl mb-2">
                {getCategoryIcon(category)}
              </div>
              <h3 className="text-sm font-mono font-semibold text-black mb-1 group-hover:text-primary-500 transition-colors duration-150">
                {category}
              </h3>
              {showCounts && categoryCounts[category] && (
                <p className="text-xs font-mono text-neutral-600">
                  {categoryCounts[category]} {categoryCounts[category] === 1 ? 'post' : 'posts'}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              'flex items-center justify-between w-full px-4 py-3 text-left font-mono bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150',
              selectedCategory === category && 'bg-primary-50 border-primary-500'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <span className="font-semibold text-black">{category}</span>
            </div>
            {showCounts && categoryCounts[category] && (
              <Badge variant="secondary" className="font-mono text-xs">
                {categoryCounts[category]}
              </Badge>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer font-mono hover:bg-neutral-50 transition-colors duration-150',
            selectedCategory === category && 'bg-primary-500 text-white'
          )}
          onClick={() => handleCategoryClick(category)}
        >
          <span className="flex items-center gap-1">
            <span>{getCategoryIcon(category)}</span>
            <span>{category}</span>
            {showCounts && categoryCounts[category] && (
              <span className="ml-1">({categoryCounts[category]})</span>
            )}
          </span>
        </Badge>
      ))}
    </div>
  )
}

// Category navigation with hierarchy
export function HierarchicalCategories({
  categories,
  selectedCategory,
  className,
  categoryHierarchy = {},
  onCategoryChange,
}: {
  categories: string[]
  selectedCategory?: string
  className?: string
  categoryHierarchy?: Record<string, string[]>
  onCategoryChange?: (category: string | undefined) => void
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    onCategoryChange?.(newCategory)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const parentCategories = categories.filter(cat => !Object.values(categoryHierarchy).flat().includes(cat))

  return (
    <div className={cn('space-y-2', className)}>
      {parentCategories.map((category) => {
        const hasChildren = categoryHierarchy[category]?.length > 0
        const isExpanded = expandedCategories.has(category)
        const isSelected = selectedCategory === category

        return (
          <div key={category}>
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category)}
                  className="p-1 hover:bg-neutral-100 transition-colors duration-150"
                >
                  <ChevronRightIcon className={cn('w-4 h-4 transform transition-transform duration-150', isExpanded && 'rotate-90')} />
                </button>
              )}
              <button
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 font-mono text-sm border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150',
                  isSelected ? 'bg-primary-500 text-white' : 'bg-white text-black hover:bg-neutral-50'
                )}
              >
                <span>{getCategoryIcon(category)}</span>
                <span>{category}</span>
              </button>
            </div>
            
            {hasChildren && isExpanded && (
              <div className="ml-8 mt-2 space-y-1">
                {categoryHierarchy[category].map((subCategory) => (
                  <button
                    key={subCategory}
                    onClick={() => handleCategoryClick(subCategory)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 font-mono text-sm border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150',
                      selectedCategory === subCategory ? 'bg-primary-500 text-white' : 'bg-white text-black hover:bg-neutral-50'
                    )}
                  >
                    <span>{getCategoryIcon(subCategory)}</span>
                    <span>{subCategory}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Featured categories
export function FeaturedCategories({
  categories,
  selectedCategory,
  className,
  featuredCategories = [],
  onCategoryChange,
}: {
  categories: string[]
  selectedCategory?: string
  className?: string
  featuredCategories?: string[]
  onCategoryChange?: (category: string | undefined) => void
}) {
  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    onCategoryChange?.(newCategory)
  }

  const featured = categories.filter(cat => featuredCategories.includes(cat))
  const other = categories.filter(cat => !featuredCategories.includes(cat))

  return (
    <div className={cn('space-y-6', className)}>
      {featured.length > 0 && (
        <div>
          <h3 className="text-lg font-mono font-bold text-black mb-4">Featured Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((category) => (
              <Card
                key={category}
                className={cn(
                  'group cursor-pointer bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150',
                  selectedCategory === category && 'bg-primary-50 border-primary-500'
                )}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="p-4 text-center">
                  <div className="text-2xl mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <h4 className="text-sm font-mono font-semibold text-black group-hover:text-primary-500 transition-colors duration-150">
                    {category}
                  </h4>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {other.length > 0 && (
        <div>
          <h3 className="text-lg font-mono font-bold text-black mb-4">All Categories</h3>
          <div className="flex flex-wrap gap-2">
            {other.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer font-mono hover:bg-neutral-50 transition-colors duration-150',
                  selectedCategory === category && 'bg-primary-500 text-white'
                )}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="flex items-center gap-1">
                  <span>{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Category filter with search
export function SearchableCategories({
  categories,
  selectedCategory,
  className,
  onCategoryChange,
}: {
  categories: string[]
  selectedCategory?: string
  className?: string
  onCategoryChange?: (category: string | undefined) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? undefined : category
    onCategoryChange?.(newCategory)
    setIsExpanded(false)
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        <FolderIcon className="w-4 h-4" />
        {selectedCategory || 'All Categories'}
        <ChevronDownIcon className={cn('w-4 h-4 transform transition-transform duration-150', isExpanded && 'rotate-180')} />
      </Button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border-2 border-black shadow-brutal z-50">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal-sm focus:outline-none focus:shadow-brutal mb-4"
            />
            
            <div className="max-h-60 overflow-y-auto space-y-1">
              <button
                onClick={() => handleCategoryClick('')}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-left font-mono text-sm hover:bg-neutral-50 transition-colors duration-150',
                  !selectedCategory && 'bg-primary-50 text-primary-700'
                )}
              >
                <AllIcon className="w-4 h-4" />
                All Categories
              </button>
              
              {filteredCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-left font-mono text-sm hover:bg-neutral-50 transition-colors duration-150',
                    selectedCategory === category && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <span>{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Icon components
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function AllIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}