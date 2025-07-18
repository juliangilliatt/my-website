import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

// Define admin roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
} as const

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES]

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    'recipes:create',
    'recipes:read',
    'recipes:update',
    'recipes:delete',
    'blog:create',
    'blog:read',
    'blog:update',
    'blog:delete',
    'users:read',
    'users:update',
    'users:delete',
    'admin:access',
    'admin:manage',
    'settings:update',
    'analytics:read',
  ],
  [ADMIN_ROLES.ADMIN]: [
    'recipes:create',
    'recipes:read',
    'recipes:update',
    'recipes:delete',
    'blog:create',
    'blog:read',
    'blog:update',
    'blog:delete',
    'users:read',
    'admin:access',
    'analytics:read',
  ],
  [ADMIN_ROLES.MODERATOR]: [
    'recipes:read',
    'recipes:update',
    'blog:read',
    'blog:update',
    'admin:access',
  ],
  [ADMIN_ROLES.EDITOR]: [
    'recipes:create',
    'recipes:read',
    'recipes:update',
    'blog:create',
    'blog:read',
    'blog:update',
    'admin:access',
  ],
} as const

export type Permission = typeof ROLE_PERMISSIONS[AdminRole][number]

// Check if user is admin (server-side)
export async function requireAdmin(): Promise<{
  userId: string
  role: AdminRole
  permissions: Permission[]
}> {
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const userRole = await getUserRole(userId)
  
  if (!userRole || !isAdminRole(userRole)) {
    redirect('/unauthorized')
  }
  
  return {
    userId,
    role: userRole,
    permissions: ROLE_PERMISSIONS[userRole],
  }
}

// Check if user has specific permission (server-side)
export async function requirePermission(permission: Permission): Promise<{
  userId: string
  role: AdminRole
  permissions: Permission[]
}> {
  const adminData = await requireAdmin()
  
  if (!adminData.permissions.includes(permission)) {
    redirect('/unauthorized')
  }
  
  return adminData
}

// Check if user is admin (client-side)
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false
  
  const role = await getUserRole(userId)
  return role ? isAdminRole(role) : false
}

// Check if user has specific permission (client-side)
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  if (!userId) return false
  
  const role = await getUserRole(userId)
  if (!role || !isAdminRole(role)) return false
  
  return ROLE_PERMISSIONS[role].includes(permission)
}

