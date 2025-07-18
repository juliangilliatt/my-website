'use client'

import { Recipe } from '@prisma/client'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { 
  formatTime, 
  formatServings, 
  getDifficultyColor, 
  getDifficultyIcon, 
  getCategoryColor, 
  getCategoryIcon,
  formatNutritionValue,
  calculateNutritionPerServing 
} from '@/lib/utils/recipe-helpers'
import { cn } from '@/lib/utils'

interface RecipeMetadataProps {
  recipe: Recipe
  servingSize?: number
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  showNutrition?: boolean
  showTags?: boolean
}

export function RecipeMetadata({
  recipe,
  servingSize,
  className,
  variant = 'default',
  showNutrition = true,
  showTags = true,
}: RecipeMetadataProps) {
  const scalingFactor = servingSize ? servingSize / recipe.servings : 1
  const displayServings = servingSize || recipe.servings
  const nutritionPerServing = calculateNutritionPerServing(recipe)

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4 text-sm font-mono text-neutral-600', className)}>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          <span>{formatTime(recipe.prepTime + recipe.cookTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <UsersIcon className="w-4 h-4" />
          <span>{formatServings(displayServings)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{getDifficultyIcon(recipe.difficulty)}</span>
          <span>{recipe.difficulty}</span>
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Main metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetadataCard
            icon={<ClockIcon className="w-5 h-5" />}
            label="Prep Time"
            value={formatTime(recipe.prepTime)}
            color="bg-blue-100 border-blue-500"
          />
          <MetadataCard
            icon={<CookingIcon className="w-5 h-5" />}
            label="Cook Time"
            value={formatTime(recipe.cookTime)}
            color="bg-orange-100 border-orange-500"
          />
          <MetadataCard
            icon={<UsersIcon className="w-5 h-5" />}
            label="Servings"
            value={formatServings(displayServings)}
            color="bg-green-100 border-green-500"
          />
          <MetadataCard
            icon={<span className="text-lg">{getDifficultyIcon(recipe.difficulty)}</span>}
            label="Difficulty"
            value={recipe.difficulty}
            color={getDifficultyColor(recipe.difficulty)}
          />
        </div>

        {/* Category and tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn("font-mono", getCategoryColor(recipe.category))}>
            {getCategoryIcon(recipe.category)} {recipe.category}
          </Badge>
          {showTags && recipe.tags && recipe.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="font-mono text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Nutrition information */}
        {showNutrition && nutritionPerServing && (
          <Card className="p-4">
            <h3 className="text-lg font-mono font-semibold text-black mb-4">
              Nutrition (per serving)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(nutritionPerServing).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-mono font-bold text-black">
                    {formatNutritionValue(value * scalingFactor, getNutritionUnit(key))}
                  </div>
                  <div className="text-xs font-mono text-neutral-600 uppercase tracking-wide">
                    {formatNutritionLabel(key)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 border-2 border-blue-500 shadow-brutal-sm mx-auto mb-2">
            <ClockIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-sm font-mono text-neutral-600">Prep Time</div>
          <div className="text-lg font-mono font-semibold text-black">{formatTime(recipe.prepTime)}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 border-2 border-orange-500 shadow-brutal-sm mx-auto mb-2">
            <CookingIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-sm font-mono text-neutral-600">Cook Time</div>
          <div className="text-lg font-mono font-semibold text-black">{formatTime(recipe.cookTime)}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 border-2 border-green-500 shadow-brutal-sm mx-auto mb-2">
            <UsersIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-sm font-mono text-neutral-600">Servings</div>
          <div className="text-lg font-mono font-semibold text-black">{formatServings(displayServings)}</div>
        </div>

        <div className="text-center">
          <div className={cn("flex items-center justify-center w-12 h-12 border-2 shadow-brutal-sm mx-auto mb-2", getDifficultyColor(recipe.difficulty))}>
            <span className="text-2xl">{getDifficultyIcon(recipe.difficulty)}</span>
          </div>
          <div className="text-sm font-mono text-neutral-600">Difficulty</div>
          <div className="text-lg font-mono font-semibold text-black capitalize">{recipe.difficulty}</div>
        </div>
      </div>

      {/* Total time */}
      <div className="text-center py-4 border-t-2 border-black">
        <div className="text-sm font-mono text-neutral-600">Total Time</div>
        <div className="text-2xl font-mono font-bold text-black">{formatTime(recipe.prepTime + recipe.cookTime)}</div>
      </div>

      {/* Category and tags */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="outline" className={cn("font-mono", getCategoryColor(recipe.category))}>
          {getCategoryIcon(recipe.category)} {recipe.category}
        </Badge>
        {showTags && recipe.tags && recipe.tags.slice(0, 3).map((tag, index) => (
          <Badge key={index} variant="secondary" className="font-mono text-xs">
            {tag}
          </Badge>
        ))}
        {showTags && recipe.tags && recipe.tags.length > 3 && (
          <Badge variant="secondary" className="font-mono text-xs">
            +{recipe.tags.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  )
}

// Individual metadata card
function MetadataCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="text-center">
      <div className={cn("flex items-center justify-center w-12 h-12 border-2 shadow-brutal-sm mx-auto mb-2", color)}>
        {icon}
      </div>
      <div className="text-sm font-mono text-neutral-600">{label}</div>
      <div className="text-lg font-mono font-semibold text-black">{value}</div>
    </div>
  )
}

// Nutrition summary component
export function NutritionSummary({
  recipe,
  servingSize,
  className,
}: {
  recipe: Recipe
  servingSize?: number
  className?: string
}) {
  const nutritionPerServing = calculateNutritionPerServing(recipe)
  const scalingFactor = servingSize ? servingSize / recipe.servings : 1

  if (!nutritionPerServing) {
    return null
  }

  const keyNutrients = [
    { key: 'calories', label: 'Calories', unit: '' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
  ]

  return (
    <div className={cn('flex justify-center gap-6', className)}>
      {keyNutrients.map(({ key, label, unit }) => {
        const value = nutritionPerServing[key]
        if (value === undefined) return null

        return (
          <div key={key} className="text-center">
            <div className="text-xl font-mono font-bold text-black">
              {Math.round(value * scalingFactor)}{unit}
            </div>
            <div className="text-xs font-mono text-neutral-600 uppercase tracking-wide">
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Recipe stats component
export function RecipeStats({
  recipe,
  className,
}: {
  recipe: Recipe
  className?: string
}) {
  const stats = [
    {
      label: 'Ingredients',
      value: recipe.ingredients.length,
      icon: <ListIcon className="w-4 h-4" />,
    },
    {
      label: 'Steps',
      value: recipe.instructions.length,
      icon: <StepsIcon className="w-4 h-4" />,
    },
    {
      label: 'Created',
      value: new Date(recipe.createdAt).toLocaleDateString(),
      icon: <CalendarIcon className="w-4 h-4" />,
    },
  ]

  return (
    <div className={cn('flex justify-center gap-6', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {stat.icon}
            <span className="text-lg font-mono font-semibold text-black">{stat.value}</span>
          </div>
          <div className="text-xs font-mono text-neutral-600 uppercase tracking-wide">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper functions
function getNutritionUnit(key: string): string {
  switch (key) {
    case 'calories':
      return ''
    case 'protein':
    case 'carbs':
    case 'fat':
    case 'fiber':
      return 'g'
    case 'sodium':
      return 'mg'
    default:
      return ''
  }
}

function formatNutritionLabel(key: string): string {
  switch (key) {
    case 'calories':
      return 'Calories'
    case 'protein':
      return 'Protein'
    case 'carbs':
      return 'Carbs'
    case 'fat':
      return 'Fat'
    case 'fiber':
      return 'Fiber'
    case 'sodium':
      return 'Sodium'
    default:
      return key.charAt(0).toUpperCase() + key.slice(1)
  }
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

function CookingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
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

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function StepsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}