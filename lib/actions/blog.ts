'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { blogPostSchema, blogPostUpdateSchema } from '@/lib/validations/blog'
import { slugify } from '@/lib/utils/slug'
import { processSearchQuery } from '@/lib/utils/search'
import { getReadingTime } from '@/lib/utils'
import type { BlogPost, BlogSearchQuery } from '@/types'

export async function getBlogPosts(params: BlogSearchQuery = {}) {
  try {
    const {
      q,
      category,
      tags,
      status = 'published',
      featured,
      page = 1,
      limit = 12,
      sort = 'newest',
      order = 'desc',
    } = params

    const skip = (page - 1) * limit
    const where: any = {}

    // Status filter
    if (status !== 'all') {
      where.status = status.toUpperCase()
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

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = {
        $elemMatch: {
          name: { $in: tags }
        }
      }
    }

    // Featured filter
    if (featured !== undefined) {
      where.featured = featured
    }

    // Sorting
    let orderBy: any = {}
    switch (sort) {
      case 'newest':
        orderBy.publishedAt = order
        break
      case 'oldest':
        orderBy.publishedAt = order === 'desc' ? 'asc' : 'desc'
        break
      case 'popular':
        orderBy.views = order
        break
      case 'title':
        orderBy.title = order
        break
      default:
        orderBy.publishedAt = 'desc'
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
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
      prisma.blogPost.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      posts,
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
    console.error('Error fetching blog posts:', error)
    throw new Error('Failed to fetch blog posts')
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            website: true,
            twitter: true,
            github: true,
          },
        },
        tags: true,
      },
    })

    if (!post) {
      throw new Error('Blog post not found')
    }

    return post
  } catch (error) {
    console.error('Error fetching blog post:', error)
    throw new Error('Failed to fetch blog post')
  }
}

export async function getFeaturedBlogPosts(limit = 3) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
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
        publishedAt: 'desc',
      },
      take: limit,
    })

    return posts
  } catch (error) {
    console.error('Error fetching featured blog posts:', error)
    throw new Error('Failed to fetch featured blog posts')
  }
}

export async function getRelatedBlogPosts(postId: string, limit = 4) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: { tags: true },
    })

    if (!post) {
      throw new Error('Blog post not found')
    }

    const tagIds = post.tags.map(tag => tag.id)

    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: postId },
        OR: [
          { category: post.category },
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
        publishedAt: 'desc',
      },
      take: limit,
    })

    return relatedPosts
  } catch (error) {
    console.error('Error fetching related blog posts:', error)
    throw new Error('Failed to fetch related blog posts')
  }
}

export async function createBlogPost(data: z.infer<typeof blogPostSchema>) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const validatedData = blogPostSchema.parse(data)

    // Generate unique slug
    let slug = slugify(validatedData.title)
    let counter = 1
    
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${slugify(validatedData.title)}-${counter}`
      counter++
    }

    // Calculate reading time
    const readingTime = getReadingTime(validatedData.content)

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

    const post = await prisma.blogPost.create({
      data: {
        title: validatedData.title,
        slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        coverImage: validatedData.coverImage || null,
        category: validatedData.category,
        status: validatedData.status || 'DRAFT',
        featured: validatedData.featured || false,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
        readingTime,
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

    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return post
  } catch (error) {
    console.error('Error creating blog post:', error)
    throw new Error('Failed to create blog post')
  }
}

export async function updateBlogPost(
  id: string,
  data: z.infer<typeof blogPostUpdateSchema>
) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!existingPost) {
      throw new Error('Blog post not found')
    }

    // Check if user owns the post or is admin
    if (existingPost.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    const validatedData = blogPostUpdateSchema.parse(data)

    // Handle slug update if title changed
    let slug = existingPost.slug
    if (validatedData.title && validatedData.title !== existingPost.title) {
      slug = slugify(validatedData.title)
      let counter = 1
      
      while (await prisma.blogPost.findFirst({ 
        where: { slug, id: { not: id } } 
      })) {
        slug = `${slugify(validatedData.title)}-${counter}`
        counter++
      }
    }

    // Calculate reading time if content changed
    const readingTime = validatedData.content
      ? getReadingTime(validatedData.content)
      : existingPost.readingTime

    // Handle tags if provided
    let tagIds = existingPost.tagIds
    if (validatedData.tags) {
      // Decrement count for old tags
      await Promise.all(
        existingPost.tags.map(async (tag) => {
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

    // Handle published date
    let publishedAt = existingPost.publishedAt
    if (validatedData.status === 'PUBLISHED' && !publishedAt) {
      publishedAt = new Date()
    } else if (validatedData.status !== 'PUBLISHED') {
      publishedAt = null
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
        readingTime,
        tagIds,
        publishedAt,
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

    revalidatePath('/blog')
    revalidatePath(`/blog/${post.slug}`)
    revalidatePath('/admin/blog')

    return post
  } catch (error) {
    console.error('Error updating blog post:', error)
    throw new Error('Failed to update blog post')
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!post) {
      throw new Error('Blog post not found')
    }

    // Check if user owns the post or is admin
    if (post.authorId !== userId) {
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
      post.tags.map(async (tag) => {
        await prisma.tag.update({
          where: { id: tag.id },
          data: { count: { decrement: 1 } },
        })
      })
    )

    await prisma.blogPost.delete({
      where: { id },
    })

    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return { success: true }
  } catch (error) {
    console.error('Error deleting blog post:', error)
    throw new Error('Failed to delete blog post')
  }
}

export async function toggleBlogPostFeatured(id: string) {
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

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { featured: true },
    })

    if (!post) {
      throw new Error('Blog post not found')
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: { featured: !post.featured },
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

    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return updatedPost
  } catch (error) {
    console.error('Error toggling blog post featured:', error)
    throw new Error('Failed to toggle blog post featured status')
  }
}

export async function publishBlogPost(id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { status: true, authorId: true },
    })

    if (!post) {
      throw new Error('Blog post not found')
    }

    // Check if user owns the post or is admin
    if (post.authorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: { 
        status: 'PUBLISHED',
        publishedAt: post.status === 'DRAFT' ? new Date() : undefined,
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

    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return updatedPost
  } catch (error) {
    console.error('Error publishing blog post:', error)
    throw new Error('Failed to publish blog post')
  }
}

export async function incrementBlogPostViews(id: string) {
  try {
    await prisma.blogPost.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error incrementing blog post views:', error)
    // Don't throw error for view counting failures
    return { success: false }
  }
}

export async function getBlogCategories() {
  try {
    const categories = await prisma.blogPost.groupBy({
      by: ['category'],
      where: { status: 'PUBLISHED' },
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
    console.error('Error fetching blog categories:', error)
    throw new Error('Failed to fetch blog categories')
  }
}

export async function getPopularBlogPosts(limit = 10) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
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
        views: 'desc',
      },
      take: limit,
    })

    return posts
  } catch (error) {
    console.error('Error fetching popular blog posts:', error)
    throw new Error('Failed to fetch popular blog posts')
  }
}

export async function getRecentBlogPosts(limit = 5) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
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
        publishedAt: 'desc',
      },
      take: limit,
    })

    return posts
  } catch (error) {
    console.error('Error fetching recent blog posts:', error)
    throw new Error('Failed to fetch recent blog posts')
  }
}