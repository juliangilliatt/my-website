'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { slugify } from '@/lib/utils/slug'

const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  color: z.string().optional(),
})

const tagUpdateSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters').optional(),
  color: z.string().optional(),
})

export async function getAllTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return tags
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw new Error('Failed to fetch tags')
  }
}

export async function getPopularTags(limit = 20) {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        count: {
          gt: 0,
        },
      },
      orderBy: {
        count: 'desc',
      },
      take: limit,
    })

    return tags
  } catch (error) {
    console.error('Error fetching popular tags:', error)
    throw new Error('Failed to fetch popular tags')
  }
}

export async function getTagsByType(type: 'recipe' | 'blog' | 'all' = 'all') {
  try {
    let tags

    if (type === 'recipe') {
      tags = await prisma.tag.findMany({
        where: {
          recipeIds: {
            isEmpty: false,
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    } else if (type === 'blog') {
      tags = await prisma.tag.findMany({
        where: {
          blogPostIds: {
            isEmpty: false,
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    } else {
      tags = await prisma.tag.findMany({
        orderBy: {
          name: 'asc',
        },
      })
    }

    return tags
  } catch (error) {
    console.error('Error fetching tags by type:', error)
    throw new Error('Failed to fetch tags by type')
  }
}

export async function getTagBySlug(slug: string) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        recipes: {
          where: { published: true },
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
        },
        blogPosts: {
          where: { status: 'PUBLISHED' },
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
            publishedAt: 'desc',
          },
        },
      },
    })

    if (!tag) {
      throw new Error('Tag not found')
    }

    return tag
  } catch (error) {
    console.error('Error fetching tag:', error)
    throw new Error('Failed to fetch tag')
  }
}

export async function createTag(data: z.infer<typeof tagSchema>) {
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

    const validatedData = tagSchema.parse(data)

    // Generate unique slug
    let slug = slugify(validatedData.name)
    let counter = 1
    
    while (await prisma.tag.findUnique({ where: { slug } })) {
      slug = `${slugify(validatedData.name)}-${counter}`
      counter++
    }

    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        slug,
        color: validatedData.color || '#000000',
      },
    })

    revalidatePath('/admin/tags')

    return tag
  } catch (error) {
    console.error('Error creating tag:', error)
    throw new Error('Failed to create tag')
  }
}

export async function updateTag(id: string, data: z.infer<typeof tagUpdateSchema>) {
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

    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      throw new Error('Tag not found')
    }

    const validatedData = tagUpdateSchema.parse(data)

    // Handle slug update if name changed
    let slug = existingTag.slug
    if (validatedData.name && validatedData.name !== existingTag.name) {
      slug = slugify(validatedData.name)
      let counter = 1
      
      while (await prisma.tag.findFirst({ 
        where: { slug, id: { not: id } } 
      })) {
        slug = `${slugify(validatedData.name)}-${counter}`
        counter++
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
      },
    })

    revalidatePath('/admin/tags')
    revalidatePath(`/tags/${tag.slug}`)

    return tag
  } catch (error) {
    console.error('Error updating tag:', error)
    throw new Error('Failed to update tag')
  }
}

export async function deleteTag(id: string) {
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

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        recipes: true,
        blogPosts: true,
      },
    })

    if (!tag) {
      throw new Error('Tag not found')
    }

    // Check if tag is being used
    if (tag.recipes.length > 0 || tag.blogPosts.length > 0) {
      throw new Error('Cannot delete tag that is being used')
    }

    await prisma.tag.delete({
      where: { id },
    })

    revalidatePath('/admin/tags')

    return { success: true }
  } catch (error) {
    console.error('Error deleting tag:', error)
    throw new Error('Failed to delete tag')
  }
}

export async function findOrCreateTag(name: string) {
  try {
    const slug = slugify(name)
    
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        count: 0,
      },
    })

    return tag
  } catch (error) {
    console.error('Error finding or creating tag:', error)
    throw new Error('Failed to find or create tag')
  }
}

