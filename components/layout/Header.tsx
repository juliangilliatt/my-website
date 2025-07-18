'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@/components/auth/UserButton'
import { MobileMenuButton } from './MobileNav'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-black shadow-brutal md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <div className="flex items-center space-x-4">
          <MobileMenuButton />
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
              My Website
            </h1>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <UserButton showName={false} />
        </div>
      </div>
    </header>
  )
}

// Alternative header with search
export function HeaderWithSearch() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-black shadow-brutal md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <MobileMenuButton />
          
          <Link href="/" className="flex items-center">
            <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
              My Website
            </h1>
          </Link>
        </div>

        {/* Center - Search (optional) */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 pl-10 text-sm font-mono bg-white border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500 transition-all duration-150"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <UserButton showName={false} />
        </div>
      </div>
    </header>
  )
}

// Minimal header for auth pages
export function MinimalHeader() {
  return (
    <header className="bg-white border-b-2 border-black">
      <div className="flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center">
          <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
            My Website
          </h1>
        </Link>
      </div>
    </header>
  )
}

// Admin header with breadcrumbs
export function AdminHeader({
  title,
  breadcrumbs = [],
}: {
  title: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <header className="bg-white border-b-2 border-black md:hidden">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <MobileMenuButton />
            <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
              {title}
            </h1>
          </div>
          
          <UserButton showName={false} />
        </div>
        
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm font-mono text-neutral-600">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary-500 transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-black font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

// Header with tabs for section navigation
export function HeaderWithTabs({
  title,
  tabs,
  activeTab,
}: {
  title: string
  tabs: Array<{ id: string; label: string; href: string }>
  activeTab: string
}) {
  return (
    <header className="bg-white border-b-2 border-black md:hidden">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <MobileMenuButton />
            <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
              {title}
            </h1>
          </div>
          
          <UserButton showName={false} />
        </div>
        
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex-shrink-0 px-3 py-2 text-sm font-mono font-medium transition-all duration-150 border-2 border-transparent',
                activeTab === tab.id
                  ? 'bg-primary-500 text-white border-black shadow-brutal-sm'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-black hover:border-black hover:shadow-brutal-sm'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

// Sticky action header
export function StickyActionHeader({
  title,
  actions,
}: {
  title: string
  actions: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-black shadow-brutal md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <MobileMenuButton />
          <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {actions}
          <UserButton showName={false} />
        </div>
      </div>
    </header>
  )
}

// Progress header for multi-step processes
export function ProgressHeader({
  title,
  currentStep,
  totalSteps,
}: {
  title: string
  currentStep: number
  totalSteps: number
}) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <header className="bg-white border-b-2 border-black md:hidden">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <MobileMenuButton />
            <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
              {title}
            </h1>
          </div>
          
          <div className="text-sm font-mono text-neutral-600">
            {currentStep} / {totalSteps}
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 border-2 border-black">
          <div
            className="h-2 bg-primary-500 border-r-2 border-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  )
}

// Notification header
export function NotificationHeader({
  title,
  notification,
}: {
  title: string
  notification?: {
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  }
}) {
  const notificationColors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  }

  return (
    <header className="bg-white border-b-2 border-black md:hidden">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <MobileMenuButton />
            <h1 className="text-lg font-mono font-bold text-black uppercase tracking-wide">
              {title}
            </h1>
          </div>
          
          <UserButton showName={false} />
        </div>
        
        {notification && (
          <div className={cn(
            'p-3 border-2 shadow-brutal-sm font-mono text-sm',
            notificationColors[notification.type]
          )}>
            {notification.message}
          </div>
        )}
      </div>
    </header>
  )
}