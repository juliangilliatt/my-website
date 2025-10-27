'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

// Simplified types for single-admin setup
export type AdminRole = 'ADMIN'

// Admin roles constant
export const ADMIN_ROLES = {
  ADMIN: 'ADMIN' as AdminRole
}
export type Permission = 
  | 'admin:access'
  | 'recipes:create' 
  | 'recipes:read' 
  | 'recipes:update' 
  | 'recipes:delete'
  | 'blog:create'
  | 'blog:read'
  | 'blog:update'
  | 'blog:delete'
  | 'users:read'
  | 'analytics:read'
  | 'content:create'
  | 'content:delete'
  | 'settings:update'

export interface AdminAuthState {
  isLoading: boolean
  isAdmin: boolean
  userId: string | null
  role: AdminRole | null
  permissions: Permission[]
  hierarchy: number
  canManageUsers: boolean
  canManageSettings: boolean
  error: string | null
}

// All permissions for single admin setup
const ALL_PERMISSIONS: Permission[] = [
  'admin:access',
  'recipes:create',
  'recipes:read', 
  'recipes:update',
  'recipes:delete',
  'blog:create',
  'blog:read',
  'blog:update',
  'blog:delete',
  'users:read',
  'analytics:read',
  'content:create',
  'content:delete',
  'settings:update'
]

export function useAdminAuth() {
  const { user, isLoaded } = useUser()
  
  const [authState, setAuthState] = useState<AdminAuthState>({
    isLoading: true,
    isAdmin: false,
    userId: null,
    role: null,
    permissions: [],
    hierarchy: 0,
    canManageUsers: false,
    canManageSettings: false,
    error: null,
  })

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // For single-admin setup, any authenticated user is admin
        setAuthState({
          isLoading: false,
          isAdmin: true,
          userId: user.id,
          role: 'ADMIN',
          permissions: ALL_PERMISSIONS,
          hierarchy: 3,
          canManageUsers: true,
          canManageSettings: true,
          error: null,
        })
      } else {
        setAuthState({
          isLoading: false,
          isAdmin: false,
          userId: null,
          role: null,
          permissions: [],
          hierarchy: 0,
          canManageUsers: false,
          canManageSettings: false,
          error: null,
        })
      }
    }
  }, [user, isLoaded])

  // Check if user has specific permission
  const checkPermission = (permission: Permission): boolean => {
    return authState.permissions.includes(permission)
  }

  // Check if user can manage another user by role
  const canManageRole = (targetRole: AdminRole): boolean => {
    return authState.isAdmin
  }

  // Get formatted role name
  const getRoleDisplayName = (): string => {
    return authState.role ? 'Admin' : 'No Role'
  }

  // Get role description
  const getRoleDescription = (): string => {
    return authState.role ? 'Full administrative access' : 'No admin access'
  }

  // Get role color for UI
  const getRoleColor = (): string => {
    return authState.role ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
  }

  return {
    ...authState,
    checkPermission,
    canManageRole,
    getRoleDisplayName,
    getRoleDescription,
    getRoleColor,
  }
}

// Hook for checking specific permissions
export function usePermission(permission: Permission) {
  const { checkPermission, isLoading, isAdmin } = useAdminAuth()
  
  return {
    hasPermission: checkPermission(permission),
    isLoading,
    isAdmin,
  }
}

// Hook for admin route protection
export function useAdminGuard() {
  const { isLoading, isAdmin, error } = useAdminAuth()
  
  return {
    isLoading,
    isAdmin,
    error,
    canAccess: isAdmin,
  }
}

// Hook for permission-based route protection
export function usePermissionGuard(permission: Permission) {
  const { checkPermission, isLoading, isAdmin, error } = useAdminAuth()
  
  return {
    isLoading,
    hasPermission: checkPermission(permission),
    error,
    canAccess: checkPermission(permission),
  }
}

// Hook for admin statistics and data
export function useAdminStats() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalBlogPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    recentActivity: [] as Array<{
      id: string
      action: string
      user: string
      timestamp: string
      resource: string
    }>,
    isLoading: true,
    error: null as string | null,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats({
          totalRecipes: data.totalRecipes || 0,
          totalBlogPosts: data.totalBlogPosts || 0,
          totalUsers: data.totalUsers || 0,
          totalViews: data.totalViews || 0,
          recentActivity: data.recentActivity || [],
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }

    fetchStats()
  }, [])

  return stats
}

// Hook for admin actions with logging
export function useAdminActions() {
  const logAction = async (
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) => {
    console.log('Admin action logged (mock):', {
      action,
      resource,
      resourceId,
      metadata,
      timestamp: new Date().toISOString(),
    })
  }

  const executeAction = async <T>(
    action: string,
    resource: string,
    fn: () => Promise<T>,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const result = await fn()
    await logAction(action, resource, resourceId, metadata)
    return result
  }

  return {
    logAction,
    executeAction,
    isAdmin: true,
    userId: 'mock-user-id',
    role: ADMIN_ROLES.ADMIN,
  }
}

// Hook for real-time admin notifications
export function useAdminNotifications() {
  const [notifications] = useState<Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    read: boolean
  }>>([
    {
      id: '1',
      type: 'info',
      title: 'Deployment Mode',
      message: 'Authentication is disabled for deployment demo.',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ])

  const markAsRead = (id: string) => {
    // No-op for deployment
  }

  const markAllAsRead = () => {
    // No-op for deployment
  }

  const removeNotification = (id: string) => {
    // No-op for deployment
  }

  const unreadCount = 1

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  }
}

// Export types for use in components
export type { AdminAuthState }