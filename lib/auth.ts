import { auth, clerkClient } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cache } from 'react'

/**
 * Get the current user from Clerk
 */
export const getCurrentUser = cache(async () => {
  const { userId } = auth()
  if (!userId) return null

  try {
    const user = await clerkClient.users.getUser(userId)
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
})

/**
 * Get the current user ID
 */
export const getCurrentUserId = cache(async () => {
  const { userId } = auth()
  return userId
})

/**
 * Check if the current user is authenticated
 */
export const isAuthenticated = cache(async () => {
  const { userId } = auth()
  return !!userId
})

/**
 * Check if the current user is an admin
 */
export const isAdmin = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return false
  
  return user.publicMetadata?.role === 'admin'
})

/**
 * Check if the current user is the owner of a resource
 */
export const isOwner = cache(async (resourceUserId: string) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  return userId === resourceUserId
})

/**
 * Check if the current user can access a resource (admin or owner)
 */
export const canAccessResource = cache(async (resourceUserId: string) => {
  const userId = await getCurrentUserId()
  if (!userId) return false
  
  const userIsAdmin = await isAdmin()
  const userIsOwner = await isOwner(resourceUserId)
  
  return userIsAdmin || userIsOwner
})

/**
 * Require authentication (throws error if not authenticated)
 */
export const requireAuth = async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Authentication required')
  }
}

/**
 * Require admin access (throws error if not admin)
 */
export const requireAdmin = async () => {
  await requireAuth()
  
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error('Admin access required')
  }
}

/**
 * Require resource ownership (throws error if not owner or admin)
 */
export const requireOwnership = async (resourceUserId: string) => {
  await requireAuth()
  
  const canAccess = await canAccessResource(resourceUserId)
  if (!canAccess) {
    throw new Error('Resource access denied')
  }
}

/**
 * Get or create a user in the database
 */
export const getOrCreateUser = cache(async (clerkUser: User) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    })

    if (!user) {
      const email = clerkUser.emailAddresses[0]?.emailAddress
      const name = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
        : clerkUser.username || 'User'

      user = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email: email || '',
          name,
          avatar: clerkUser.imageUrl,
          role: clerkUser.publicMetadata?.role === 'admin' ? 'ADMIN' : 'USER',
          bio: clerkUser.publicMetadata?.bio as string || null,
          website: clerkUser.publicMetadata?.website as string || null,
          twitter: clerkUser.publicMetadata?.twitter as string || null,
          github: clerkUser.publicMetadata?.github as string || null,
          linkedin: clerkUser.publicMetadata?.linkedin as string || null,
          instagram: clerkUser.publicMetadata?.instagram as string || null,
        },
      })
    }

    return user
  } catch (error) {
    console.error('Error getting or creating user:', error)
    throw error
  }
})

/**
 * Update user metadata in Clerk
 */
export const updateUserMetadata = async (
  userId: string,
  metadata: {
    role?: 'admin' | 'user'
    bio?: string
    website?: string
    twitter?: string
    github?: string
    linkedin?: string
    instagram?: string
  }
) => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
      },
    })
  } catch (error) {
    console.error('Error updating user metadata:', error)
    throw error
  }
}

/**
 * Sync user data between Clerk and database
 */
