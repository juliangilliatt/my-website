import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server'
import { useAuth as useClerkAuth, useUser as useClerkUser, useSession as useClerkSession } from '@clerk/nextjs'
import type { User } from '@clerk/nextjs/server'

// Feature flag for Clerk authentication (disabled for deployment)
const ENABLE_CLERK = process.env.ENABLE_CLERK === 'true'

// Extended user type that includes our role
export interface ExtendedUser {
  id: string
  email: string
  name: string | null
  avatar?: string | null
  role: 'USER' | 'ADMIN'
}

// Mock user for deployment
const mockUser: ExtendedUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Mock User',
  avatar: null,
  role: 'USER'
}

// Auth hook wrapper
export function useAuth() {
  if (ENABLE_CLERK) {
    return useClerkAuth()
  }
  
  // Mock implementation for deployment
  return {
    isLoaded: true,
    isSignedIn: false,
    user: null,
    userId: null,
    sessionId: null,
    signOut: async () => {
      console.log('Sign out disabled for deployment')
    },
  }
}

// User hook wrapper
export function useUser() {
  if (ENABLE_CLERK) {
    return useClerkUser()
  }
  
  // Mock implementation for deployment
  return {
    isLoaded: true,
    user: null, // No user signed in for deployment
  }
}

// Session hook wrapper
export function useSession() {
  if (ENABLE_CLERK) {
    return useClerkSession()
  }
  
  // Mock implementation for deployment
  return {
    isLoaded: true,
    session: null,
  }
}

// Server-side auth
export async function auth() {
  if (ENABLE_CLERK) {
    return clerkAuth()
  }
  
  // Mock implementation for deployment
  return {
    userId: null,
    sessionId: null,
    user: null,
  }
}

// Server-side current user
export async function currentUser(): Promise<User | null> {
  if (ENABLE_CLERK) {
    return clerkCurrentUser()
  }
  
  // Mock implementation for deployment
  return null
}

// Get current user with our extended type
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  if (ENABLE_CLERK) {
    const user = await clerkCurrentUser()
    if (!user) return null
    
    // Convert Clerk user to our extended user type
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || null,
      avatar: user.imageUrl || null,
      role: 'USER', // Default role, would be fetched from database in real implementation
    }
  }
  
  // Mock implementation for deployment
  return null
}

// Check if user has specific role
export async function checkRole(role: 'USER' | 'ADMIN'): Promise<boolean> {
  if (ENABLE_CLERK) {
    const user = await getCurrentUser()
    if (!user) return false
    
    // In real implementation, this would check the database
    return user.role === role
  }
  
  // Mock implementation for deployment (always false)
  return false
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  return checkRole('ADMIN')
}

// Require authentication (server action helper)
export async function requireAuth(): Promise<ExtendedUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Require admin role (server action helper)
export async function requireAdmin(): Promise<ExtendedUser> {
  const user = await requireAuth()
  const hasAdminRole = await isAdmin()
  
  if (!hasAdminRole) {
    throw new Error('Admin role required')
  }
  
  return user
}

// Get user ID from auth
export async function getUserId(): Promise<string | null> {
  if (ENABLE_CLERK) {
    const { userId } = await auth()
    return userId
  }
  
  // Mock implementation for deployment
  return null
}

// Sign out helper (client-side)
export function getSignOut() {
  if (ENABLE_CLERK) {
    const { signOut } = useAuth()
    return signOut
  }
  
  // Mock implementation for deployment
  return async () => {
    console.log('Sign out disabled for deployment')
  }
}

// Utility functions
export function getUserDisplayName(user: ExtendedUser | User): string {
  if ('name' in user && user.name) {
    return user.name
  }
  
  // Handle Clerk user type
  if ('firstName' in user || 'lastName' in user) {
    const clerkUser = user as any
    if (clerkUser.firstName && clerkUser.lastName) {
      return `${clerkUser.firstName} ${clerkUser.lastName}`
    }
    return clerkUser.firstName || clerkUser.lastName || 'User'
  }
  
  return 'User'
}

export function getUserAvatar(user: ExtendedUser | User): string | null {
  if ('avatar' in user) {
    return user.avatar || null
  }
  
  // Handle Clerk user type
  if ('imageUrl' in user) {
    const clerkUser = user as any
    return clerkUser.imageUrl || null
  }
  
  return null
}