// Get user role from database or external service
export async function getUserRole(userId: string): Promise<AdminRole | null> {
  try {
    // In a real app, this would fetch from your database
    // For now, we'll check environment variables for demo purposes
    const adminUsers = process.env.ADMIN_USERS?.split(',') || []
    const superAdmins = process.env.SUPER_ADMIN_USERS?.split(',') || []
    
    if (superAdmins.includes(userId)) {
      return ADMIN_ROLES.SUPER_ADMIN
    }
    
    if (adminUsers.includes(userId)) {
      return ADMIN_ROLES.ADMIN
    }
    
    // TODO: Replace with actual database query
    // const user = await db.user.findUnique({
    //   where: { clerkId: userId },
    //   select: { role: true },
    // })
    // return user?.role as AdminRole || null
    
    return null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

// Check if role is an admin role
export function isAdminRole(role: string): role is AdminRole {
  return Object.values(ADMIN_ROLES).includes(role as AdminRole)
}

// Get permissions for a role
export function getPermissionsForRole(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

// Check if role has specific permission
export function roleHasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

// Get role hierarchy (higher number = more permissions)
export function getRoleHierarchy(role: AdminRole): number {
  const hierarchy = {
    [ADMIN_ROLES.EDITOR]: 1,
    [ADMIN_ROLES.MODERATOR]: 2,
    [ADMIN_ROLES.ADMIN]: 3,
    [ADMIN_ROLES.SUPER_ADMIN]: 4,
  }
  return hierarchy[role] || 0
}

// Check if user can manage another user (based on role hierarchy)
export function canManageUser(userRole: AdminRole, targetRole: AdminRole): boolean {
  return getRoleHierarchy(userRole) > getRoleHierarchy(targetRole)
}

// Admin route protection middleware
export async function adminMiddleware(request: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return Response.redirect(new URL('/sign-in', request.url))
  }
  
  const isUserAdmin = await isAdmin(userId)
  
  if (!isUserAdmin) {
    return Response.redirect(new URL('/unauthorized', request.url))
  }
  
  return null // Continue to the route
}

// Permission-based route protection
export async function permissionMiddleware(permission: Permission) {
  return async (request: Request) => {
    const { userId } = auth()
    
    if (!userId) {
      return Response.redirect(new URL('/sign-in', request.url))
    }
    
    const userHasPermission = await hasPermission(userId, permission)
    
    if (!userHasPermission) {
      return Response.redirect(new URL('/unauthorized', request.url))
    }
    
    return null // Continue to the route
  }
}

// Utility functions for admin actions
export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  try {
    // TODO: Implement admin action logging
    console.log('Admin action:', {
      userId,
      action,
      resource,
      resourceId,
      metadata,
      timestamp: new Date().toISOString(),
    })
    
    // In a real app, you would save this to a database
    // await db.adminLog.create({
    //   data: {
    //     userId,
    //     action,
    //     resource,
    //     resourceId,
    //     metadata,
    //     timestamp: new Date(),
    //   },
    // })
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

// Get admin statistics
export async function getAdminStats(userId: string) {
  const userRole = await getUserRole(userId)
  
  if (!userRole || !isAdminRole(userRole)) {
    throw new Error('Unauthorized')
  }
  
  try {
    // TODO: Implement actual stats fetching from database
    // For now, return mock data
    return {
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
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw new Error('Failed to fetch admin statistics')
  }
}

// Validate admin session
export async function validateAdminSession(userId: string): Promise<boolean> {
  try {
    const role = await getUserRole(userId)
    return role ? isAdminRole(role) : false
  } catch (error) {
    console.error('Error validating admin session:', error)
    return false
  }
}

// Get admin user info
export async function getAdminUserInfo(userId: string) {
  const role = await getUserRole(userId)
  
  if (!role || !isAdminRole(role)) {
    return null
  }
  
  return {
    userId,
    role,
    permissions: getPermissionsForRole(role),
    hierarchy: getRoleHierarchy(role),
    canManageUsers: role === ADMIN_ROLES.SUPER_ADMIN || role === ADMIN_ROLES.ADMIN,
    canManageSettings: role === ADMIN_ROLES.SUPER_ADMIN,
  }
}

// Check if user can access admin panel
export async function canAccessAdmin(userId: string): Promise<boolean> {
  if (!userId) return false
  
  const role = await getUserRole(userId)
  return role ? roleHasPermission(role, 'admin:access') : false
}

// Admin role management utilities
export const AdminRoleUtils = {
  // Get all available roles
  getAllRoles: (): AdminRole[] => Object.values(ADMIN_ROLES),
  
  // Get role display name
  getRoleDisplayName: (role: AdminRole): string => {
    const displayNames = {
      [ADMIN_ROLES.SUPER_ADMIN]: 'Super Admin',
      [ADMIN_ROLES.ADMIN]: 'Admin',
      [ADMIN_ROLES.MODERATOR]: 'Moderator',
      [ADMIN_ROLES.EDITOR]: 'Editor',
    }
    return displayNames[role] || role
  },
  
  // Get role description
  getRoleDescription: (role: AdminRole): string => {
    const descriptions = {
      [ADMIN_ROLES.SUPER_ADMIN]: 'Full access to all features and settings',
      [ADMIN_ROLES.ADMIN]: 'Manage content and users',
      [ADMIN_ROLES.MODERATOR]: 'Review and edit content',
      [ADMIN_ROLES.EDITOR]: 'Create and edit content',
    }
    return descriptions[role] || 'Custom role'
  },
  
  // Get role color for UI
  getRoleColor: (role: AdminRole): string => {
    const colors = {
      [ADMIN_ROLES.SUPER_ADMIN]: 'bg-red-500 text-white',
      [ADMIN_ROLES.ADMIN]: 'bg-blue-500 text-white',
      [ADMIN_ROLES.MODERATOR]: 'bg-yellow-500 text-white',
      [ADMIN_ROLES.EDITOR]: 'bg-green-500 text-white',
    }
    return colors[role] || 'bg-gray-500 text-white'
  },
}

// Export types for use in components
export type { AdminRole, Permission }