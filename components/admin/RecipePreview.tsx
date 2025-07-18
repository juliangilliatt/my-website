'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { RecipeFormData } from '@/lib/validations/admin-forms'

interface RecipePreviewProps {
  formData: Partial<RecipeFormData>
  className?: string
  mode?: 'card' | 'full'
  showMetadata?: boolean
  onClose?: () => void
}

export function RecipePreview({ 
  formData, 
  className,
  mode = 'full',
  showMetadata = true,
  onClose 
}: RecipePreviewProps) {
  const [servingMultiplier, setServingMultiplier] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  // Calculate scaled servings and ingredients
  const scaledServings = useMemo(() => {
    return Math.round((formData.servings || 1) * servingMultiplier)
  }, [formData.servings, servingMultiplier])

  const scaledIngredients = useMemo(() => {
    return formData.ingredients?.map(ingredient => {
      if (servingMultiplier === 1) return ingredient
      
      // Simple scaling - in a real app, this would be more sophisticated
      const numberRegex = /(\d+\.?\d*)/g
      return ingredient.replace(numberRegex, (match) => {
        const num = parseFloat(match)
        const scaled = num * servingMultiplier
        return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1)
      })
    }) || []
  }, [formData.ingredients, servingMultiplier])

  const totalTime = useMemo(() => {
    return (formData.prepTime || 0) + (formData.cookTime || 0)
  }, [formData.prepTime, formData.cookTime])

  const handleIngredientCheck = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300'
    }
  }

  if (mode === 'card') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        {formData.image && (
          <div className="relative h-48 bg-neutral-100">
            <Image
              src={formData.image}
              alt={formData.imageAlt || formData.title || 'Recipe image'}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-mono font-bold text-xl text-black">
              {formData.title || 'Recipe Title'}
            </h3>
            <p className="text-sm font-mono text-neutral-600 mt-1">
              {formData.description || 'Recipe description will appear here...'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {formData.difficulty && (
              <Badge className={cn('font-mono text-xs', getDifficultyColor(formData.difficulty))}>
                {formData.difficulty}
              </Badge>
            )}
            {formData.category && (
              <Badge variant="outline" className="font-mono text-xs">
                {formData.category}
              </Badge>
            )}
            {formData.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="font-mono text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm font-mono text-neutral-600">
            {formData.prepTime && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>Prep: {formData.prepTime}m</span>
              </div>
            )}
            {formData.cookTime && (
              <div className="flex items-center gap-1">
                <ChefHatIcon className="w-4 h-4" />
                <span>Cook: {formData.cookTime}m</span>
              </div>
            )}
            {formData.servings && (
              <div className="flex items-center gap-1">
                <UsersIcon className="w-4 h-4" />
                <span>Serves: {formData.servings}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-mono font-bold text-black">Recipe Preview</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="font-mono">
            <XIcon className="w-4 h-4 mr-2" />
            Close Preview
          </Button>
        )}
      </div>

      {/* Recipe Header */}
      <Card className="overflow-hidden">
        {formData.image && (
          <div className="relative h-64 bg-neutral-100">
            <Image
              src={formData.image}
              alt={formData.imageAlt || formData.title || 'Recipe image'}
              fill
              className="object-cover"
            />
            {formData.featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-black font-mono font-bold">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6 space-y-4">
          <div>
            <h1 className="font-mono font-bold text-3xl text-black mb-2">
              {formData.title || 'Recipe Title'}
            </h1>
            <p className="text-neutral-600 font-mono text-lg leading-relaxed">
              {formData.description || 'Recipe description will appear here...'}
            </p>
          </div>
          
          {/* Recipe Meta */}
          <div className="flex items-center gap-4 flex-wrap">
            {formData.difficulty && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-neutral-600">Difficulty:</span>
                <Badge className={cn('font-mono', getDifficultyColor(formData.difficulty))}>
                  {formData.difficulty}
                </Badge>
              </div>
            )}
            {formData.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-neutral-600">Category:</span>
                <Badge variant="outline" className="font-mono">
                  {formData.category}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Time and Serving Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 border-2 border-black shadow-brutal">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-black">
                {formData.prepTime || 0}m
              </div>
              <div className="text-sm font-mono text-neutral-600">Prep Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-black">
                {formData.cookTime || 0}m
              </div>
              <div className="text-sm font-mono text-neutral-600">Cook Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-black">
                {totalTime}m
              </div>
              <div className="text-sm font-mono text-neutral-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-black">
                {scaledServings}
              </div>
              <div className="text-sm font-mono text-neutral-600">Servings</div>
            </div>
          </div>
          
          {/* Tags */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-neutral-600">Tags:</span>
              {formData.tags.map(tag => (
                <Badge key={tag} variant="outline" className="font-mono text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-xl text-black">Ingredients</h3>
          
          {/* Serving Scaler */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-neutral-600">Servings:</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                className="w-8 h-8 p-0 font-mono"
              >
                -
              </Button>
              <span className="w-12 text-center font-mono font-bold">
                {scaledServings}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                className="w-8 h-8 p-0 font-mono"
              >
                +
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {scaledIngredients.length > 0 ? (
            scaledIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded">
                <input
                  type="checkbox"
                  checked={checkedIngredients.has(index)}
                  onChange={() => handleIngredientCheck(index)}
                  className="w-4 h-4 border-2 border-black"
                />
                <span className={cn(
                  'font-mono text-sm',
                  checkedIngredients.has(index) ? 'line-through text-neutral-500' : 'text-black'
                )}>
                  {ingredient}
                </span>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 font-mono text-sm italic">
              No ingredients added yet...
            </p>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="font-mono font-bold text-xl text-black mb-4">Instructions</h3>
        
        <div className="space-y-4">
          {formData.instructions && formData.instructions.length > 0 ? (
            formData.instructions.map((instruction, index) => (
              <div 
                key={index} 
                className={cn(
                  'flex items-start gap-4 p-4 border-2 border-black shadow-brutal transition-all duration-200',
                  currentStep === index ? 'bg-blue-50 border-blue-500' : 'bg-white'
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-mono font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm leading-relaxed text-black">
                    {instruction}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'font-mono text-xs',
                    currentStep === index ? 'text-blue-600' : 'text-neutral-500'
                  )}
                >
                  {currentStep === index ? 'Current' : 'Select'}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 font-mono text-sm italic">
              No instructions added yet...
            </p>
          )}
        </div>
      </Card>

      {/* Additional Info */}
      {(formData.notes || formData.tips || formData.nutrition) && (
        <Card className="p-6">
          <h3 className="font-mono font-bold text-xl text-black mb-4">Additional Information</h3>
          
          <div className="space-y-4">
            {formData.notes && (
              <div>
                <h4 className="font-mono font-medium text-black mb-2">Notes</h4>
                <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                  {formData.notes}
                </p>
              </div>
            )}
            
            {formData.tips && (
              <div>
                <h4 className="font-mono font-medium text-black mb-2">Tips</h4>
                <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                  {formData.tips}
                </p>
              </div>
            )}
            
            {formData.nutrition && (
              <div>
                <h4 className="font-mono font-medium text-black mb-2">Nutrition (per serving)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.nutrition.calories && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-black">
                        {formData.nutrition.calories}
                      </div>
                      <div className="text-xs font-mono text-neutral-600">Calories</div>
                    </div>
                  )}
                  {formData.nutrition.protein && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-black">
                        {formData.nutrition.protein}g
                      </div>
                      <div className="text-xs font-mono text-neutral-600">Protein</div>
                    </div>
                  )}
                  {formData.nutrition.carbs && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-black">
                        {formData.nutrition.carbs}g
                      </div>
                      <div className="text-xs font-mono text-neutral-600">Carbs</div>
                    </div>
                  )}
                  {formData.nutrition.fat && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-black">
                        {formData.nutrition.fat}g
                      </div>
                      <div className="text-xs font-mono text-neutral-600">Fat</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Metadata */}
      {showMetadata && (
        <Card className="p-6">
          <h3 className="font-mono font-bold text-xl text-black mb-4">Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <span className="text-neutral-600">Author:</span>
              <span className="ml-2 text-black">{formData.author || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-neutral-600">Cuisine:</span>
              <span className="ml-2 text-black">{formData.cuisine || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-neutral-600">Published:</span>
              <span className="ml-2 text-black">{formData.published ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-neutral-600">Featured:</span>
              <span className="ml-2 text-black">{formData.featured ? 'Yes' : 'No'}</span>
            </div>
            {formData.source && (
              <div>
                <span className="text-neutral-600">Source:</span>
                <span className="ml-2 text-black">{formData.source}</span>
              </div>
            )}
            {formData.sourceUrl && (
              <div className="md:col-span-2">
                <span className="text-neutral-600">Source URL:</span>
                <a 
                  href={formData.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  {formData.sourceUrl}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

// Icon components
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2M6 8h12l-1 12H7L6 8z" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}