export async function associateTagWithRecipe(tagId: string, recipeId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { authorId: true, tagIds: true },
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

    // Check if tag is already associated
    if (recipe.tagIds.includes(tagId)) {
      return { success: true, message: 'Tag already associated' }
    }

    // Add tag to recipe
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        tagIds: {
          push: tagId,
        },
      },
    })

    // Increment tag count
    await prisma.tag.update({
      where: { id: tagId },
      data: {
        count: {
          increment: 1,
        },
      },
    })

    revalidatePath(`/recipes/${recipe.id}`)
    revalidatePath('/admin/recipes')

    return { success: true }
  } catch (error) {
    console.error('Error associating tag with recipe:', error)
    throw new Error('Failed to associate tag with recipe')
  }
}

export async function removeTagFromRecipe(tagId: string, recipeId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { authorId: true, tagIds: true },
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

    // Remove tag from recipe
    const updatedTagIds = recipe.tagIds.filter(id => id !== tagId)
    
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        tagIds: updatedTagIds,
      },
    })

    // Decrement tag count
    await prisma.tag.update({
      where: { id: tagId },
      data: {
        count: {
          decrement: 1,
        },
      },
    })

    revalidatePath(`/recipes/${recipe.id}`)
    revalidatePath('/admin/recipes')

    return { success: true }
  } catch (error) {
    console.error('Error removing tag from recipe:', error)
    throw new Error('Failed to remove tag from recipe')
  }
}

export async function associateTagWithBlogPost(tagId: string, blogPostId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId },
      select: { authorId: true, tagIds: true },
    })

    if (!blogPost) {
      throw new Error('Blog post not found')
    }

    // Check if user owns the blog post or is admin
    if (blogPost.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    // Check if tag is already associated
    if (blogPost.tagIds.includes(tagId)) {
      return { success: true, message: 'Tag already associated' }
    }

    // Add tag to blog post
    await prisma.blogPost.update({
      where: { id: blogPostId },
      data: {
        tagIds: {
          push: tagId,
        },
      },
    })

    // Increment tag count
    await prisma.tag.update({
      where: { id: tagId },
      data: {
        count: {
          increment: 1,
        },
      },
    })

    revalidatePath(`/blog/${blogPost.id}`)
    revalidatePath('/admin/blog')

    return { success: true }
  } catch (error) {
    console.error('Error associating tag with blog post:', error)
    throw new Error('Failed to associate tag with blog post')
  }
}

export async function removeTagFromBlogPost(tagId: string, blogPostId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId },
      select: { authorId: true, tagIds: true },
    })

    if (!blogPost) {
      throw new Error('Blog post not found')
    }

    // Check if user owns the blog post or is admin
    if (blogPost.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    // Remove tag from blog post
    const updatedTagIds = blogPost.tagIds.filter(id => id !== tagId)
    
    await prisma.blogPost.update({
      where: { id: blogPostId },
      data: {
        tagIds: updatedTagIds,
      },
    })

    // Decrement tag count
    await prisma.tag.update({
      where: { id: tagId },
      data: {
        count: {
          decrement: 1,
        },
      },
    })

    revalidatePath(`/blog/${blogPost.id}`)
    revalidatePath('/admin/blog')

    return { success: true }
  } catch (error) {
    console.error('Error removing tag from blog post:', error)
    throw new Error('Failed to remove tag from blog post')
  }
}

export async function searchTags(query: string, limit = 10) {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: [
        { count: 'desc' },
        { name: 'asc' },
      ],
      take: limit,
    })

    return tags
  } catch (error) {
    console.error('Error searching tags:', error)
    throw new Error('Failed to search tags')
  }
}

export async function getTagStats() {
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

    const [totalTags, activeTags, topTags] = await Promise.all([
      prisma.tag.count(),
      prisma.tag.count({
        where: {
          count: {
            gt: 0,
          },
        },
      }),
      prisma.tag.findMany({
        orderBy: {
          count: 'desc',
        },
        take: 10,
      }),
    ])

    return {
      totalTags,
      activeTags,
      topTags,
    }
  } catch (error) {
    console.error('Error fetching tag stats:', error)
    throw new Error('Failed to fetch tag stats')
  }
}