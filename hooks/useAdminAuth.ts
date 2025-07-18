'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  AdminRole, 
  Permission, 
  getUserRole, 
  isAdminRole, 
  hasPermission, 
  getPermissionsForRole,
  getAdminUserInfo,
  AdminRoleUtils
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
    async function checkAdminStatus() {
      if (!isLoaded) return
      
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        if (!user?.id) {
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
          return
        }

        const adminInfo = await getAdminUserInfo(user.id)
        
        if (!adminInfo) {
          setAuthState({
            isLoading: false,
            isAdmin: false,
            userId: user.id,
            role: null,
            permissions: [],
            hierarchy: 0,
            canManageUsers: false,
            canManageSettings: false,
            error: null,
          })
          return
        }

        setAuthState({
          isLoading: false,
          isAdmin: true,
          userId: user.id,
          role: adminInfo.role,
          permissions: adminInfo.permissions,
          hierarchy: adminInfo.hierarchy,
          canManageUsers: adminInfo.canManageUsers,
          canManageSettings: adminInfo.canManageSettings,
          error: null,
        })
      } catch (error) {
        console.error('Error checking admin status:', error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to check admin status',
        }))
      }
    }

    checkAdminStatus()
  }, [user, isLoaded])

  // Check if user has specific permission
  const checkPermission = (permission: Permission): boolean => {
    return authState.permissions.includes(permission)
  }

  // Check if user can manage another user by role
  const canManageRole = (targetRole: AdminRole): boolean => {
    if (!authState.role) return false
    
    const userHierarchy = AdminRoleUtils.getRoleDisplayName(authState.role)
    const targetHierarchy = AdminRoleUtils.getRoleDisplayName(targetRole)
    
    return authState.hierarchy > AdminRoleUtils.getAllRoles().indexOf(targetRole)
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
    hasPermission: isAdmin && checkPermission(permission),
    isLoading,
    isAdmin,
  }
}

// Hook for admin route protection
export function useAdminGuard() {
  const { isLoading, isAdmin, error } = useAdminAuth()
  
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      // In a real app, you might want to redirect here
      console.warn('User is not an admin')
    }
  }, [isLoading, isAdmin])
  
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
  const hasRequiredPermission = isAdmin && checkPermission(permission)
  
  useEffect(() => {
    if (!isLoading && !hasRequiredPermission) {
      console.warn(`User does not have required permission: ${permission}`)
    }
  }, [isLoading, hasRequiredPermission, permission])
  
  return {
    isLoading,
    hasPermission: hasRequiredPermission,
    error,
    canAccess: hasRequiredPermission,
  }
}

// Hook for admin statistics and data
export function useAdminStats() {
  const { isAdmin, checkPermission } = useAdminAuth()
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalBlogPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    recentActivity: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchStats() {
      if (!isAdmin || !checkPermission('analytics:read')) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Insufficient permissions',
        }))
        return
      }

      try {
        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
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
      } catch (error) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stats',
        }))
      }
    }

    fetchStats()
  }, [isAdmin, checkPermission])

  return stats
}

// Hook for admin actions with logging
export function useAdminActions() {
  const { isAdmin, userId, role } = useAdminAuth()
  
  const logAction = async (
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!isAdmin || !userId) {
      throw new Error('Unauthorized')
    }

    try {
      // Log the action
      console.log('Admin action logged:', {
        userId,
        role,
        action,
        resource,
        resourceId,
        metadata,
        timestamp: new Date().toISOString(),
      })
      
      // In a real app, you would send this to your logging service
      // await fetch('/api/admin/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId,
      //     action,
      //     resource,
      //     resourceId,
      //     metadata,
      //   }),
      // })
    } catch (error) {
      console.error('Failed to log admin action:', error)
    }
  }

  const executeAction = async <T>(
    action: string,
    resource: string,
    fn: () => Promise<T>,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<T> => {
    if (!isAdmin) {
      throw new Error('Unauthorized')
    }

    try {
      const result = await fn()
      await logAction(action, resource, resourceId, metadata)
      return result
    } catch (error) {
      await logAction(`${action}_failed`, resource, resourceId, {
        ...metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  return {
    logAction,
    executeAction,
    isAdmin,
    userId,
    role,
  }
}

// Hook for real-time admin notifications
export function useAdminNotifications() {
  const { isAdmin } = useAdminAuth()
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    read: boolean
  }>>([])

  useEffect(() => {
    if (!isAdmin) return

    // Mock notifications
    setNotifications([
      {
        id: '1',
        type: 'info',
        title: 'New Recipe Submitted',
        message: 'A new recipe "Banana Bread" has been submitted for review.',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'warning',
        title: 'High Error Rate',
        message: 'The application has experienced a 15% increase in error rate.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
      },
      {
        id: '3',
        type: 'success',
        title: 'Backup Completed',
        message: 'Daily database backup has been completed successfully.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
      },
    ])
  }, [isAdmin])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

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