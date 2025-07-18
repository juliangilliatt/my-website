'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { recipeSchema, recipeUpdateSchema } from '@/lib/validations/recipe'
import { slugify } from '@/lib/utils/slug'
import { processSearchQuery } from '@/lib/utils/search'
import type { Recipe, SearchQuery } from '@/types'

export async function getRecipes(params: SearchQuery = {}) {
  try {
    const {
      q,
      category,
      cuisine,
      difficulty,
      prepTime,
      cookTime,
      servings,
      dietary,
      method,
      page = 1,
      limit = 12,
      sort = 'newest',
      order = 'desc',
    } = params

    const skip = (page - 1) * limit
    const where: any = {
      published: true,
    }

    // Text search
    if (q) {
      const searchQuery = processSearchQuery(q)
      where.$text = {
        $search: searchQuery,
      }
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Cuisine filter
    if (cuisine) {
      where.cuisine = cuisine
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty
    }

    // Time filters
    if (prepTime) {
      where.prepTime = { $lte: prepTime }
    }

    if (cookTime) {
      where.cookTime = { $lte: cookTime }
    }

    // Servings filter
    if (servings) {
      where.servings = { $gte: servings }
    }

    // Dietary restrictions filter
    if (dietary && dietary.length > 0) {
      where.tags = {
        $elemMatch: {
          name: { $in: dietary }
        }
      }
    }

    // Cooking method filter
    if (method) {
      where.tags = {
        $elemMatch: {
          name: method
        }
      }
    }

    // Sorting
    let orderBy: any = {}
    switch (sort) {
      case 'newest':
        orderBy.createdAt = order
        break
      case 'oldest':
        orderBy.createdAt = order === 'desc' ? 'asc' : 'desc'
        break
      case 'popular':
        orderBy.views = order
        break
      case 'rating':
        orderBy.rating = order
        break
      case 'title':
        orderBy.title = order
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error('Error fetching recipes:', error)
    throw new Error('Failed to fetch recipes')
  }
}

export async function getRecipeBySlug(slug: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    return recipe
  } catch (error) {
    console.error('Error fetching recipe:', error)
    throw new Error('Failed to fetch recipe')
  }
}

export async function getFeaturedRecipes(limit = 6) {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        published: true,
        featured: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return recipes
  } catch (error) {
    console.error('Error fetching featured recipes:', error)
    throw new Error('Failed to fetch featured recipes')
  }
}

export async function getRelatedRecipes(recipeId: string, limit = 4) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { tags: true },
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    const tagIds = recipe.tags.map(tag => tag.id)

    const relatedRecipes = await prisma.recipe.findMany({
      where: {
        published: true,
        id: { not: recipeId },
        OR: [
          { category: recipe.category },
          { cuisine: recipe.cuisine },
          { tagIds: { hasSome: tagIds } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return relatedRecipes
  } catch (error) {
    console.error('Error fetching related recipes:', error)
    throw new Error('Failed to fetch related recipes')
  }
}

export async function createRecipe(data: z.infer<typeof recipeSchema>) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const validatedData = recipeSchema.parse(data)

    // Generate unique slug
    let slug = slugify(validatedData.title)
    let counter = 1
    
    while (await prisma.recipe.findUnique({ where: { slug } })) {
      slug = `${slugify(validatedData.title)}-${counter}`
      counter++
    }

    // Calculate total time
    const totalTime = validatedData.prepTime + validatedData.cookTime

    // Handle tags
    const tagIds = await Promise.all(
      validatedData.tags.map(async (tagName) => {
        const tag = await prisma.tag.upsert({
          where: { slug: slugify(tagName) },
          update: { count: { increment: 1 } },
          create: {
            name: tagName,
            slug: slugify(tagName),
            count: 1,
          },
        })
        return tag.id
      })
    )

    const recipe = await prisma.recipe.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        ingredients: validatedData.ingredients,
        instructions: validatedData.instructions,
        prepTime: validatedData.prepTime,
        cookTime: validatedData.cookTime,
        totalTime,
        servings: validatedData.servings,
        difficulty: validatedData.difficulty,
        category: validatedData.category,
        cuisine: validatedData.cuisine,
        images: validatedData.images || [],
        nutrition: validatedData.nutrition || null,
        notes: validatedData.notes || null,
        source: validatedData.source || null,
        featured: validatedData.featured || false,
        published: validatedData.published || false,
        authorId: userId,
        tagIds,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
    })

    revalidatePath('/recipes')
    revalidatePath('/admin/recipes')

    return recipe
  } catch (error) {
    console.error('Error creating recipe:', error)
    throw new Error('Failed to create recipe')
  }
}

