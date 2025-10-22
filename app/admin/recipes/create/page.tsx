import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { SITE_CONFIG } from '@/lib/constants'
import { RecipeFormData } from '@/lib/validations/admin-forms'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { recipeSchema } from '@/lib/validations/recipe'

export const metadata: Metadata = {
  title: `Create Recipe - Admin - ${SITE_CONFIG.name}`,
  description: 'Create a new recipe with ingredients and instructions.',
  robots: 'noindex, nofollow',
}

export default async function CreateRecipePage() {
  // Auth check is handled in layout
  const { userId } = auth()
  const user = userId ? { id: userId } : null

  // Handle form submission
  const handleSubmit = async (data: RecipeFormData) => {
    'use server'

    try {
      // Get current user
      const { userId } = auth()
      if (!userId) {
        throw new Error('Authentication required')
      }

      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Transform form data to match Prisma schema
      const recipeData = {
        title: data.title,
        slug: slug,
        description: data.description,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        totalTime: data.prepTime + data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        category: data.category,
        cuisine: data.cuisine || '',
        notes: data.notes || '',
        source: data.source || '',
        featured: data.featured || false,
        published: data.published || false,
        authorId: userId,
        ingredients: data.ingredients.map((ingredient, index) => ({
          id: index,
          name: ingredient,
          amount: 1,
          unit: 'unit',
        })),
        instructions: data.instructions.map((instruction, index) => ({
          step: index + 1,
          description: instruction,
        })),
        images: [],
        nutrition: null,
        tagIds: [],
      }

      // Create recipe in database
      const recipe = await prisma.recipe.create({
        data: recipeData,
      })

      // Redirect to recipe edit page
      redirect(`/admin/recipes/${recipe.id}/edit?success=created`)
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw new Error('Failed to create recipe')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-black">Create Recipe</h1>
          <p className="text-neutral-600 font-mono">
            Create a new recipe with ingredients, instructions, and details
          </p>
        </div>
        <AdminBreadcrumb 
          items={[
            { name: 'Recipes', href: '/admin/recipes' },
            { name: 'Create' }
          ]} 
        />
      </div>

      {/* Form */}
      <RecipeForm
        mode="create"
        onSubmit={handleSubmit}
        initialData={{
          // Set some defaults
          difficulty: 'easy',
          prepTime: 15,
          cookTime: 30,
          servings: 4,
          ingredients: [''],
          instructions: [''],
          tags: [],
          published: false,
          featured: false,
          author: user?.name || 'Admin User'
        }}
      />
    </div>
  )
}