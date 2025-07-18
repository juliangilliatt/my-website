'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface BlogSearchProps {
  initialQuery?: string
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
}

export function BlogSearch({
  initialQuery = '',
  placeholder = 'Search posts...',
  className,
  onSearch,
  showSuggestions = true,
}: BlogSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestionsList, setShowSuggestionsList] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (onSearch) {
        onSearch(searchQuery)
      } else {
        // Update URL with search query
        const params = new URLSearchParams(searchParams)
        if (searchQuery) {
          params.set('q', searchQuery)
        } else {
          params.delete('q')
        }
        params.delete('page') // Reset pagination
        
        const queryString = params.toString()
        router.push(`/blog${queryString ? `?${queryString}` : ''}`)
      }
    }, 300),
    [onSearch, router, searchParams]
  )

  useEffect(() => {
    if (query !== initialQuery) {
      debouncedSearch(query)
    }
  }, [query, initialQuery, debouncedSearch])

  // Mock suggestions - in real app, this would come from an API
  useEffect(() => {
    if (query.length >= 2 && showSuggestions) {
      const mockSuggestions = [
        'React',
        'Next.js',
        'TypeScript',
        'JavaScript',
        'CSS',
        'HTML',
        'Node.js',
        'Web Development',
        'Frontend',
        'Backend',
        'Full Stack',
        'Tutorial',
        'Tips',
        'Best Practices',
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
      
      setSuggestions(mockSuggestions)
      setShowSuggestionsList(mockSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestionsList(false)
    }
  }, [query, showSuggestions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestionsList(false)
    debouncedSearch(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestionsList(false)
    debouncedSearch(suggestion)
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestionsList(false)
    debouncedSearch('')
  }

  const handleFocus = () => {
    setIsExpanded(true)
    if (suggestions.length > 0) {
      setShowSuggestionsList(true)
    }
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestionsList(false)
      setIsExpanded(false)
    }, 200)
  }

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              'w-full px-4 py-2 pr-20 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm transition-all duration-150',
              isExpanded && 'shadow-brutal-sm'
            )}
          />
          
          {/* Search icon */}
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <SearchIcon className="w-4 h-4 text-neutral-600" />
          </div>
          
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-600 hover:text-black transition-colors duration-150"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Hidden submit button for form submission */}
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border-2 border-black shadow-brutal max-h-60 overflow-y-auto">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left font-mono text-sm hover:bg-neutral-100 transition-colors duration-150"
              >
                <span className="flex items-center gap-2">
                  <SearchIcon className="w-3 h-3 text-neutral-400" />
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact search bar
export function CompactBlogSearch({
  initialQuery = '',
  className,
  onSearch,
}: {
  initialQuery?: string
  className?: string
  onSearch?: (query: string) => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [isExpanded, setIsExpanded] = useState(false)

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch?.(searchQuery)
    }, 300),
    [onSearch]
  )

  useEffect(() => {
    if (query !== initialQuery) {
      debouncedSearch(query)
    }
  }, [query, initialQuery, debouncedSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSearch(query)
  }

  const handleToggle = () => {
    if (isExpanded) {
      setQuery('')
      debouncedSearch('')
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={cn('flex items-center', className)}>
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm transition-all duration-150"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="p-2"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className="flex items-center gap-2"
        >
          <SearchIcon className="w-4 h-4" />
          Search
        </Button>
      )}
    </div>
  )
}

// Search with filters
export function AdvancedBlogSearch({
  initialQuery = '',
  initialCategory = '',
  initialTag = '',
  categories = [],
  tags = [],
  className,
  onSearch,
}: {
  initialQuery?: string
  initialCategory?: string
  initialTag?: string
  categories?: string[]
  tags?: string[]
  className?: string
  onSearch?: (filters: {
    query: string
    category: string
    tag: string
  }) => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [tag, setTag] = useState(initialTag)
  const [isExpanded, setIsExpanded] = useState(false)

  const debouncedSearch = useCallback(
    debounce((filters: { query: string; category: string; tag: string }) => {
      onSearch?.(filters)
    }, 300),
    [onSearch]
  )

  useEffect(() => {
    debouncedSearch({ query, category, tag })
  }, [query, category, tag, debouncedSearch])

  const handleClearAll = () => {
    setQuery('')
    setCategory('')
    setTag('')
  }

  const hasFilters = query || category || tag

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <BlogSearch
          initialQuery={query}
          onSearch={(q) => setQuery(q)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {[query, category, tag].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white border-2 border-black shadow-brutal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono font-medium text-black mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-mono font-medium text-black mb-2">
                Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm"
              >
                <option value="">All Tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 pt-4 border-t-2 border-black">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

// Icon components
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  )
}