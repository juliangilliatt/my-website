import { Metadata } from 'next'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { SITE_CONFIG } from '@/lib/constants'
import { auth } from '@clerk/nextjs/server'
import { createRecipe } from './actions'

export const metadata: Metadata = {
  title: `Create Recipe - Admin - ${SITE_CONFIG.name}`,
  description: 'Create a new recipe with ingredients and instructions.',
  robots: 'noindex, nofollow',
}

export default async function CreateRecipePage() {
  // Auth check is handled in layout
  const { userId } = auth()
  const user = userId ? { id: userId, name: 'Admin User' } : null

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
        onSubmit={createRecipe}
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
          author: user?.name || 'Admin User',
          title: '',
          description: '',
          slug: '',
          category: '',
          cuisine: '',
        }}
      />
    </div>
  )
}