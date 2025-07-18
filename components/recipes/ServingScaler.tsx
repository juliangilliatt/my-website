'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface ServingScalerProps {
  originalServings: number
  currentServings: number
  onServingChange: (servings: number) => void
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  showReset?: boolean
  minServings?: number
  maxServings?: number
}

export function ServingScaler({
  originalServings,
  currentServings,
  onServingChange,
  className,
  variant = 'default',
  showReset = true,
  minServings = 1,
  maxServings = 20,
}: ServingScalerProps) {
  const [inputValue, setInputValue] = useState(currentServings.toString())
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setInputValue(currentServings.toString())
  }, [currentServings])

  const handleDecrease = () => {
    const newValue = Math.max(minServings, currentServings - 1)
    onServingChange(newValue)
  }

  const handleIncrease = () => {
    const newValue = Math.min(maxServings, currentServings + 1)
    onServingChange(newValue)
  }

  const handleReset = () => {
    onServingChange(originalServings)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputSubmit = () => {
    const value = parseInt(inputValue)
    if (!isNaN(value) && value >= minServings && value <= maxServings) {
      onServingChange(value)
    } else {
      setInputValue(currentServings.toString())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit()
    } else if (e.key === 'Escape') {
      setInputValue(currentServings.toString())
      setIsEditing(false)
    }
  }

  const scalingFactor = currentServings / originalServings
  const isScaled = currentServings !== originalServings

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          disabled={currentServings <= minServings}
          className="w-8 h-8 p-0"
        >
          <MinusIcon className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          <span className="text-sm font-mono font-semibold text-black">{currentServings}</span>
          <span className="text-xs font-mono text-neutral-600">servings</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          disabled={currentServings >= maxServings}
          className="w-8 h-8 p-0"
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-1">
          <UsersIcon className="w-4 h-4 text-neutral-600" />
          <span className="text-sm font-mono text-neutral-600">Servings:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            disabled={currentServings <= minServings}
            className="w-8 h-8 p-0"
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
          
          {isEditing ? (
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputSubmit}
              onKeyDown={handleKeyDown}
              className="w-16 px-2 py-1 text-center text-sm font-mono border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={minServings}
              max={maxServings}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-16 px-2 py-1 text-center text-sm font-mono font-semibold text-black hover:bg-neutral-50 transition-colors duration-150"
            >
              {currentServings}
            </button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            disabled={currentServings >= maxServings}
            className="w-8 h-8 p-0"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        
        {showReset && isScaled && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            Reset
          </Button>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-neutral-600" />
          <h3 className="text-lg font-mono font-semibold text-black">Adjust Servings</h3>
        </div>
        
        {isScaled && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {scalingFactor.toFixed(1)}x scale
            </Badge>
            {showReset && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleDecrease}
          disabled={currentServings <= minServings}
          className="w-12 h-12 p-0"
        >
          <MinusIcon className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          {isEditing ? (
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputSubmit}
              onKeyDown={handleKeyDown}
              className="w-20 px-3 py-2 text-center text-2xl font-mono font-bold border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={minServings}
              max={maxServings}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-20 px-3 py-2 text-center text-2xl font-mono font-bold text-black hover:bg-neutral-50 transition-colors duration-150"
            >
              {currentServings}
            </button>
          )}
          <div className="text-sm font-mono text-neutral-600 mt-1">
            {currentServings === 1 ? 'serving' : 'servings'}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleIncrease}
          disabled={currentServings >= maxServings}
          className="w-12 h-12 p-0"
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
      </div>
      
      {originalServings !== currentServings && (
        <div className="text-center text-sm font-mono text-neutral-600">
          Original recipe serves {originalServings}
        </div>
      )}
    </div>
  )
}

// Quick serving preset buttons
export function ServingPresets({
  originalServings,
  currentServings,
  onServingChange,
  className,
  presets = [1, 2, 4, 6, 8, 12],
}: {
  originalServings: number
  currentServings: number
  onServingChange: (servings: number) => void
  className?: string
  presets?: number[]
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {presets.map((preset) => (
        <Button
          key={preset}
          variant={currentServings === preset ? 'default' : 'outline'}
          size="sm"
          onClick={() => onServingChange(preset)}
          className="text-xs"
        >
          {preset}
        </Button>
      ))}
    </div>
  )
}

// Serving scaler with visual feedback
export function VisualServingScaler({
  originalServings,
  currentServings,
  onServingChange,
  className,
}: {
  originalServings: number
  currentServings: number
  onServingChange: (servings: number) => void
  className?: string
}) {
  const scalingFactor = currentServings / originalServings
  const isScaled = currentServings !== originalServings

  return (
    <div className={cn('p-6 bg-white border-2 border-black shadow-brutal', className)}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-mono font-bold text-black mb-2">Recipe Scaling</h3>
        <p className="text-sm font-mono text-neutral-600">
          Adjust servings and all ingredients will scale automatically
        </p>
      </div>
      
      <ServingScaler
        originalServings={originalServings}
        currentServings={currentServings}
        onServingChange={onServingChange}
        variant="default"
      />
      
      {isScaled && (
        <div className="mt-6 p-4 bg-primary-50 border-2 border-primary-500 shadow-brutal-sm">
          <div className="text-center">
            <div className="text-sm font-mono text-primary-700 mb-2">
              Scaling Factor: {scalingFactor.toFixed(2)}x
            </div>
            <div className="text-xs font-mono text-primary-600">
              All ingredient quantities have been {scalingFactor > 1 ? 'increased' : 'decreased'} proportionally
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <div className="text-sm font-mono text-neutral-600 mb-2">Quick presets:</div>
        <ServingPresets
          originalServings={originalServings}
          currentServings={currentServings}
          onServingChange={onServingChange}
        />
      </div>
    </div>
  )
}

// Serving scaler with conversion table
export function ServingScalerWithTable({
  originalServings,
  currentServings,
  onServingChange,
  ingredients,
  className,
}: {
  originalServings: number
  currentServings: number
  onServingChange: (servings: number) => void
  ingredients: Array<{ amount: number; unit: string; name: string }>
  className?: string
}) {
  const scalingFactor = currentServings / originalServings

  return (
    <div className={cn('space-y-6', className)}>
      <ServingScaler
        originalServings={originalServings}
        currentServings={currentServings}
        onServingChange={onServingChange}
        variant="default"
      />
      
      {scalingFactor !== 1 && (
        <div className="p-4 bg-neutral-50 border-2 border-black shadow-brutal">
          <h4 className="text-sm font-mono font-semibold text-black mb-3">
            Ingredient Conversion Preview
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {ingredients.slice(0, 5).map((ingredient, index) => {
              const scaledAmount = ingredient.amount * scalingFactor
              const formattedAmount = scaledAmount % 1 === 0 
                ? scaledAmount.toString() 
                : scaledAmount.toFixed(2)
              
              return (
                <div key={index} className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-600">{ingredient.name}</span>
                  <span className="text-black font-medium">
                    {formattedAmount} {ingredient.unit}
                  </span>
                </div>
              )
            })}
            {ingredients.length > 5 && (
              <div className="text-xs font-mono text-neutral-500 text-center">
                +{ingredients.length - 5} more ingredients
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Icon components
function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
}