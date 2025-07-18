'use client'

// Simplified UserButton for deployment (stub implementation)
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface UserButtonProps {
  className?: string
  showName?: boolean
  afterSignOutUrl?: string
}

// Mock user for deployment
const mockUser = {
  id: 'mock-user-id',
  firstName: 'Mock',
  username: 'mockuser',
  emailAddresses: [{ emailAddress: 'mock@example.com' }],
  publicMetadata: { role: 'admin' },
}

export function UserButton({ 
  className, 
  showName = false, 
  afterSignOutUrl = '/' 
}: UserButtonProps) {
  const isLoaded = true
  const user = mockUser

  if (!isLoaded) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="w-8 h-8 bg-neutral-200 border-2 border-neutral-300 animate-pulse" />
        {showName && (
          <div className="w-20 h-4 bg-neutral-200 border border-neutral-300 animate-pulse" />
        )}
      </div>
    )
  }

  if (!user) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button asChild size="sm" variant="outline">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {showName && (
        <div className="hidden sm:block">
          <div className="text-sm font-mono font-medium text-black">
            {user.firstName || user.username || 'User'}
          </div>
          <div className="text-xs font-mono text-neutral-600">
            {user.emailAddresses[0]?.emailAddress}
          </div>
        </div>
      )}
      
      {/* Mock user button for deployment */}
      <div className="w-8 h-8 bg-primary-500 border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center">
        <span className="text-white font-mono text-sm font-bold">
          {user.firstName?.[0] || 'U'}
        </span>
      </div>
    </div>
  )
}

// Simplified version for mobile/compact usage
export function UserButtonCompact({ className }: { className?: string }) {
  return (
    <UserButton 
      className={cn('', className)} 
      showName={false}
    />
  )
}

// Extended version with additional info
export function UserButtonExtended({ className }: { className?: string }) {
  const user = mockUser

  if (!user) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button asChild size="sm" variant="outline">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    )
  }

  const isAdmin = user.publicMetadata?.role === 'admin'

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="text-right">
        <div className="text-sm font-mono font-medium text-black flex items-center space-x-2">
          <span>{user.firstName || user.username || 'User'}</span>
          {isAdmin && (
            <span className="inline-flex items-center px-2 py-1 bg-accent-500 text-white border-2 border-black shadow-brutal-sm font-mono text-xs uppercase tracking-wide">
              Admin
            </span>
          )}
        </div>
        <div className="text-xs font-mono text-neutral-600">
          {user.emailAddresses[0]?.emailAddress}
        </div>
      </div>
      
      <UserButton showName={false} />
    </div>
  )
}

// Admin-specific user button
export function AdminUserButton({ className }: { className?: string }) {
  const user = mockUser

  if (!user) {
    return null
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button asChild size="sm" variant="ghost">
        <Link href="/admin">
          <span className="font-mono text-sm">Admin</span>
        </Link>
      </Button>
      <UserButton showName={false} />
    </div>
  )
}