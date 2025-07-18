'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'brutalist' | 'minimal'
  label?: string
  description?: string
  strikeThrough?: boolean
  children?: React.ReactNode
}

export function Checkbox({
  id,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  className,
  size = 'md',
  variant = 'brutalist',
  label,
  description,
  strikeThrough = false,
  children,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(defaultChecked)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle controlled vs uncontrolled
  const controlledChecked = checked !== undefined ? checked : isChecked

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked)
    }
  }, [checked])

  const handleToggle = () => {
    if (disabled) return

    const newChecked = !controlledChecked
    setIsAnimating(true)
    
    if (checked === undefined) {
      setIsChecked(newChecked)
    }
    
    onChange?.(newChecked)

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 200)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 text-sm'
      case 'lg':
        return 'w-6 h-6 text-lg'
      default:
        return 'w-5 h-5 text-base'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'border border-neutral-300 rounded'
      case 'default':
        return 'border-2 border-neutral-400 rounded-sm'
      default:
        return 'border-2 border-black shadow-brutal-sm hover:shadow-brutal'
    }
  }

  const checkboxClasses = cn(
    'relative inline-flex items-center justify-center bg-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    getSizeClasses(),
    getVariantClasses(),
    controlledChecked && 'bg-primary-500 border-primary-500',
    disabled && 'opacity-50 cursor-not-allowed',
    isAnimating && 'animate-pulse',
    className
  )

  const labelClasses = cn(
    'transition-all duration-300 ease-in-out',
    strikeThrough && controlledChecked && 'line-through opacity-75',
    disabled && 'opacity-50'
  )

  if (label || description || children) {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer', disabled && 'cursor-not-allowed')}>
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            id={id}
            checked={controlledChecked}
            onChange={handleToggle}
            disabled={disabled}
            className="sr-only"
          />
          <div className={checkboxClasses}>
            {controlledChecked && (
              <CheckIcon 
                className={cn(
                  'text-white transition-all duration-150',
                  size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5',
                  isAnimating && 'animate-bounce'
                )}
              />
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {label && (
            <div className={cn('font-mono font-medium text-black', labelClasses)}>
              {label}
            </div>
          )}
          {description && (
            <div className={cn('text-sm font-mono text-neutral-600 mt-1', labelClasses)}>
              {description}
            </div>
          )}
          {children && (
            <div className={labelClasses}>
              {children}
            </div>
          )}
        </div>
      </label>
    )
  }

  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={controlledChecked}
        onChange={handleToggle}
        disabled={disabled}
        className="sr-only"
      />
      <div className={checkboxClasses}>
        {controlledChecked && (
          <CheckIcon 
            className={cn(
              'text-white transition-all duration-150',
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5',
              isAnimating && 'animate-bounce'
            )}
          />
        )}
      </div>
    </div>
  )
}

// Checkbox with custom content
export function CheckboxWithContent({
  checked,
  onChange,
  disabled = false,
  className,
  size = 'md',
  variant = 'brutalist',
  strikeThrough = false,
  children,
}: {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'brutalist' | 'minimal'
  strikeThrough?: boolean
  children: React.ReactNode
}) {
  const [isChecked, setIsChecked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const controlledChecked = checked !== undefined ? checked : isChecked

  const handleToggle = () => {
    if (disabled) return

    const newChecked = !controlledChecked
    setIsAnimating(true)
    
    if (checked === undefined) {
      setIsChecked(newChecked)
    }
    
    onChange?.(newChecked)

    setTimeout(() => setIsAnimating(false), 200)
  }

  const contentClasses = cn(
    'transition-all duration-300 ease-in-out',
    strikeThrough && controlledChecked && 'line-through opacity-75',
    disabled && 'opacity-50'
  )

  return (
    <label className={cn('flex items-start gap-3 cursor-pointer', disabled && 'cursor-not-allowed', className)}>
      <Checkbox
        checked={controlledChecked}
        onChange={handleToggle}
        disabled={disabled}
        size={size}
        variant={variant}
      />
      <div className={contentClasses}>
        {children}
      </div>
    </label>
  )
}

// Checkbox list component
export function CheckboxList({
  items,
  checked = [],
  onChange,
  disabled = false,
  className,
  size = 'md',
  variant = 'brutalist',
  strikeThrough = false,
  showProgress = false,
}: {
  items: Array<{ id: string; label: string; description?: string }>
  checked?: string[]
  onChange?: (checked: string[]) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'brutalist' | 'minimal'
  strikeThrough?: boolean
  showProgress?: boolean
}) {
  const handleItemToggle = (itemId: string) => {
    if (disabled) return

    const newChecked = checked.includes(itemId)
      ? checked.filter(id => id !== itemId)
      : [...checked, itemId]
    
    onChange?.(newChecked)
  }

  const progress = items.length > 0 ? (checked.length / items.length) * 100 : 0

  return (
    <div className={className}>
      {showProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-neutral-600">Progress</span>
            <span className="text-sm font-mono text-neutral-600">{checked.length} / {items.length}</span>
          </div>
          <div className="w-full bg-neutral-200 border-2 border-black">
            <div
              className="h-2 bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {items.map((item) => (
          <Checkbox
            key={item.id}
            checked={checked.includes(item.id)}
            onChange={() => handleItemToggle(item.id)}
            disabled={disabled}
            size={size}
            variant={variant}
            label={item.label}
            description={item.description}
            strikeThrough={strikeThrough}
          />
        ))}
      </div>
    </div>
  )
}

// Checkbox group with select all
export function CheckboxGroup({
  title,
  items,
  checked = [],
  onChange,
  disabled = false,
  className,
  size = 'md',
  variant = 'brutalist',
  strikeThrough = false,
  showSelectAll = true,
}: {
  title?: string
  items: Array<{ id: string; label: string; description?: string }>
  checked?: string[]
  onChange?: (checked: string[]) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'brutalist' | 'minimal'
  strikeThrough?: boolean
  showSelectAll?: boolean
}) {
  const allChecked = items.length > 0 && checked.length === items.length
  const someChecked = checked.length > 0 && checked.length < items.length

  const handleSelectAll = () => {
    if (disabled) return

    const newChecked = allChecked ? [] : items.map(item => item.id)
    onChange?.(newChecked)
  }

  const handleItemToggle = (itemId: string) => {
    if (disabled) return

    const newChecked = checked.includes(itemId)
      ? checked.filter(id => id !== itemId)
      : [...checked, itemId]
    
    onChange?.(newChecked)
  }

  return (
    <div className={className}>
      {(title || showSelectAll) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-mono font-semibold text-black">{title}</h3>
          )}
          {showSelectAll && (
            <button
              onClick={handleSelectAll}
              disabled={disabled}
              className={cn(
                'text-sm font-mono text-primary-500 hover:text-primary-600 transition-colors duration-150',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {allChecked ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      )}
      
      <div className="space-y-3">
        {items.map((item) => (
          <Checkbox
            key={item.id}
            checked={checked.includes(item.id)}
            onChange={() => handleItemToggle(item.id)}
            disabled={disabled}
            size={size}
            variant={variant}
            label={item.label}
            description={item.description}
            strikeThrough={strikeThrough}
          />
        ))}
      </div>
    </div>
  )
}

// Custom check icon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}