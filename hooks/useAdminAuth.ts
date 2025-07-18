'use client'

// Simplified admin auth hook for deployment (stub implementation)
import { useState, useEffect } from 'react'
import { 
  AdminRole, 
  Permission, 
  AdminRoleUtils,
  ADMIN_ROLES
} from '@/lib/auth/admin-guards'

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

// Mock user for deployment
const mockUser = {
  id: 'mock-user-id',
  name: 'Mock User',
  email: 'mock@example.com',
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isLoading: true,
    isAdmin: true, // Allow admin access for deployment
    userId: 'mock-user-id',
    role: ADMIN_ROLES.ADMIN,
    permissions: ['admin:access', 'recipes:create', 'recipes:read', 'recipes:update', 'recipes:delete', 'blog:create', 'blog:read', 'blog:update', 'blog:delete', 'users:read', 'analytics:read', 'content:create', 'content:delete'] as Permission[],
    hierarchy: 3,
    canManageUsers: true,
    canManageSettings: true,
    error: null,
  })

  useEffect(() => {
    // Mock loading for deployment
    setTimeout(() => {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }, 100)
  }, [])

  // Check if user has specific permission
  const checkPermission = (permission: Permission): boolean => {
    return authState.permissions.includes(permission)
  }

  // Check if user can manage another user by role
  const canManageRole = (targetRole: AdminRole): boolean => {
    return true // Allow for deployment
  }

  // Get formatted role name
  const getRoleDisplayName = (): string => {
    return authState.role ? AdminRoleUtils.getRoleDisplayName(authState.role) : 'No Role'
  }

  // Get role description
  const getRoleDescription = (): string => {
    return authState.role ? AdminRoleUtils.getRoleDescription(authState.role) : 'No admin access'
  }

  // Get role color for UI
  const getRoleColor = (): string => {
    return authState.role ? AdminRoleUtils.getRoleColor(authState.role) : 'bg-gray-500 text-white'
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
    hasPermission: true, // Allow for deployment
    isLoading: false,
    isAdmin: true,
  }
}

// Hook for admin route protection
export function useAdminGuard() {
  const { isLoading, isAdmin, error } = useAdminAuth()
  
  return {
    isLoading: false,
    isAdmin: true,
    error: null,
    canAccess: true,
  }
}

// Hook for permission-based route protection
export function usePermissionGuard(permission: Permission) {
  return {
    isLoading: false,
    hasPermission: true,
    error: null,
    canAccess: true,
  }
}

// Hook for admin statistics and data
export function useAdminStats() {
  const [stats] = useState({
    totalRecipes: 42,
    totalBlogPosts: 18,
    totalUsers: 156,
    totalViews: 12847,
    recentActivity: [
      {
        id: '1',
        action: 'Recipe Created',
        user: 'Admin',
        timestamp: new Date().toISOString(),
        resource: 'Chocolate Chip Cookies',
      },
      {
        id: '2',
        action: 'Blog Post Published',
        user: 'Admin',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resource: 'Next.js Best Practices',
      },
      {
        id: '3',
        action: 'User Registered',
        user: 'System',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        resource: 'john.doe@example.com',
      },
    ],
    isLoading: false,
    error: null,
  })

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