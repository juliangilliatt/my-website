'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchSuggestions, useSearchHistory } from '@/hooks/useRecipeSearch'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'rounded'
  showSuggestions?: boolean
  showHistory?: boolean
  showClear?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search recipes...',
  className,
  size = 'md',
  variant = 'default',
  showSuggestions = true,
  showHistory = true,
  showClear = true,
  autoFocus = false,
  disabled = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(value, 5)
  const { history, addToHistory, removeFromHistory } = useSearchHistory(8)

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }

  const inputClasses = cn(
    'w-full font-mono bg-white border-2 border-black shadow-brutal focus:shadow-brutal-sm focus:outline-none transition-all duration-150',
    sizeClasses[size],
    variant === 'rounded' && 'rounded-full',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  )

  const buttonClasses = cn(
    'absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-black transition-colors duration-150',
    size === 'sm' && 'right-1',
    size === 'lg' && 'right-3 p-2'
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (newValue.length > 0 && (showSuggestions || showHistory)) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if ((value.length > 0 && showSuggestions) || (showHistory && history.length > 0)) {
      setShowDropdown(true)
    }
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    // Delay hiding dropdown to allow clicks on suggestions
    setTimeout(() => setShowDropdown(false), 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      addToHistory(value.trim())
      onSubmit?.(value.trim())
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    addToHistory(suggestion)
    onSubmit?.(suggestion)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  const handleHistoryClick = (historyItem: string) => {
    onChange(historyItem)
    onSubmit?.(historyItem)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    onChange('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const showHistoryItems = showHistory && history.length > 0 && value.length === 0
  const showSuggestionItems = showSuggestions && suggestions.length > 0 && value.length > 1
  const hasDropdownContent = showHistoryItems || showSuggestionItems

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          autoFocus={autoFocus}
        />
        
        {/* Search icon */}
        <div className={cn(buttonClasses, 'pointer-events-none')}>
          <SearchIcon className="w-5 h-5" />
        </div>

        {/* Clear button */}
        {showClear && value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(buttonClasses, 'mr-8 hover:bg-neutral-100 rounded-full')}
            disabled={disabled}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown with suggestions and history */}
      {showDropdown && hasDropdownContent && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black shadow-brutal z-50 max-h-64 overflow-y-auto"
        >
          {/* Search History */}
          {showHistoryItems && (
            <div className="p-2 border-b-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono font-semibold text-neutral-600 uppercase tracking-wide">
                  Recent Searches
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => history.forEach(removeFromHistory)}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-1">
                {history.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyItem)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-left hover:bg-neutral-50 transition-colors duration-150"
                  >
                    <ClockIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{historyItem}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromHistory(historyItem)
                      }}
                      className="ml-auto p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {showSuggestionItems && (
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono font-semibold text-neutral-600 uppercase tracking-wide">
                  Suggestions
                </h4>
                {suggestionsLoading && (
                  <div className="text-xs text-neutral-500">Loading...</div>
                )}
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-left hover:bg-neutral-50 transition-colors duration-150"
                  >
                    <SearchIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No suggestions */}
          {showSuggestions && value.length > 1 && suggestions.length === 0 && !suggestionsLoading && (
            <div className="p-4 text-center text-sm font-mono text-neutral-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact search bar for mobile/small spaces
export function CompactSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  className,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit?.(value.trim())
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-8 text-sm font-mono bg-white border-2 border-black shadow-brutal focus:shadow-brutal-sm focus:outline-none transition-all duration-150"
        disabled={disabled}
      />
      
      {value.length > 0 ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-black transition-colors duration-150"
          disabled={disabled}
        >
          <XIcon className="w-4 h-4" />
        </button>
      ) : (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 pointer-events-none">
          <SearchIcon className="w-4 h-4" />
        </div>
      )}
    </form>
  )
}

// Search bar with advanced filters toggle
export function AdvancedSearchBar({
  value,
  onChange,
  onSubmit,
  onFiltersToggle,
  showFilters = false,
  hasActiveFilters = false,
  placeholder = 'Search recipes...',
  className,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  onFiltersToggle?: () => void
  showFilters?: boolean
  hasActiveFilters?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <SearchBar
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
          disabled={disabled}
          showSuggestions={true}
          showHistory={true}
        />
      </div>
      
      {onFiltersToggle && (
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={onFiltersToggle}
          disabled={disabled}
          className={cn(
            'flex-shrink-0',
            hasActiveFilters && !showFilters && 'border-primary-500 text-primary-500'
          )}
        >
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </Button>
      )}
    </div>
  )
}

// Search bar with categories
export function CategorizedSearchBar({
  value,
  onChange,
  onSubmit,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  placeholder = 'Search recipes...',
  className,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  categories?: Array<{ value: string; label: string }>
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <SearchBar
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      
      {categories.length > 0 && onCategoryChange && (
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-3 font-mono text-base bg-white border-2 border-black shadow-brutal focus:shadow-brutal-sm focus:outline-none"
          disabled={disabled}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
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