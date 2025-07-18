import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  href: string
  label: string
  icon?: React.ReactNode
  badge?: string
  description?: string
  requiresAuth?: boolean
  adminOnly?: boolean
  showInBottomNav?: boolean
  showInSidebar?: boolean
  showInMobile?: boolean
  group?: string
  order?: number
  isExternal?: boolean
  target?: '_blank' | '_self'
  children?: NavigationItem[]
}

export interface NavigationGroup {
  id: string
  label: string
  icon?: React.ReactNode
  items: NavigationItem[]
  order?: number
  collapsible?: boolean
  defaultOpen?: boolean
}

// Main navigation items
export const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: '🏠',
    showInBottomNav: true,
    showInSidebar: true,
    showInMobile: true,
    group: 'main',
    order: 1,
  },
  {
    href: '/recipes',
    label: 'Recipes',
    icon: '🍳',
    showInBottomNav: true,
    showInSidebar: true,
    showInMobile: true,
    group: 'main',
    order: 2,
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: '📝',
    showInBottomNav: true,
    showInSidebar: true,
    showInMobile: true,
    group: 'main',
    order: 3,
  },
  {
    href: '/about',
    label: 'About',
    icon: '👤',
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'main',
    order: 4,
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: '📧',
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'main',
    order: 5,
  },
  {
    href: '/search',
    label: 'Search',
    icon: '🔍',
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'main',
    order: 6,
  },
  {
    href: '/favorites',
    label: 'Favorites',
    icon: '❤️',
    requiresAuth: true,
    showInBottomNav: true,
    showInSidebar: true,
    showInMobile: true,
    group: 'user',
    order: 7,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: '👤',
    requiresAuth: true,
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'user',
    order: 8,
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: '⚙️',
    adminOnly: true,
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'admin',
    order: 9,
  },
  {
    href: '/admin/recipes',
    label: 'Manage Recipes',
    icon: '🍳',
    adminOnly: true,
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'admin',
    order: 10,
  },
  {
    href: '/admin/blog',
    label: 'Manage Blog',
    icon: '📝',
    adminOnly: true,
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'admin',
    order: 11,
  },
  {
    href: '/admin/users',
    label: 'Manage Users',
    icon: '👥',
    adminOnly: true,
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'admin',
    order: 12,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: '📊',
    adminOnly: true,
    showInBottomNav: false,
    showInSidebar: true,
    showInMobile: true,
    group: 'admin',
    order: 13,
  },
]

// Navigation groups for organized display
export const navigationGroups: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    icon: '🏠',
    items: navigationItems.filter(item => item.group === 'main'),
    order: 1,
    collapsible: false,
    defaultOpen: true,
  },
  {
    id: 'user',
    label: 'User',
    icon: '👤',
    items: navigationItems.filter(item => item.group === 'user'),
    order: 2,
    collapsible: true,
    defaultOpen: true,
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '⚙️',
    items: navigationItems.filter(item => item.group === 'admin'),
    order: 3,
    collapsible: true,
    defaultOpen: false,
  },
]

// Route configurations
export const routeConfig = {
  // Public routes (no authentication required)
  publicRoutes: [
    '/',
    '/recipes',
    '/recipes/:slug',
    '/blog',
    '/blog/:slug',
    '/about',
    '/contact',
    '/search',
    '/sign-in',
    '/sign-up',
  ],

  // Protected routes (authentication required)
  protectedRoutes: [
    '/favorites',
    '/profile',
    '/settings',
  ],

  // Admin routes (admin role required)
  adminRoutes: [
    '/admin',
    '/admin/recipes',
    '/admin/recipes/:slug',
    '/admin/blog',
    '/admin/blog/:slug',
    '/admin/users',
    '/admin/analytics',
    '/admin/settings',
  ],

  // Auth routes (redirect if authenticated)
  authRoutes: [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
  ],
}

