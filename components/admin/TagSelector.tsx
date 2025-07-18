'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FormField, FormInput } from './FormValidation'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  slug: string
  color?: string
  count?: number
}

interface TagSelectorProps {
  value: string[]
  onChange: (tags: string[]) => void
  availableTags?: Tag[]
  placeholder?: string
  maxTags?: number
  allowCreate?: boolean
  className?: string
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export function TagSelector({
  value = [],
  onChange,
  availableTags = [],
  placeholder = 'Type to search or add tags...',
  maxTags = 20,
  allowCreate = true,
  className,
  label = 'Tags',
  required,
  error,
  disabled,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock available tags if none provided
  const mockTags: Tag[] = [
    { id: '1', name: 'vegetarian', slug: 'vegetarian', color: '#10B981' },
    { id: '2', name: 'vegan', slug: 'vegan', color: '#059669' },
    { id: '3', name: 'gluten-free', slug: 'gluten-free', color: '#F59E0B' },
    { id: '4', name: 'dairy-free', slug: 'dairy-free', color: '#3B82F6' },
    { id: '5', name: 'low-carb', slug: 'low-carb', color: '#EF4444' },
    { id: '6', name: 'keto', slug: 'keto', color: '#8B5CF6' },
    { id: '7', name: 'paleo', slug: 'paleo', color: '#F97316' },
    { id: '8', name: 'healthy', slug: 'healthy', color: '#84CC16' },
    { id: '9', name: 'quick', slug: 'quick', color: '#06B6D4' },
    { id: '10', name: 'easy', slug: 'easy', color: '#14B8A6' },
    { id: '11', name: 'comfort food', slug: 'comfort-food', color: '#F43F5E' },
    { id: '12', name: 'spicy', slug: 'spicy', color: '#DC2626' },
    { id: '13', name: 'sweet', slug: 'sweet', color: '#EC4899' },
    { id: '14', name: 'savory', slug: 'savory', color: '#78350F' },
    { id: '15', name: 'breakfast', slug: 'breakfast', color: '#92400E' },
    { id: '16', name: 'lunch', slug: 'lunch', color: '#1E40AF' },
    { id: '17', name: 'dinner', slug: 'dinner', color: '#581C87' },
    { id: '18', name: 'snack', slug: 'snack', color: '#BE185D' },
    { id: '19', name: 'dessert', slug: 'dessert', color: '#BE123C' },
    { id: '20', name: 'appetizer', slug: 'appetizer', color: '#166534' },
  ]

  const tags = availableTags.length > 0 ? availableTags : mockTags

  // Filter tags based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredTags(tags.filter(tag => !value.includes(tag.name)))
      return
    }

    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag.name)
    )

    setFilteredTags(filtered)
  }, [inputValue, tags, value])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setInputValue(inputValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }, [])

  // Handle tag selection
  const handleTagSelect = useCallback((tagName: string) => {
    if (value.includes(tagName) || value.length >= maxTags) return
    
    const newTags = [...value, tagName]
    onChange(newTags)
    setInputValue('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }, [value, maxTags, onChange])

  // Handle tag removal
  const handleTagRemove = useCallback((tagName: string) => {
    const newTags = value.filter(tag => tag !== tagName)
    onChange(newTags)
  }, [value, onChange])

  // Handle creating new tag
  const handleCreateTag = useCallback(() => {
    if (!allowCreate || !inputValue.trim()) return
    
    const tagName = inputValue.trim().toLowerCase()
    if (value.includes(tagName) || value.length >= maxTags) return
    
    handleTagSelect(tagName)
  }, [allowCreate, inputValue, value, maxTags, handleTagSelect])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredTags.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredTags.length) {
          handleTagSelect(filteredTags[selectedIndex].name)
        } else if (allowCreate && inputValue.trim()) {
          handleCreateTag()
        }
        break
      
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      
      case 'Backspace':
        if (!inputValue && value.length > 0) {
          handleTagRemove(value[value.length - 1])
        }
        break
    }
  }, [disabled, filteredTags, selectedIndex, inputValue, allowCreate, value, handleTagSelect, handleCreateTag, handleTagRemove])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get tag color
  const getTagColor = useCallback((tagName: string): string => {
    const tag = tags.find(t => t.name === tagName)
    return tag?.color || '#6B7280'
  }, [tags])

  return (
    <div className={cn('space-y-2', className)}>
      <FormField
        label={label}
        required={required}
        error={error}
      >
        <div className="relative">
          {/* Input Container */}
          <div className={cn(
            'flex flex-wrap gap-2 p-2 min-h-[42px] bg-white border-2 shadow-brutal transition-all duration-200',
            'focus-within:shadow-brutal-sm',
            error ? 'border-red-500' : 'border-black',
            disabled && 'bg-neutral-50 opacity-50'
          )}>
            {/* Selected Tags */}
            {value.map((tagName) => (
              <Badge
                key={tagName}
                variant="default"
                className="flex items-center gap-1 px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: getTagColor(tagName) }}
              >
                {tagName}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tagName)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled || value.length >= maxTags}
              className="flex-1 min-w-[120px] bg-transparent outline-none font-mono text-sm"
            />
          </div>

          {/* Dropdown */}
          {isOpen && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border-2 border-black shadow-brutal max-h-60 overflow-y-auto"
            >
              {/* Filtered Tags */}
              {filteredTags.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagSelect(tag.name)}
                  className={cn(
                    'w-full px-3 py-2 text-left font-mono text-sm hover:bg-neutral-50 transition-colors',
                    selectedIndex === index && 'bg-neutral-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </div>
                    {tag.count && (
                      <span className="text-xs text-neutral-500">
                        {tag.count} recipes
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {/* Create New Tag */}
              {allowCreate && inputValue.trim() && (
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className={cn(
                    'w-full px-3 py-2 text-left font-mono text-sm hover:bg-neutral-50 transition-colors border-t border-neutral-200',
                    selectedIndex === filteredTags.length && 'bg-neutral-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <PlusIcon className="w-3 h-3" />
                    <span>Create "{inputValue.trim()}"</span>
                  </div>
                </button>
              )}

              {/* No Results */}
              {filteredTags.length === 0 && (!allowCreate || !inputValue.trim()) && (
                <div className="px-3 py-2 text-sm font-mono text-neutral-500">
                  No tags found
                </div>
              )}
            </div>
          )}
        </div>
      </FormField>

      {/* Tag Limit Info */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
        <span>
          {value.length} of {maxTags} tags selected
        </span>
        {allowCreate && (
          <span>
            Press Enter to create new tags
          </span>
        )}
      </div>
    </div>
  )
}

// Popular Tags component
interface PopularTagsProps {
  tags: Tag[]
  selectedTags: string[]
  onTagSelect: (tagName: string) => void
  maxTags: number
  className?: string
}

export function PopularTags({ 
  tags, 
  selectedTags, 
  onTagSelect, 
  maxTags,
  className 
}: PopularTagsProps) {
  const popularTags = tags
    .filter(tag => tag.count && tag.count > 0)
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 10)

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-mono font-medium text-black">Popular Tags</h4>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name)
          const isDisabled = !isSelected && selectedTags.length >= maxTags
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onTagSelect(tag.name)}
              disabled={isDisabled}
              className={cn(
                'px-2 py-1 rounded-md font-mono text-xs transition-all duration-200',
                'border-2 border-black shadow-brutal-sm hover:shadow-brutal',
                isSelected
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tag.name}
              {tag.count && (
                <span className="ml-1 opacity-70">
                  ({tag.count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Tag input with autocomplete
interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  maxTags?: number
  className?: string
  disabled?: boolean
}

export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Add tags...',
  maxTags = 20,
  className,
  disabled,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(newValue.length > 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = (tagName?: string) => {
    const tag = tagName || inputValue.trim()
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'flex flex-wrap gap-1 p-2 min-h-[42px] bg-white border-2 border-black shadow-brutal',
        'focus-within:shadow-brutal-sm',
        disabled && 'bg-neutral-50 opacity-50'
      )}>
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="default"
            className="flex items-center gap-1 px-2 py-1 font-mono text-xs"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <XIcon className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled || value.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent outline-none font-mono text-sm"
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-black shadow-brutal max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left font-mono text-sm hover:bg-neutral-50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}