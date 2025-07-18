'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@/components/auth/UserButton'
import { AuthenticatedOnly, AdminOnly } from '@/components/auth/AuthGuard'
import { navigationItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r-2 border-black shadow-brutal transform transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b-2 border-black">
          <Link href="/" className="block">
            <h1 className="text-2xl font-mono font-bold text-black uppercase tracking-wide">
              My Website
            </h1>
            <p className="text-sm font-mono text-neutral-600 mt-1">
              Recipes & Blog
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            
            // Handle protected routes
            if (item.requiresAuth && !item.adminOnly) {
              return (
                <AuthenticatedOnly key={item.href}>
                  <SidebarLink
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    badge={item.badge}
                  />
                </AuthenticatedOnly>
              )
            }

            if (item.adminOnly) {
              return (
                <AdminOnly key={item.href}>
                  <SidebarLink
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    badge={item.badge}
                  />
                </AdminOnly>
              )
            }

            return (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                badge={item.badge}
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

interface SidebarLinkProps {
  href: string
  label: string
  icon?: React.ReactNode
  isActive: boolean
  badge?: string
}

function SidebarLink({ href, label, icon, isActive, badge }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-4 py-3 text-sm font-mono font-medium transition-all duration-150 border-2 border-transparent',
        isActive
          ? 'bg-primary-500 text-white border-black shadow-brutal'
          : 'text-neutral-700 hover:bg-neutral-50 hover:text-black hover:border-black hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
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

// Collapsible sidebar section
export function SidebarSection({
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

// Nested sidebar link
export function SidebarSubLink({
  href,
  label,
  isActive,
}: {
  href: string
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
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

// Sidebar footer component
export function SidebarFooter() {
  return (
    <div className="p-4 border-t-2 border-black bg-neutral-50">
      <div className="text-center">
        <p className="text-xs font-mono text-neutral-600">
          © 2024 My Website
        </p>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Built with Next.js
        </p>
      </div>
    </div>
  )
}

// Compact sidebar for admin areas
export function CompactSidebar() {
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const adminItems = navigationItems.filter(item => item.adminOnly)

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-16 bg-white border-r-2 border-black shadow-brutal">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b-2 border-black">
          <Link href="/" className="block">
            <div className="w-8 h-8 bg-primary-500 border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <span className="text-white font-mono font-bold text-sm">M</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-2">
          {adminItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-center w-12 h-12 text-lg border-2 border-transparent transition-all duration-150',
                  isActive
                    ? 'bg-primary-500 text-white border-black shadow-brutal'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-black hover:border-black hover:shadow-brutal-sm'
                )}
                title={item.label}
              >
                {item.icon}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-2 border-t-2 border-black">
          <div className="flex justify-center">
            <UserButton showName={false} />
          </div>
        </div>
      </div>
    </div>
  )
}