// Route metadata
export const routeMetadata: Record<string, { title: string; description?: string; keywords?: string[] }> = {
  '/': {
    title: 'Home',
    description: 'Welcome to my brutalist portfolio featuring recipes and blog posts',
    keywords: ['home', 'portfolio', 'recipes', 'blog'],
  },
  '/recipes': {
    title: 'Recipes',
    description: 'Discover and explore delicious recipes',
    keywords: ['recipes', 'cooking', 'food', 'kitchen'],
  },
  '/blog': {
    title: 'Blog',
    description: 'Read about development, cooking, and life',
    keywords: ['blog', 'articles', 'development', 'cooking'],
  },
  '/about': {
    title: 'About',
    description: 'Learn more about me and this website',
    keywords: ['about', 'bio', 'developer', 'chef'],
  },
  '/contact': {
    title: 'Contact',
    description: 'Get in touch with me',
    keywords: ['contact', 'email', 'message'],
  },
  '/search': {
    title: 'Search',
    description: 'Search recipes and blog posts',
    keywords: ['search', 'find', 'recipes', 'blog'],
  },
  '/favorites': {
    title: 'Favorites',
    description: 'Your favorite recipes and blog posts',
    keywords: ['favorites', 'saved', 'bookmarks'],
  },
  '/profile': {
    title: 'Profile',
    description: 'Manage your profile and preferences',
    keywords: ['profile', 'account', 'settings'],
  },
  '/admin': {
    title: 'Admin Dashboard',
    description: 'Administrative dashboard',
    keywords: ['admin', 'dashboard', 'management'],
  },
}

// Helper functions
export function getNavigationItemByHref(href: string): NavigationItem | undefined {
  return navigationItems.find(item => item.href === href)
}

export function getNavigationItemsByGroup(group: string): NavigationItem[] {
  return navigationItems.filter(item => item.group === group)
}

export function getVisibleNavigationItems(
  userRole: 'admin' | 'user' | 'guest' = 'guest'
): NavigationItem[] {
  return navigationItems.filter(item => {
    if (item.adminOnly && userRole !== 'admin') return false
    if (item.requiresAuth && userRole === 'guest') return false
    return true
  })
}

export function getBottomNavItems(userRole: 'admin' | 'user' | 'guest' = 'guest'): NavigationItem[] {
  return navigationItems.filter(item => {
    if (!item.showInBottomNav) return false
    if (item.adminOnly && userRole !== 'admin') return false
    if (item.requiresAuth && userRole === 'guest') return false
    return true
  })
}

export function getSidebarItems(userRole: 'admin' | 'user' | 'guest' = 'guest'): NavigationItem[] {
  return navigationItems.filter(item => {
    if (!item.showInSidebar) return false
    if (item.adminOnly && userRole !== 'admin') return false
    if (item.requiresAuth && userRole === 'guest') return false
    return true
  })
}

export function isProtectedRoute(pathname: string): boolean {
  return routeConfig.protectedRoutes.some(route => {
    const pattern = route.replace(':slug', '[^/]+')
    return new RegExp(`^${pattern}$`).test(pathname)
  })
}

export function isAdminRoute(pathname: string): boolean {
  return routeConfig.adminRoutes.some(route => {
    const pattern = route.replace(':slug', '[^/]+')
    return new RegExp(`^${pattern}$`).test(pathname)
  })
}

export function isAuthRoute(pathname: string): boolean {
  return routeConfig.authRoutes.includes(pathname)
}

export function isPublicRoute(pathname: string): boolean {
  return routeConfig.publicRoutes.some(route => {
    const pattern = route.replace(':slug', '[^/]+')
    return new RegExp(`^${pattern}$`).test(pathname)
  })
}

export function getRouteMetadata(pathname: string) {
  return routeMetadata[pathname] || {
    title: 'Page',
    description: 'My Website',
  }
}

// Breadcrumb helpers
export function generateBreadcrumbs(pathname: string): Array<{ label: string; href?: string }> {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [{ label: 'Home', href: '/' }]
  
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const item = getNavigationItemByHref(href)
    const label = item?.label || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    
    if (index === segments.length - 1) {
      breadcrumbs.push({ label }) // No href for current page
    } else {
      breadcrumbs.push({ label, href })
    }
  })
  
  return breadcrumbs
}

// URL helpers
export function getCanonicalUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
  return `${baseUrl}${pathname}`
}

export function getAbsoluteUrl(pathname: string): string {
  return getCanonicalUrl(pathname)
}

// Navigation state helpers
export function shouldShowNavigation(pathname: string): boolean {
  // Hide navigation on auth pages
  if (isAuthRoute(pathname)) return false
  
  // Hide navigation on specific pages
  const hideOnPages = ['/404', '/500', '/maintenance']
  return !hideOnPages.includes(pathname)
}

export function getNavigationVariant(pathname: string): 'default' | 'minimal' | 'admin' {
  if (isAuthRoute(pathname)) return 'minimal'
  if (isAdminRoute(pathname)) return 'admin'
  return 'default'
}