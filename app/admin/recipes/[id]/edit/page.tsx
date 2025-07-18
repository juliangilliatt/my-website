import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePermission } from '@/lib/auth/admin-guards'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { SITE_CONFIG } from '@/lib/constants'
import { RecipeFormData } from '@/lib/validations/admin-forms'

interface EditRecipePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditRecipePageProps): Promise<Metadata> {
  const recipe = await getRecipe(params.id)
  
  return {
    title: `Edit ${recipe?.title || 'Recipe'} - Admin - ${SITE_CONFIG.name}`,
    description: `Edit recipe: ${recipe?.title || 'Unknown recipe'}`,
    robots: 'noindex, nofollow',
  }
}

async function getRecipe(id: string) {
  // In a real app, this would fetch from database
  // Mock recipe data for now
  const mockRecipes = [
    {
      id: '1',
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.',
      slug: 'chocolate-chip-cookies',
      category: 'desserts',
      difficulty: 'easy' as const,
      prepTime: 15,
      cookTime: 12,
      servings: 24,
      ingredients: [
        '2 1/4 cups all-purpose flour',
        '1 teaspoon baking soda',
        '1 teaspoon salt',
        '1 cup (2 sticks) butter, softened',
        '3/4 cup granulated sugar',
        '3/4 cup packed brown sugar',
        '2 large eggs',
        '2 teaspoons vanilla extract',
        '2 cups chocolate chips'
      ],
      instructions: [
        'Preheat oven to 375°F (190°C).',
        'In a medium bowl, whisk together flour, baking soda, and salt.',
        'In a large bowl, cream together butter and both sugars until light and fluffy.',
        'Beat in eggs one at a time, then stir in vanilla.',
        'Gradually blend in flour mixture.',
        'Stir in chocolate chips.',
        'Drop rounded tablespoons of dough onto ungreased cookie sheets.',
        'Bake for 9-11 minutes or until golden brown.',
        'Cool on baking sheet for 2 minutes; remove to wire rack.'
      ],
      tags: ['cookies', 'dessert', 'chocolate', 'baking'],
      image: '/images/recipes/chocolate-chip-cookies.jpg',
      imageAlt: 'Freshly baked chocolate chip cookies on a cooling rack',
      notes: 'For extra chewy cookies, slightly underbake them.',
      tips: 'Use room temperature ingredients for best results.',
      nutrition: {
        calories: 150,
        protein: 2,
        carbs: 20,
        fat: 8,
        fiber: 1,
        sugar: 12,
        sodium: 140
      },
      published: true,
      featured: true,
      author: 'Chef Admin',
      cuisine: 'American',
      equipment: ['mixing bowls', 'electric mixer', 'cookie sheets', 'wire rack'],
      source: 'Family Recipe',
      sourceUrl: '',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      title: 'Hearty Beef Stew',
      description: 'A comforting beef stew with tender meat and vegetables in a rich broth.',
      slug: 'hearty-beef-stew',
      category: 'main-courses',
      difficulty: 'medium' as const,
      prepTime: 30,
      cookTime: 120,
      servings: 6,
      ingredients: [
        '2 lbs beef stew meat, cut into chunks',
        '3 tablespoons vegetable oil',
        '1 large onion, diced',
        '3 cloves garlic, minced',
        '4 cups beef broth',
        '2 tablespoons tomato paste',
        '1 teaspoon dried thyme',
        '3 carrots, sliced',
        '3 potatoes, cubed',
        '2 tablespoons flour',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Heat oil in a large pot over medium-high heat.',
        'Brown beef chunks on all sides, about 5-7 minutes total.',
        'Add onion and garlic, cook until softened.',
        'Stir in tomato paste and cook for 1 minute.',
        'Add beef broth, thyme, salt, and pepper.',
        'Bring to a boil, then reduce heat and simmer covered for 1 hour.',
        'Add carrots and potatoes, continue cooking for 30 minutes.',
        'Mix flour with cold water to make a slurry, stir into stew.',
        'Cook for 5 more minutes until thickened.'
      ],
      tags: ['beef', 'stew', 'comfort food', 'winter'],
      image: '/images/recipes/beef-stew.jpg',
      imageAlt: 'Bowl of hearty beef stew with vegetables',
      notes: 'Can be made in a slow cooker on low for 6-8 hours.',
      tips: 'Brown the meat well for better flavor.',
      nutrition: {
        calories: 320,
        protein: 25,
        carbs: 15,
        fat: 12,
        fiber: 3,
        sugar: 4,
        sodium: 450
      },
      published: true,
      featured: false,
      author: 'Chef Admin',
      cuisine: 'American',
      equipment: ['large pot', 'knife', 'cutting board'],
      source: 'Traditional Recipe',
      sourceUrl: '',
      createdAt: '2024-01-08T14:30:00Z',
      updatedAt: '2024-01-09T09:15:00Z'
    }
  ]

  return mockRecipes.find(recipe => recipe.id === id)
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  // Verify admin access with recipe update permission
  await requirePermission('recipes:update')

  // Get recipe data
  const recipe = await getRecipe(params.id)
  
  if (!recipe) {
    notFound()
  }

  // Handle form submission
  const handleSubmit = async (data: RecipeFormData) => {
    'use server'
    
    try {
      // In a real app, this would update in database
      console.log('Updating recipe:', params.id, data)
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate success
      return {
        success: true,
        message: 'Recipe updated successfully',
        recipeId: params.id
      }
    } catch (error) {
      console.error('Error updating recipe:', error)
      throw new Error('Failed to update recipe')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-black">Edit Recipe</h1>
          <p className="text-neutral-600 font-mono">
            Update recipe details, ingredients, and instructions
          </p>
        </div>
        <AdminBreadcrumb 
          items={[
            { name: 'Recipes', href: '/admin/recipes' },
            { name: recipe.title, href: `/admin/recipes/${params.id}` },
            { name: 'Edit' }
          ]} 
        />
      </div>

      {/* Form */}
      <RecipeForm
        mode="edit"
        onSubmit={handleSubmit}
        initialData={{
          title: recipe.title,
          description: recipe.description,
          slug: recipe.slug,
          category: recipe.category,
          difficulty: recipe.difficulty,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tags: recipe.tags,
          image: recipe.image,
          imageAlt: recipe.imageAlt,
          notes: recipe.notes,
          tips: recipe.tips,
          nutrition: recipe.nutrition,
          published: recipe.published,
          featured: recipe.featured,
          author: recipe.author,
          cuisine: recipe.cuisine,
          equipment: recipe.equipment,
          source: recipe.source,
          sourceUrl: recipe.sourceUrl,
        }}
      />
    </div>
  )
}