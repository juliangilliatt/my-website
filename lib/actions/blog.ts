'use server'

// Simplified blog actions for deployment (stub implementation)
import { revalidatePath } from 'next/cache'
import type { BlogPost, BlogSearchQuery } from '@/types'

// Mock auth function for deployment
function auth() {
  return { userId: 'mock-user-id' }
}

export async function getBlogPosts(params: BlogSearchQuery = {}) {
  // Return empty array for deployment
  return {
    posts: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  }
}

export async function getBlogPostBySlug(slug: string) {
  // Return mock blog post for deployment
  return {
    id: 'mock-blog-id',
    title: 'Sample Blog Post',
    slug: 'sample-blog-post',
    excerpt: 'A sample blog post for deployment testing.',
    content: 'This is sample content for deployment testing.',
    status: 'PUBLISHED',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'mock-user-id',
    category: 'General',
    tags: [],
    author: {
      id: 'mock-user-id',
      name: 'Mock User',
      avatar: null,
    },
  }
}

export async function getFeaturedBlogPosts(limit = 3) {
  return []
}

export async function getRelatedBlogPosts(postId: string, limit = 3) {
  return []
}

export async function createBlogPost(data: any) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Mock blog post creation for deployment
    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return {
      id: 'mock-blog-id',
      title: data.title || 'Sample Blog Post',
      slug: 'sample-blog-post',
    }
  } catch (error) {
    console.error('Error creating blog post:', error)
    throw new Error('Failed to create blog post')
  }
}

export async function updateBlogPost(id: string, data: any) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Mock blog post update for deployment
    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return {
      id,
      title: data.title || 'Updated Blog Post',
      slug: 'updated-blog-post',
    }
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

    // Mock blog post deletion for deployment
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

    // Mock toggle for deployment
    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return { success: true }
  } catch (error) {
    console.error('Error toggling blog post featured:', error)
    throw new Error('Failed to toggle blog post featured status')
  }
}

export async function toggleBlogPostPublished(id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Mock toggle for deployment
    revalidatePath('/blog')
    revalidatePath('/admin/blog')

    return { success: true }
  } catch (error) {
    console.error('Error toggling blog post published:', error)
    throw new Error('Failed to toggle blog post published status')
  }
}

export async function getBlogCategories() {
  return []
}

export async function searchBlogPosts(query: string) {
  return []
}