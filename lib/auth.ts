// Simplified auth utilities for deployment (stub implementation)
import { cache } from 'react'

// Mock user type
interface MockUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
}

// Mock auth function for deployment
function auth() {
  return { userId: 'mock-user-id' }
}

/**
 * Get the current user (mock for deployment)
 */
export const getCurrentUser = cache(async (): Promise<MockUser | null> => {
  const { userId } = auth()
  if (!userId) return null

  // Return mock user for deployment
  return {
    id: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    avatar: '/default-avatar.png',
    role: 'admin',
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
  return true // Allow admin access for deployment
})

/**
 * Check if the current user is the owner of a resource
 */
export const isOwner = cache(async (resourceUserId: string) => {
  return true // Allow ownership for deployment
})

/**
 * Check if the current user can access a resource (admin or owner)
 */
export const canAccessResource = cache(async (resourceUserId: string) => {
  return true // Allow access for deployment
})

/**
 * Require authentication (stub for deployment)
 */
export const requireAuth = async () => {
  // No-op for deployment
}

/**
 * Require admin access (stub for deployment)
 */
export const requireAdmin = async () => {
  // No-op for deployment
}

/**
 * Require resource ownership (stub for deployment)
 */
export const requireOwnership = async (resourceUserId: string) => {
  // No-op for deployment
}

/**
 * Get or create a user in the database (stub for deployment)
 */
export const getOrCreateUser = cache(async (clerkUser: any) => {
  return {
    id: 'mock-user-id',
    email: 'mock@example.com',
    name: 'Mock User',
    avatar: '/default-avatar.png',
    role: 'ADMIN',
  }
})

/**
 * Update user metadata (stub for deployment)
 */
export const updateUserMetadata = async (userId: string, metadata: any) => {
  // No-op for deployment
}

/**
 * Sync user data (stub for deployment)
 */
export const syncUser = async (clerkUser: any) => {
  // No-op for deployment
}

/**
 * Get user permissions (stub for deployment)
 */
export const getUserPermissions = cache(async (userId?: string) => {
  return {
    canCreateRecipes: true,
    canEditRecipes: true,
    canDeleteRecipes: true,
    canCreateBlogPosts: true,
    canEditBlogPosts: true,
    canDeleteBlogPosts: true,
    canManageUsers: true,
    canManageTags: true,
    canViewAnalytics: true,
    canAccessAdmin: true,
  }
})

/**
 * Check if user can perform a specific action (stub for deployment)
 */
export const canPerformAction = cache(async (
  action: 'create' | 'edit' | 'delete',
  resourceType: 'recipe' | 'blog' | 'user' | 'tag',
  resourceUserId?: string
) => {
  return true // Allow all actions for deployment
})

/**
 * Get user role (stub for deployment)
 */
export const getUserRole = cache(async (userId?: string) => {
  return 'admin'
})

/**
 * Format user display name (stub for deployment)
 */
export const formatUserName = (user: any) => {
  return 'Mock User'
}

/**
 * Get user avatar URL (stub for deployment)
 */
export const getUserAvatarUrl = (user: any) => {
  return '/default-avatar.png'
}

/**
 * Check if user has verified email (stub for deployment)
 */
export const hasVerifiedEmail = (user: any) => {
  return true
}

/**
 * Get user primary email (stub for deployment)
 */
export const getUserPrimaryEmail = (user: any) => {
  return 'mock@example.com'
}

/**
 * Check if user account is complete (stub for deployment)
 */
export const isUserAccountComplete = (user: any) => {
  return true
}

/**
 * Get user signup date (stub for deployment)
 */
export const getUserSignupDate = (user: any) => {
  return new Date()
}

/**
 * Check if user is recently signed up (stub for deployment)
 */
export const isRecentlySignedUp = (user: any) => {
  return false
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