'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Recipe } from '@prisma/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  formatTime, 
  formatServings, 
  formatRecipeDescription,
  getCategoryColor,
  getCategoryIcon,
  getDifficultyColor,
  getDifficultyIcon,
  getRecipeImageUrl 
} from '@/lib/utils/recipe-helpers'
import { cn } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
  className?: string
  variant?: 'default' | 'compact' | 'featured'
  showImage?: boolean
  showDescription?: boolean
  showTags?: boolean
  showActions?: boolean
  onFavorite?: (recipeId: string) => void
  onShare?: (recipe: Recipe) => void
  isFavorited?: boolean
  searchTerm?: string
}

export function RecipeCard({
  recipe,
  className,
  variant = 'default',
  showImage = true,
  showDescription = true,
  showTags = true,
  showActions = true,
  onFavorite,
  onShare,
  isFavorited = false,
  searchTerm,
}: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onFavorite?.(recipe.id)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onShare?.(recipe)
  }

  const highlightText = (text: string) => {
    if (!searchTerm || searchTerm.length < 2) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 text-black px-1 font-medium">$1</mark>')
  }

  if (variant === 'compact') {
    return (
      <Link href={`/recipes/${recipe.slug}`} className={cn('block', className)}>
        <div className="p-4 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div className="flex items-start gap-4">
            {showImage && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <div className="w-full h-full bg-neutral-100 border-2 border-black overflow-hidden">
                  {!imageError ? (
                    <Image
                      src={getRecipeImageUrl(recipe)}
                      alt={recipe.title}
                      width={64}
                      height={64}
                      className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      )}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                      <span className="text-2xl">{getCategoryIcon(recipe.category)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 
                  className="font-mono font-semibold text-black text-lg truncate"
                  dangerouslySetInnerHTML={{ __html: highlightText(recipe.title) }}
                />
                <Badge 
                  variant="outline" 
                  className={cn("ml-2 flex-shrink-0", getCategoryColor(recipe.category))}
                >
                  {recipe.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
                <span>{formatTime(recipe.prepTime + recipe.cookTime)}</span>
                <span>{formatServings(recipe.servings)}</span>
                <span className="flex items-center gap-1">
                  {getDifficultyIcon(recipe.difficulty)}
                  {recipe.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/recipes/${recipe.slug}`} className={cn('block', className)}>
        <div 
          className="relative bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {showImage && (
            <div className="relative h-64 bg-neutral-100">
              {!imageError ? (
                <Image
                  src={getRecipeImageUrl(recipe)}
                  alt={recipe.title}
                  fill
                  className={cn(
                    'object-cover transition-all duration-300',
                    imageLoaded ? 'opacity-100' : 'opacity-0',
                    isHovered ? 'scale-105' : 'scale-100'
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                  <span className="text-6xl">{getCategoryIcon(recipe.category)}</span>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              
              {/* Featured badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary-500 text-white border-2 border-white shadow-brutal-sm">
                  Featured
                </Badge>
              </div>
              
              {/* Actions */}
              {showActions && (
                <div className="absolute top-4 right-4 flex gap-2">
                  {onFavorite && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFavoriteClick}
                      className={cn(
                        "bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal p-2",
                        isFavorited ? "text-red-500" : "text-neutral-600"
                      )}
                    >
                      <HeartIcon className="w-4 h-4" />
                    </Button>
                  )}
                  {onShare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareClick}
                      className="bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal p-2 text-neutral-600"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 
                className="text-2xl font-mono font-bold text-black"
                dangerouslySetInnerHTML={{ __html: highlightText(recipe.title) }}
              />
              <Badge 
                variant="outline" 
                className={cn("ml-4 flex-shrink-0", getCategoryColor(recipe.category))}
              >
                {getCategoryIcon(recipe.category)} {recipe.category}
              </Badge>
            </div>
            
            {showDescription && (
              <p 
                className="font-mono text-sm text-neutral-600 mb-4"
                dangerouslySetInnerHTML={{ __html: highlightText(formatRecipeDescription(recipe.description, 120)) }}
              />
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm font-mono text-neutral-600">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {formatTime(recipe.prepTime + recipe.cookTime)}
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {recipe.servings}
                </span>
                <span className="flex items-center gap-1">
                  {getDifficultyIcon(recipe.difficulty)}
                  {recipe.difficulty}
                </span>
              </div>
              
              {showTags && recipe.tags && recipe.tags.length > 0 && (
                <div className="flex gap-2">
                  {recipe.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{recipe.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/recipes/${recipe.slug}`} className={cn('block', className)}>
      <div 
        className="bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showImage && (
          <div className="relative h-48 bg-neutral-100">
            {!imageError ? (
              <Image
                src={getRecipeImageUrl(recipe)}
                alt={recipe.title}
                fill
                className={cn(
                  'object-cover transition-all duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                  isHovered ? 'scale-105' : 'scale-100'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                <span className="text-4xl">{getCategoryIcon(recipe.category)}</span>
              </div>
            )}
            
            {/* Actions */}
            {showActions && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onFavorite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavoriteClick}
                    className={cn(
                      "bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal p-2",
                      isFavorited ? "text-red-500" : "text-neutral-600"
                    )}
                  >
                    <HeartIcon className="w-4 h-4" />
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareClick}
                    className="bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal p-2 text-neutral-600"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 
              className="font-mono font-semibold text-black text-lg"
              dangerouslySetInnerHTML={{ __html: highlightText(recipe.title) }}
            />
            <Badge 
              variant="outline" 
              className={cn("ml-2 flex-shrink-0", getCategoryColor(recipe.category))}
            >
              {recipe.category}
            </Badge>
          </div>
          
          {showDescription && (
            <p 
              className="font-mono text-sm text-neutral-600 mb-4 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: highlightText(formatRecipeDescription(recipe.description, 100)) }}
            />
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-600">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {formatTime(recipe.prepTime + recipe.cookTime)}
              </span>
              <span className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {recipe.servings}
              </span>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", getDifficultyColor(recipe.difficulty))}
            >
              {getDifficultyIcon(recipe.difficulty)} {recipe.difficulty}
            </Badge>
          </div>
          
          {showTags && recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// Recipe card skeleton for loading states
export function RecipeCardSkeleton({ 
  variant = 'default',
  showImage = true,
  className 
}: {
  variant?: 'default' | 'compact' | 'featured'
  showImage?: boolean
  className?: string
}) {
  if (variant === 'compact') {
    return (
      <div className={cn('p-4 bg-white border-2 border-black shadow-brutal', className)}>
        <div className="flex items-start gap-4">
          {showImage && (
            <div className="w-16 h-16 bg-neutral-200 border-2 border-black animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="h-6 w-3/4 bg-neutral-200 animate-pulse" />
              <div className="h-5 w-16 bg-neutral-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
              <div className="h-4 w-16 bg-neutral-200 animate-pulse" />
              <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className={cn('bg-white border-2 border-black shadow-brutal overflow-hidden', className)}>
        {showImage && (
          <div className="h-64 bg-neutral-200 animate-pulse" />
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-8 w-3/4 bg-neutral-200 animate-pulse" />
            <div className="h-6 w-20 bg-neutral-200 animate-pulse" />
          </div>
          <div className="h-4 w-full bg-neutral-200 animate-pulse" />
          <div className="h-4 w-2/3 bg-neutral-200 animate-pulse" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
              <div className="h-4 w-8 bg-neutral-200 animate-pulse" />
              <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-12 bg-neutral-200 animate-pulse" />
              <div className="h-5 w-12 bg-neutral-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white border-2 border-black shadow-brutal overflow-hidden', className)}>
      {showImage && (
        <div className="h-48 bg-neutral-200 animate-pulse" />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-6 w-3/4 bg-neutral-200 animate-pulse" />
          <div className="h-5 w-16 bg-neutral-200 animate-pulse" />
        </div>
        <div className="h-4 w-full bg-neutral-200 animate-pulse" />
        <div className="h-4 w-2/3 bg-neutral-200 animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
            <div className="h-4 w-8 bg-neutral-200 animate-pulse" />
          </div>
          <div className="h-5 w-12 bg-neutral-200 animate-pulse" />
        </div>
        <div className="flex gap-1">
          <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
          <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
          <div className="h-4 w-12 bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Icon components
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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