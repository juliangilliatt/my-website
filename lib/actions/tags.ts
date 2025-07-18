'use server'

// Simplified tags actions for deployment (stub implementation)
import { revalidatePath } from 'next/cache'

// Mock auth function for deployment
function auth() {
  return { userId: 'mock-user-id' }
}

export async function getAllTags() {
  // Return empty array for deployment
  return []
}

export async function getPopularTags(limit = 20) {
  return []
}

export async function getTagBySlug(slug: string) {
  return {
    id: 'mock-tag-id',
    name: 'Sample Tag',
    slug: 'sample-tag',
    count: 0,
    color: '#3B82F6',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function createTag(data: any) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Mock tag creation for deployment
    revalidatePath('/admin/tags')

    return {
      id: 'mock-tag-id',
      name: data.name || 'Sample Tag',
      slug: 'sample-tag',
      count: 0,
      color: data.color || '#3B82F6',
    }
  } catch (error) {
    console.error('Error creating tag:', error)
    throw new Error('Failed to create tag')
  }
}

export async function updateTag(id: string, data: any) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Mock tag update for deployment
    revalidatePath('/admin/tags')

    return {
      id,
      name: data.name || 'Updated Tag',
      slug: 'updated-tag',
      count: 0,
      color: data.color || '#3B82F6',
    }
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

    // Mock tag deletion for deployment
    revalidatePath('/admin/tags')

    return { success: true }
  } catch (error) {
    console.error('Error deleting tag:', error)
    throw new Error('Failed to delete tag')
  }
}

export async function searchTags(query: string) {
  return []
}

export async function getTagUsageStats() {
  return {
    totalTags: 0,
    usedTags: 0,
    unusedTags: 0,
    averageUsage: 0,
  }
}