'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Header } from './Header'
import { useNavigation } from '@/hooks/useNavigation'
import { cn } from '@/lib/utils'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname, setIsMobileMenuOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && event.target instanceof Element) {
        const mobileNav = document.getElementById('mobile-nav')
        const mobileMenuButton = document.getElementById('mobile-menu-button')
        
        if (mobileNav && mobileMenuButton) {
          if (!mobileNav.contains(event.target) && !mobileMenuButton.contains(event.target)) {
            setIsMobileMenuOpen(false)
          }
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen, setIsMobileMenuOpen])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  if (!isMounted) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Header */}
      <div className="md:hidden">
        <Header />
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <MobileNav />
    </div>
  )
}

// Main layout wrapper that includes navigation
export function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main content area */}
      <div className="md:ml-64">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

// Admin layout wrapper with navigation
export function AdminNavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Admin content area with sidebar spacing */}
      <div className="md:ml-64">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// Simple wrapper for pages that don't need navigation
export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main>{children}</main>
    </div>
  )
}

// Breadcrumb navigation component
export function Breadcrumb({ 
  items 
}: { 
  items: Array<{ label: string; href?: string }> 
}) {
  return (
    <nav className="flex items-center space-x-2 text-sm font-mono text-neutral-600 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-primary-500 transition-colors duration-150"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-black font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Page header component
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: Array<{ label: string; href?: string }>
}) {
  return (
    <div className="mb-8">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-black uppercase tracking-wide">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-neutral-600 font-mono text-sm">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Section header component
export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-neutral-600 font-mono text-sm">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      )}
    </div>
  )
}

// Content wrapper with consistent padding
export function ContentWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-4 sm:px-6 lg:px-8 py-6', className)}>
      {children}
    </div>
  )
}

// Card grid wrapper
export function CardGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      className
    )}>
      {children}
    </div>
  )
}

// Two column layout
export function TwoColumnLayout({
  sidebar,
  main,
  sidebarWidth = 'w-1/3',
  mainWidth = 'w-2/3',
}: {
  sidebar: React.ReactNode
  main: React.ReactNode
  sidebarWidth?: string
  mainWidth?: string
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className={cn('lg:sticky lg:top-8 lg:self-start', sidebarWidth)}>
        {sidebar}
      </aside>
      <main className={mainWidth}>
        {main}
      </main>
    </div>
  )
}

// Three column layout
export function ThreeColumnLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-3">
        {left}
      </aside>
      <main className="lg:col-span-6">
        {center}
      </main>
      <aside className="lg:col-span-3">
        {right}
      </aside>
    </div>
  )
}