export async function updateRecipe(
  id: string,
  data: z.infer<typeof recipeUpdateSchema>
) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!existingRecipe) {
      throw new Error('Recipe not found')
    }

    // Check if user owns the recipe or is admin
    if (existingRecipe.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    const validatedData = recipeUpdateSchema.parse(data)

    // Handle slug update if title changed
    let slug = existingRecipe.slug
    if (validatedData.title && validatedData.title !== existingRecipe.title) {
      slug = slugify(validatedData.title)
      let counter = 1
      
      while (await prisma.recipe.findFirst({ 
        where: { slug, id: { not: id } } 
      })) {
        slug = `${slugify(validatedData.title)}-${counter}`
        counter++
      }
    }

    // Calculate total time if times changed
    const totalTime = validatedData.prepTime && validatedData.cookTime
      ? validatedData.prepTime + validatedData.cookTime
      : existingRecipe.totalTime

    // Handle tags if provided
    let tagIds = existingRecipe.tagIds
    if (validatedData.tags) {
      // Decrement count for old tags
      await Promise.all(
        existingRecipe.tags.map(async (tag) => {
          await prisma.tag.update({
            where: { id: tag.id },
            data: { count: { decrement: 1 } },
          })
        })
      )

      // Handle new tags
      tagIds = await Promise.all(
        validatedData.tags.map(async (tagName) => {
          const tag = await prisma.tag.upsert({
            where: { slug: slugify(tagName) },
            update: { count: { increment: 1 } },
            create: {
              name: tagName,
              slug: slugify(tagName),
              count: 1,
            },
          })
          return tag.id
        })
      )
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
        totalTime,
        tagIds,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
    })

    revalidatePath('/recipes')
    revalidatePath(`/recipes/${recipe.slug}`)
    revalidatePath('/admin/recipes')

    return recipe
  } catch (error) {
    console.error('Error updating recipe:', error)
    throw new Error('Failed to update recipe')
  }
}

export async function deleteRecipe(id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    // Check if user owns the recipe or is admin
    if (recipe.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    // Decrement tag counts
    await Promise.all(
      recipe.tags.map(async (tag) => {
        await prisma.tag.update({
          where: { id: tag.id },
          data: { count: { decrement: 1 } },
        })
      })
    )

    await prisma.recipe.delete({
      where: { id },
    })

    revalidatePath('/recipes')
    revalidatePath('/admin/recipes')

    return { success: true }
  } catch (error) {
    console.error('Error deleting recipe:', error)
    throw new Error('Failed to delete recipe')
  }
}

export async function toggleRecipeFeatured(id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      throw new Error('Unauthorized')
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { featured: true },
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { featured: !recipe.featured },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
    })

    revalidatePath('/recipes')
    revalidatePath('/admin/recipes')

    return updatedRecipe
  } catch (error) {
    console.error('Error toggling recipe featured:', error)
    throw new Error('Failed to toggle recipe featured status')
  }
}

export async function toggleRecipePublished(id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { published: true, authorId: true },
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    // Check if user owns the recipe or is admin
    if (recipe.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { published: !recipe.published },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
    })

    revalidatePath('/recipes')
    revalidatePath('/admin/recipes')

    return updatedRecipe
  } catch (error) {
    console.error('Error toggling recipe published:', error)
    throw new Error('Failed to toggle recipe published status')
  }
}

export async function getRecipeCategories() {
  try {
    const categories = await prisma.recipe.groupBy({
      by: ['category'],
      where: { published: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    return categories.map(category => ({
      name: category.category,
      count: category._count.id,
    }))
  } catch (error) {
    console.error('Error fetching recipe categories:', error)
    throw new Error('Failed to fetch recipe categories')
  }
}

export async function getRecipeCuisines() {
  try {
    const cuisines = await prisma.recipe.groupBy({
      by: ['cuisine'],
      where: { published: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    return cuisines.map(cuisine => ({
      name: cuisine.cuisine,
      count: cuisine._count.id,
    }))
  } catch (error) {
    console.error('Error fetching recipe cuisines:', error)
    throw new Error('Failed to fetch recipe cuisines')
  }
}