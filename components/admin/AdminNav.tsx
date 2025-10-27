'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@/components/auth/UserButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAdminAuth, useAdminNotifications } from '@/hooks/useAdminAuth'
import { cn } from '@/lib/utils'

interface AdminNavProps {
  className?: string
}

export function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname()
  const { isAdmin, getRoleDisplayName, getRoleColor, checkPermission } = useAdminAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <DashboardIcon className="w-5 h-5" />,
      permission: 'admin:access',
    },
    {
      name: 'Recipes',
      href: '/admin/recipes',
      icon: <RecipeIcon className="w-5 h-5" />,
      permission: 'recipes:read',
    },
    {
      name: 'Blog Posts',
      href: '/admin/blog',
      icon: <BlogIcon className="w-5 h-5" />,
      permission: 'blog:read',
    },
  ]

  const visibleItems = navigationItems.filter(item => 
    checkPermission(item.permission as any)
  )

  if (!isAdmin) {
    return null
  }

  return (
    <nav className={cn('bg-white border-b-2 border-black shadow-brutal', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 border-2 border-black shadow-brutal-sm flex items-center justify-center">
                <span className="text-white font-mono font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-mono font-bold text-black">Admin</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {visibleItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-mono font-medium transition-colors duration-150',
                  pathname === item.href
                    ? 'text-primary-500 bg-primary-50 border-b-2 border-primary-500'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Role badge */}
            <Badge className={cn('font-mono text-xs', getRoleColor())}>
              {getRoleDisplayName()}
            </Badge>

            {/* User button */}
            <UserButton afterSignOutUrl="/" />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {visibleItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-mono font-medium transition-colors duration-150',
                  pathname === item.href
                    ? 'text-primary-500 bg-primary-50 border-l-4 border-primary-500'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

// Sidebar navigation for desktop
export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { isAdmin, getRoleDisplayName, getRoleColor, checkPermission } = useAdminAuth()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <DashboardIcon className="w-5 h-5" />,
      permission: 'admin:access',
    },
    {
      name: 'Recipes',
      href: '/admin/recipes',
      icon: <RecipeIcon className="w-5 h-5" />,
      permission: 'recipes:read',
      subItems: [
        { name: 'All Recipes', href: '/admin/recipes', permission: 'recipes:read' },
        { name: 'Create Recipe', href: '/admin/recipes/create', permission: 'recipes:create' },
        { name: 'Categories', href: '/admin/recipes/categories', permission: 'recipes:read' },
      ],
    },
    {
      name: 'Blog Posts',
      href: '/admin/blog',
      icon: <BlogIcon className="w-5 h-5" />,
      permission: 'blog:read',
      subItems: [
        { name: 'All Posts', href: '/admin/blog', permission: 'blog:read' },
        { name: 'Create Post', href: '/admin/blog/create', permission: 'blog:create' },
        { name: 'Categories', href: '/admin/blog/categories', permission: 'blog:read' },
      ],
    },
  ]

  const visibleItems = navigationItems.filter(item => 
    checkPermission(item.permission as any)
  )

  if (!isAdmin) {
    return null
  }

  return (
    <aside className={cn('w-64 h-screen bg-white border-r-2 border-black shadow-brutal', className)}>
      <div className="p-4">
        {/* Brand */}
        <Link href="/admin" className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary-500 border-2 border-black shadow-brutal-sm flex items-center justify-center">
            <span className="text-white font-mono font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-mono font-bold text-black">Admin Panel</span>
        </Link>

        {/* Role badge */}
        <div className="mb-6">
          <Badge className={cn('font-mono text-xs', getRoleColor())}>
            {getRoleDisplayName()}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {visibleItems.map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-mono font-medium transition-colors duration-150 border-2 border-transparent',
                  pathname === item.href
                    ? 'text-primary-500 bg-primary-50 border-primary-500 shadow-brutal-sm'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-50 hover:border-neutral-300'
                )}
              >
                {item.icon}
                {item.name}
              </Link>
              
              {/* Sub-items */}
              {item.subItems && pathname.startsWith(item.href) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems
                    .filter(subItem => checkPermission(subItem.permission as any))
                    .map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={cn(
                        'block px-3 py-2 text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150',
                        pathname === subItem.href && 'text-primary-500 font-medium'
                      )}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-black bg-neutral-50">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
          >
            ← Back to Site
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </aside>
  )
}

// Breadcrumb navigation
export function AdminBreadcrumb({ 
  items, 
  className 
}: { 
  items: Array<{ name: string; href?: string }>
  className?: string 
}) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm font-mono text-neutral-600', className)}>
      <Link href="/admin" className="hover:text-primary-500 transition-colors duration-150">
        Admin
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center space-x-2">
          <span>/</span>
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-primary-500 transition-colors duration-150">
              {item.name}
            </Link>
          ) : (
            <span className="text-black font-medium">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

// Icon components
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function RecipeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function BlogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}