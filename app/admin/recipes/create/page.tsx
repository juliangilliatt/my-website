import { Metadata } from 'next'
import { requirePermission } from '@/lib/auth/admin-guards'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { SITE_CONFIG } from '@/lib/constants'
import { RecipeFormData } from '@/lib/validations/admin-forms'

export const metadata: Metadata = {
  title: `Create Recipe - Admin - ${SITE_CONFIG.name}`,
  description: 'Create a new recipe with ingredients and instructions.',
  robots: 'noindex, nofollow',
}

export default async function CreateRecipePage() {
  // Verify admin access with recipe create permission
  await requirePermission('recipes:create')

  // Handle form submission
  const handleSubmit = async (data: RecipeFormData) => {
    'use server'
    
    try {
      // In a real app, this would save to database
      console.log('Creating recipe:', data)
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate success
      return {
        success: true,
        message: 'Recipe created successfully',
        recipeId: 'mock-recipe-id'
      }
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
          author: 'Admin User', // In real app, get from auth context
        }}
      />
    </div>
  )
}