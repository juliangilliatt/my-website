import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getRecipeBySlug } from '@/lib/actions/recipes'
import { RecipeHeader } from '@/components/recipes/RecipeHeader'
import { RecipeMetadata } from '@/components/recipes/RecipeMetadata'
import { IngredientsSection } from '@/components/recipes/IngredientsSection'
import { InstructionsSection } from '@/components/recipes/InstructionsSection'
import { RecipeActions } from '@/components/recipes/RecipeActions'
import { RecipeNavigation } from '@/components/recipes/RecipeActions'
import { NutritionSummary } from '@/components/recipes/RecipeMetadata'
import { SITE_CONFIG } from '@/lib/constants'
import { getRecipeImageUrl } from '@/lib/utils/recipe-helpers'

interface RecipePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const recipe = await getRecipeBySlug(params.slug)
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found',
      description: 'The requested recipe could not be found.',
    }
  }

  return {
    title: recipe.title,
    description: recipe.description,
    keywords: [recipe.category, recipe.difficulty, 'recipe', 'cooking', 'food', ...(recipe.tags || [])],
    authors: [{ name: recipe.author || SITE_CONFIG.name }],
    openGraph: {
      title: `${recipe.title} - ${SITE_CONFIG.name}`,
      description: recipe.description,
      type: 'article',
      url: `/recipes/${recipe.slug}`,
      images: recipe.image ? [
        {
          url: recipe.image,
          width: 800,
          height: 600,
          alt: recipe.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description,
      images: recipe.image ? [recipe.image] : [],
    },
    alternates: {
      canonical: `/recipes/${recipe.slug}`,
    },
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipeBySlug(params.slug)

  if (!recipe) {
    notFound()
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.image || getRecipeImageUrl(recipe),
    author: {
      '@type': 'Person',
      name: recipe.author || SITE_CONFIG.name,
    },
    datePublished: recipe.createdAt,
    dateModified: recipe.updatedAt,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine || 'International',
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.prepTime + recipe.cookTime}M`,
    recipeYield: recipe.servings.toString(),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((instruction, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: instruction,
    })),
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories,
      proteinContent: recipe.nutrition.protein,
      carbohydrateContent: recipe.nutrition.carbs,
      fatContent: recipe.nutrition.fat,
    } : undefined,
    keywords: recipe.tags?.join(', '),
    aggregateRating: recipe.rating ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating,
      ratingCount: recipe.reviewCount || 1,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <RecipeNavigation recipe={recipe} />
          
          {/* Recipe Header */}
          <RecipeHeader recipe={recipe} />
          
          {/* Recipe Image */}
          {recipe.image && (
            <div className="relative aspect-video bg-neutral-100 border-2 border-black shadow-brutal mb-8 overflow-hidden">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          {/* Recipe Metadata */}
          <div className="mb-8">
            <RecipeMetadata recipe={recipe} variant="default" />
          </div>
          
          {/* Nutrition Summary */}
          <div className="mb-8">
            <NutritionSummary recipe={recipe} />
          </div>
          
          {/* Main Recipe Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <IngredientsSection recipe={recipe} />
            </div>
            
            {/* Instructions */}
            <div className="lg:col-span-2">
              <InstructionsSection recipe={recipe} />
            </div>
          </div>
          
          {/* Recipe Actions */}
          <div className="mt-8 pt-8 border-t-2 border-black">
            <RecipeActions recipe={recipe} />
          </div>
          
          {/* Additional Information */}
          {(recipe.notes || recipe.tips) && (
            <div className="mt-8 pt-8 border-t-2 border-black">
              <h2 className="text-2xl font-mono font-bold text-black mb-4">Additional Information</h2>
              <div className="space-y-4">
                {recipe.notes && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-500 shadow-brutal">
                    <h3 className="text-lg font-mono font-semibold text-blue-800 mb-2">Notes</h3>
                    <p className="font-mono text-sm text-blue-700">{recipe.notes}</p>
                  </div>
                )}
                {recipe.tips && (
                  <div className="p-4 bg-green-50 border-2 border-green-500 shadow-brutal">
                    <h3 className="text-lg font-mono font-semibold text-green-800 mb-2">Tips</h3>
                    <p className="font-mono text-sm text-green-700">{recipe.tips}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

// Generate static params for popular recipes
export async function generateStaticParams() {
  // In a real app, you'd fetch popular recipe slugs from your database
  return [
    { slug: 'spaghetti-carbonara' },
    { slug: 'chocolate-chip-cookies' },
    { slug: 'chicken-curry' },
    { slug: 'beef-stew' },
    { slug: 'caesar-salad' },
  ]
}

// This page uses ISR with revalidation
export const revalidate = 3600 // 1 hour