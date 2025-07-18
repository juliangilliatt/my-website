import { Metadata } from 'next'
import { Suspense } from 'react'
import { RecipeSearchInterface } from '@/components/recipes/RecipeSearchInterface'
import { getRecipes } from '@/lib/actions/recipes'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Discover and explore our collection of delicious recipes with detailed instructions and ingredient lists',
  keywords: ['recipes', 'cooking', 'food', 'kitchen', 'ingredients', 'instructions'],
  openGraph: {
    title: `Recipes - ${SITE_CONFIG.name}`,
    description: 'Discover and explore our collection of delicious recipes',
    type: 'website',
    url: '/recipes',
  },
}

interface RecipesPageProps {
  searchParams: {
    q?: string
    category?: string
    difficulty?: string
    maxTime?: string
    servings?: string
    tags?: string
    sort?: string
    page?: string
    view?: string
  }
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const {
    q = '',
    category = 'all',
    difficulty = 'all',
    maxTime = '0',
    servings = '0',
    tags = '',
    sort = 'newest',
    page = '1',
    view = 'grid',
  } = searchParams

  // Parse search parameters
  const filters = {
    category,
    difficulty,
    maxTime: parseInt(maxTime),
    servings: parseInt(servings),
    tags: tags ? tags.split(',').filter(Boolean) : [],
  }

  const pagination = {
    page: parseInt(page),
    limit: 12,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-black uppercase tracking-wide mb-4">
            Recipes
          </h1>
          <p className="text-lg font-mono text-neutral-600 max-w-2xl">
            Discover delicious recipes with detailed instructions, ingredient lists, and cooking tips. 
            Search by category, difficulty, or cooking time to find the perfect recipe for any occasion.
          </p>
        </div>

        {/* Recipe Search Interface */}
        <Suspense fallback={<RecipeSearchInterfaceSkeleton />}>
          <RecipeSearchInterface
            initialQuery={q}
            initialFilters={filters}
            initialSort={sort}
            initialPage={pagination.page}
            initialView={view as 'grid' | 'list'}
          />
        </Suspense>
      </div>
    </main>
  )
}

// Loading skeleton for the search interface
function RecipeSearchInterfaceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 h-12 bg-neutral-200 border-2 border-black animate-pulse" />
        <div className="w-24 h-12 bg-neutral-200 border-2 border-black animate-pulse" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-8 bg-neutral-200 border-2 border-black animate-pulse" />
        ))}
      </div>

      {/* Results header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-neutral-200 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-16 h-8 bg-neutral-200 border-2 border-black animate-pulse" />
          <div className="w-24 h-8 bg-neutral-200 border-2 border-black animate-pulse" />
        </div>
      </div>

      {/* Recipe grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white border-2 border-black shadow-brutal overflow-hidden">
            <div className="h-48 bg-neutral-200 animate-pulse" />
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Generate static params for common recipe searches
export async function generateStaticParams() {
  return [
    { searchParams: {} },
    { searchParams: { category: 'main-course' } },
    { searchParams: { category: 'desserts' } },
    { searchParams: { category: 'appetizers' } },
    { searchParams: { difficulty: 'easy' } },
    { searchParams: { maxTime: '30' } },
  ]
}