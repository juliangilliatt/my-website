'use server'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { RecipeFormData } from '@/lib/validations/admin-forms'

export async function createRecipe(data: RecipeFormData) {
  try {
    // Get current user
    const { userId } = auth()
    if (!userId) {
      throw new Error('Authentication required')
    }

    // Generate slug from title (with fallback for drafts)
    const title = data.title || 'Untitled Recipe'
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || `recipe-${Date.now()}`

    // Transform form data to match Prisma schema
    // Allow minimal data for drafts
    const recipeData = {
      title: title,
      slug: slug,
      description: data.description || '',
      prepTime: data.prepTime || 0,
      cookTime: data.cookTime || 0,
      totalTime: (data.prepTime || 0) + (data.cookTime || 0),
      servings: data.servings || 1,
      difficulty: data.difficulty || 'easy',
      category: data.category || 'main-course',
      cuisine: data.cuisine || '',
      notes: data.notes || '',
      source: data.source || '',
      featured: data.featured || false,
      published: data.published || false,
      authorId: userId,
      ingredients: (data.ingredients || ['']).filter(i => i.trim()).map((ingredient, index) => ({
        id: index,
        name: ingredient,
        amount: 1,
        unit: 'unit',
      })),
      instructions: (data.instructions || ['']).filter(i => i.trim()).map((instruction, index) => ({
        step: index + 1,
        description: instruction,
      })),
      images: [],
      nutrition: null,
    }

    // Ensure at least one ingredient and instruction for database
    if (recipeData.ingredients.length === 0) {
      recipeData.ingredients = [{ id: 0, name: 'To be added', amount: 1, unit: 'unit' }]
    }
    if (recipeData.instructions.length === 0) {
      recipeData.instructions = [{ step: 1, description: 'To be added' }]
    }

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: recipeData,
    })

    // Return the recipe ID for redirect
    return { success: true, recipeId: recipe.id }
  } catch (error) {
    console.error('Error creating recipe:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
