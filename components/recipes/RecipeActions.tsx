'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Recipe } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface RecipeActionsProps {
  recipe: Recipe
  className?: string
  variant?: 'default' | 'compact' | 'floating'
  showLabels?: boolean
  isFavorited?: boolean
  onFavoriteToggle?: () => void
  onShare?: () => void
}

export function RecipeActions({
  recipe,
  className,
  variant = 'default',
  showLabels = true,
  isFavorited = false,
  onFavoriteToggle,
  onShare,
}: RecipeActionsProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = async () => {
    try {
      const recipeText = formatRecipeForCopy(recipe)
      await navigator.clipboard.writeText(recipeText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy recipe:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href,
      })
    } else {
      onShare?.()
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/recipes'
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="p-2"
        >
          <PrintIcon className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="p-2"
        >
          {copySuccess ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="p-2"
        >
          <ShareIcon className="w-4 h-4" />
        </Button>
        
        {onFavoriteToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFavoriteToggle}
            className={cn('p-2', isFavorited && 'text-red-500')}
          >
            <HeartIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            size="lg"
            onClick={handlePrint}
            className="w-12 h-12 p-0 shadow-brutal hover:shadow-brutal-sm"
          >
            <PrintIcon className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopy}
            className="w-12 h-12 p-0 shadow-brutal hover:shadow-brutal-sm"
          >
            {copySuccess ? <CheckIcon className="w-6 h-6" /> : <CopyIcon className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
            className="w-12 h-12 p-0 shadow-brutal hover:shadow-brutal-sm"
          >
            <ShareIcon className="w-6 h-6" />
          </Button>
          
          {onFavoriteToggle && (
            <Button
              variant="outline"
              size="lg"
              onClick={onFavoriteToggle}
              className={cn('w-12 h-12 p-0 shadow-brutal hover:shadow-brutal-sm', isFavorited && 'text-red-500')}
            >
              <HeartIcon className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <Button
        variant="default"
        onClick={handlePrint}
        className="flex items-center gap-2"
      >
        <PrintIcon className="w-4 h-4" />
        {showLabels && <span>Print Recipe</span>}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        {copySuccess ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        {showLabels && <span>{copySuccess ? 'Copied!' : 'Copy Recipe'}</span>}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <ShareIcon className="w-4 h-4" />
        {showLabels && <span>Share</span>}
      </Button>
      
      {onFavoriteToggle && (
        <Button
          variant="outline"
          onClick={onFavoriteToggle}
          className={cn('flex items-center gap-2', isFavorited && 'text-red-500')}
        >
          <HeartIcon className="w-4 h-4" />
          {showLabels && <span>{isFavorited ? 'Unfavorite' : 'Favorite'}</span>}
        </Button>
      )}
      
      <Button
        variant="ghost"
        onClick={handleGoBack}
        className="flex items-center gap-2"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {showLabels && <span>Back to Recipes</span>}
      </Button>
    </div>
  )
}

// Navigation actions
export function RecipeNavigation({
  recipe,
  className,
  showBreadcrumb = true,
}: {
  recipe: Recipe
  className?: string
  showBreadcrumb?: boolean
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {showBreadcrumb && (
        <nav className="flex items-center space-x-2 text-sm font-mono text-neutral-600">
          <Link href="/" className="hover:text-primary-500 transition-colors duration-150">
            Home
          </Link>
          <span>/</span>
          <Link href="/recipes" className="hover:text-primary-500 transition-colors duration-150">
            Recipes
          </Link>
          <span>/</span>
          <span className="text-black font-medium">{recipe.title}</span>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Recipes
        </Link>
        
        <Badge variant="outline" className="text-xs">
          {recipe.category}
        </Badge>
      </div>
    </div>
  )
}

// Print settings modal
export function PrintSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: {
  isOpen: boolean
  onClose: () => void
  settings: {
    includeNotes: boolean
    includeNutrition: boolean
    includeServings: boolean
  }
  onSettingsChange: (settings: any) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-brutal max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-mono font-bold text-black">Print Settings</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeNotes}
                onChange={(e) => onSettingsChange({ ...settings, includeNotes: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-mono text-sm">Include personal notes</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeNutrition}
                onChange={(e) => onSettingsChange({ ...settings, includeNutrition: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-mono text-sm">Include nutrition information</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeServings}
                onChange={(e) => onSettingsChange({ ...settings, includeServings: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-mono text-sm">Include serving information</span>
            </label>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                window.print()
                onClose()
              }}
              className="flex-1"
            >
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Recipe sharing modal
export function ShareModal({
  recipe,
  isOpen,
  onClose,
}: {
  recipe: Recipe
  isOpen: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const recipeUrl = `${window.location.origin}/recipes/${recipe.slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-brutal max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-mono font-bold text-black">Share Recipe</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-neutral-600 mb-2">Recipe Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={recipeUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm font-mono bg-neutral-50 border-2 border-black focus:outline-none"
                />
                <Button variant="outline" onClick={handleCopyLink}>
                  {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this recipe: ${recipe.title}&url=${encodeURIComponent(recipeUrl)}`, '_blank')}
                className="flex-1"
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`, '_blank')}
                className="flex-1"
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to format recipe for copying
function formatRecipeForCopy(recipe: Recipe): string {
  let text = `${recipe.title}\n`
  text += `${'='.repeat(recipe.title.length)}\n\n`
  
  text += `Description: ${recipe.description}\n`
  text += `Category: ${recipe.category}\n`
  text += `Difficulty: ${recipe.difficulty}\n`
  text += `Prep Time: ${recipe.prepTime} minutes\n`
  text += `Cook Time: ${recipe.cookTime} minutes\n`
  text += `Servings: ${recipe.servings}\n\n`
  
  text += `INGREDIENTS:\n`
  text += `${'-'.repeat(12)}\n`
  recipe.ingredients.forEach((ingredient, index) => {
    text += `${index + 1}. ${ingredient}\n`
  })
  
  text += `\nINSTRUCTIONS:\n`
  text += `${'-'.repeat(12)}\n`
  recipe.instructions.forEach((instruction, index) => {
    text += `${index + 1}. ${instruction}\n`
  })
  
  if (recipe.tags && recipe.tags.length > 0) {
    text += `\nTags: ${recipe.tags.join(', ')}\n`
  }
  
  text += `\nRecipe from: ${window.location.origin}/recipes/${recipe.slug}`
  
  return text
}

// Icon components
function PrintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="6,9 6,2 18,2 18,9" />
      <path d="M6,18H4a2,2 0 0,1-2-2v-5a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
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