export const syncUser = async (clerkUser: User) => {
  try {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const name = clerkUser.firstName 
      ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
      : clerkUser.username || 'User'

    await prisma.user.upsert({
      where: { id: clerkUser.id },
      update: {
        email: email || '',
        name,
        avatar: clerkUser.imageUrl,
        role: clerkUser.publicMetadata?.role === 'admin' ? 'ADMIN' : 'USER',
        bio: clerkUser.publicMetadata?.bio as string || null,
        website: clerkUser.publicMetadata?.website as string || null,
        twitter: clerkUser.publicMetadata?.twitter as string || null,
        github: clerkUser.publicMetadata?.github as string || null,
        linkedin: clerkUser.publicMetadata?.linkedin as string || null,
        instagram: clerkUser.publicMetadata?.instagram as string || null,
      },
      create: {
        id: clerkUser.id,
        email: email || '',
        name,
        avatar: clerkUser.imageUrl,
        role: clerkUser.publicMetadata?.role === 'admin' ? 'ADMIN' : 'USER',
        bio: clerkUser.publicMetadata?.bio as string || null,
        website: clerkUser.publicMetadata?.website as string || null,
        twitter: clerkUser.publicMetadata?.twitter as string || null,
        github: clerkUser.publicMetadata?.github as string || null,
        linkedin: clerkUser.publicMetadata?.linkedin as string || null,
        instagram: clerkUser.publicMetadata?.instagram as string || null,
      },
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    throw error
  }
}

/**
 * Get user permissions
 */
export const getUserPermissions = cache(async (userId?: string) => {
  const currentUserId = userId || await getCurrentUserId()
  if (!currentUserId) {
    return {
      canCreateRecipes: false,
      canEditRecipes: false,
      canDeleteRecipes: false,
      canCreateBlogPosts: false,
      canEditBlogPosts: false,
      canDeleteBlogPosts: false,
      canManageUsers: false,
      canManageTags: false,
      canViewAnalytics: false,
      canAccessAdmin: false,
    }
  }

  const userIsAdmin = await isAdmin()

  return {
    canCreateRecipes: userIsAdmin,
    canEditRecipes: userIsAdmin,
    canDeleteRecipes: userIsAdmin,
    canCreateBlogPosts: userIsAdmin,
    canEditBlogPosts: userIsAdmin,
    canDeleteBlogPosts: userIsAdmin,
    canManageUsers: userIsAdmin,
    canManageTags: userIsAdmin,
    canViewAnalytics: userIsAdmin,
    canAccessAdmin: userIsAdmin,
  }
})

/**
 * Check if user can perform a specific action
 */
export const canPerformAction = cache(async (
  action: 'create' | 'edit' | 'delete',
  resourceType: 'recipe' | 'blog' | 'user' | 'tag',
  resourceUserId?: string
) => {
  const permissions = await getUserPermissions()
  
  switch (resourceType) {
    case 'recipe':
      if (action === 'create') return permissions.canCreateRecipes
      if (action === 'edit') return permissions.canEditRecipes || (resourceUserId && await isOwner(resourceUserId))
      if (action === 'delete') return permissions.canDeleteRecipes || (resourceUserId && await isOwner(resourceUserId))
      break
    
    case 'blog':
      if (action === 'create') return permissions.canCreateBlogPosts
      if (action === 'edit') return permissions.canEditBlogPosts || (resourceUserId && await isOwner(resourceUserId))
      if (action === 'delete') return permissions.canDeleteBlogPosts || (resourceUserId && await isOwner(resourceUserId))
      break
    
    case 'user':
      if (action === 'create') return permissions.canManageUsers
      if (action === 'edit') return permissions.canManageUsers || (resourceUserId && await isOwner(resourceUserId))
      if (action === 'delete') return permissions.canManageUsers
      break
    
    case 'tag':
      if (action === 'create') return permissions.canManageTags
      if (action === 'edit') return permissions.canManageTags
      if (action === 'delete') return permissions.canManageTags
      break
  }
  
  return false
})

/**
 * Get user role
 */
export const getUserRole = cache(async (userId?: string) => {
  const user = await getCurrentUser()
  if (!user) return 'guest'
  
  return user.publicMetadata?.role === 'admin' ? 'admin' : 'user'
})

/**
 * Format user display name
 */
export const formatUserName = (user: User | null) => {
  if (!user) return 'Guest'
  
  if (user.firstName) {
    return `${user.firstName} ${user.lastName || ''}`.trim()
  }
  
  return user.username || user.emailAddresses[0]?.emailAddress || 'User'
}

/**
 * Get user avatar URL
 */
export const getUserAvatarUrl = (user: User | null) => {
  return user?.imageUrl || '/default-avatar.png'
}

/**
 * Check if user has verified email
 */
export const hasVerifiedEmail = (user: User | null) => {
  if (!user) return false
  return user.emailAddresses.some(email => email.verification?.status === 'verified')
}

/**
 * Get user primary email
 */
export const getUserPrimaryEmail = (user: User | null) => {
  if (!user) return null
  return user.emailAddresses[0]?.emailAddress || null
}

/**
 * Check if user account is complete
 */
export const isUserAccountComplete = (user: User | null) => {
  if (!user) return false
  
  const hasName = !!(user.firstName || user.username)
  const hasEmail = user.emailAddresses.length > 0
  const hasVerifiedEmail = user.emailAddresses.some(email => email.verification?.status === 'verified')
  
  return hasName && hasEmail && hasVerifiedEmail
}

/**
 * Get user signup date
 */
export const getUserSignupDate = (user: User | null) => {
  if (!user) return null
  return new Date(user.createdAt)
}

/**
 * Check if user is recently signed up (within last 7 days)
 */
export const isRecentlySignedUp = (user: User | null) => {
  if (!user) return false
  
  const signupDate = getUserSignupDate(user)
  if (!signupDate) return false
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return signupDate > sevenDaysAgo
}

/**
 * Authentication error types
 */
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN')
  }
}

export class AdminRequiredError extends AuthError {
  constructor(message = 'Admin access required') {
    super(message, 'ADMIN_REQUIRED')
  }
}