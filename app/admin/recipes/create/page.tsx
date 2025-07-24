import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { SITE_CONFIG } from '@/lib/constants'
import { RecipeFormData } from '@/lib/validations/admin-forms'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recipeSchema } from '@/lib/validations/recipe'

export const metadata: Metadata = {
  title: `Create Recipe - Admin - ${SITE_CONFIG.name}`,
  description: 'Create a new recipe with ingredients and instructions.',
  robots: 'noindex, nofollow',
}

export default async function CreateRecipePage() {
  // Auth check is handled in layout
  const session = await auth()
  const user = session?.user

  // Handle form submission
  const handleSubmit = async (data: RecipeFormData) => {
    'use server'
    
    try {
      // Get current user
      const session = await auth()
      if (!session?.user?.id) {
        throw new Error('Authentication required')
      }

      // Validate the recipe data
      const validatedData = recipeSchema.parse({
        ...data,
        totalTime: data.prepTime + data.cookTime,
      })

      // Create recipe in database
      const recipe = await prisma.recipe.create({
        data: {
          ...validatedData,
          authorId: session.user.id,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
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
        },
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