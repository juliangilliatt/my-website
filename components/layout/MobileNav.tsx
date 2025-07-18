'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@/components/auth/UserButton'
import { AuthenticatedOnly, AdminOnly } from '@/components/auth/AuthGuard'
import { useNavigation } from '@/hooks/useNavigation'
import { navigationItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isMobileMenuOpen])

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  if (!isAnimating && !isMobileMenuOpen) {
    return null
  }

  return (
    <div
      id="mobile-nav"
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-black shadow-brutal transform transition-transform duration-300 ease-in-out md:hidden',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={handleLinkClick}>
              <h1 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
                My Website
              </h1>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Recipes & Blog
              </p>
            </Link>
            
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-black hover:bg-neutral-100 transition-colors duration-150"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            
            // Handle protected routes
            if (item.requiresAuth && !item.adminOnly) {
              return (
                <AuthenticatedOnly key={item.href}>
                  <MobileNavLink
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    badge={item.badge}
                    onClick={handleLinkClick}
                  />
                </AuthenticatedOnly>
              )
            }

            if (item.adminOnly) {
              return (
                <AdminOnly key={item.href}>
                  <MobileNavLink
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    badge={item.badge}
                    onClick={handleLinkClick}
                  />
                </AdminOnly>
              )
            }

            return (
              <MobileNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                badge={item.badge}
                onClick={handleLinkClick}
              />
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t-2 border-black">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <UserButton showName={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MobileNavLinkProps {
  href: string
  label: string
  icon?: React.ReactNode
  isActive: boolean
  badge?: string
  onClick: () => void
}

function MobileNavLink({ href, label, icon, isActive, badge, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center px-4 py-3 text-sm font-mono font-medium transition-all duration-150 border-2 border-transparent',
        isActive
          ? 'bg-primary-500 text-white border-black shadow-brutal'
          : 'text-neutral-700 hover:bg-neutral-50 hover:text-black hover:border-black hover:shadow-brutal-sm'
      )}
    >
      {icon && (
        <span className="mr-3 text-lg">
          {icon}
        </span>
      )}
      
      <span className="flex-1">{label}</span>
      
      {badge && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-mono font-semibold bg-accent-500 text-white border border-black shadow-brutal-sm uppercase tracking-wide">
          {badge}
        </span>
      )}
    </Link>
  )
}

// Hamburger menu button
export function MobileMenuButton() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation()

  return (
    <button
      id="mobile-menu-button"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="p-2 text-black hover:bg-neutral-100 transition-colors duration-150 border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0"
      aria-label="Toggle menu"
    >
      <svg
        className={cn('w-6 h-6 transition-transform duration-300', isMobileMenuOpen ? 'rotate-90' : '')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isMobileMenuOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  )
}

// Mobile navigation section
export function MobileNavSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs font-mono font-semibold text-neutral-600 uppercase tracking-wide hover:text-black transition-colors duration-150"
      >
        <span>{title}</span>
        <span className={cn('transition-transform duration-150', isOpen ? 'rotate-90' : '')}>
          ▶
        </span>
      </button>
      
      {isOpen && (
        <div className="space-y-1 animate-slide-in">
          {children}
        </div>
      )}
    </div>
  )
}

// Mobile sub-navigation link
export function MobileNavSubLink({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center pl-10 pr-4 py-2 text-sm font-mono transition-all duration-150',
        isActive
          ? 'text-primary-500 font-medium'
          : 'text-neutral-600 hover:text-black'
      )}
    >
      <span className="mr-2">•</span>
      {label}
    </Link>
  )
}

// Bottom navigation for mobile (alternative to sidebar)
export function MobileBottomNav() {
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const mainItems = navigationItems.filter(item => !item.adminOnly && item.showInBottomNav)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-black shadow-brutal md:hidden">
      <div className="flex">
        {mainItems.map((item) => {
          const isActive = isActiveRoute(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center px-2 py-3 text-xs font-mono font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
              )}
            >
              {item.icon && (
                <span className="text-lg mb-1">
                  {item.icon}
                </span>
              )}
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Quick actions menu for mobile
export function MobileQuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-primary-500 text-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150"
        aria-label="Quick actions"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border-2 border-black shadow-brutal animate-slide-in">
          <div className="p-2 space-y-1">
            <AdminOnly>
              <Link
                href="/admin/recipes/create"
                className="block px-3 py-2 text-sm font-mono text-black hover:bg-neutral-50 transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                + New Recipe
              </Link>
              <Link
                href="/admin/blog/create"
                className="block px-3 py-2 text-sm font-mono text-black hover:bg-neutral-50 transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                + New Post
              </Link>
            </AdminOnly>
          </div>
        </div>
      )}
    </div>
  )
}