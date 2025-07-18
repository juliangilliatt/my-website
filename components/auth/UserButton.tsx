'use client'

import { UserButton as ClerkUserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface UserButtonProps {
  className?: string
  showName?: boolean
  afterSignOutUrl?: string
}

export function UserButton({ 
  className, 
  showName = false, 
  afterSignOutUrl = '/' 
}: UserButtonProps) {
  const { user, isLoaded } = useUser()

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
      
      <ClerkUserButton
        afterSignOutUrl={afterSignOutUrl}
        appearance={{
          elements: {
            rootBox: 'z-50',
            card: 'bg-white border-2 border-black shadow-brutal',
            menuButton: 'bg-white hover:bg-neutral-50 border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150',
            menuItem: 'text-black font-mono text-sm hover:bg-neutral-50 hover:text-primary-500 transition-colors duration-150',
            menuItemText: 'font-mono text-sm',
            menuItemIcon: 'text-black',
            menuItemTextDestructive: 'text-red-600',
            menuItemIconDestructive: 'text-red-600',
            menuList: 'bg-white border-2 border-black shadow-brutal',
            menuSection: 'border-b-2 border-neutral-200',
            menuSectionText: 'text-neutral-600 font-mono text-xs uppercase tracking-wide',
            userPreview: 'bg-neutral-50 border-b-2 border-neutral-200 p-4',
            userPreviewMainIdentifier: 'text-black font-mono font-medium',
            userPreviewSecondaryIdentifier: 'text-neutral-600 font-mono text-sm',
            userPreviewAvatarBox: 'border-2 border-black shadow-brutal-sm',
            userPreviewAvatarImage: 'rounded-none',
            userButtonAvatarBox: 'border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150',
            userButtonAvatarImage: 'rounded-none',
            userButtonBox: 'relative',
            userButtonOuterBox: 'relative',
            userButtonPopoverCard: 'bg-white border-2 border-black shadow-brutal mt-2',
            userButtonPopoverActions: 'border-t-2 border-neutral-200 pt-2',
            userButtonPopoverActionButton: 'text-black font-mono text-sm hover:bg-neutral-50 hover:text-primary-500 transition-colors duration-150',
            userButtonPopoverActionButtonText: 'font-mono text-sm',
            userButtonPopoverActionButtonIcon: 'text-black',
            userButtonPopoverFooter: 'border-t-2 border-neutral-200 pt-2',
            userButtonPopoverFooterText: 'text-neutral-600 font-mono text-xs',
            badge: 'bg-accent-500 text-white border-2 border-black shadow-brutal-sm font-mono text-xs uppercase tracking-wide',
            avatarBox: 'border-2 border-black shadow-brutal-sm',
            avatarImage: 'rounded-none',
          },
          variables: {
            colorPrimary: '#ef4444',
            colorTextOnPrimaryBackground: '#ffffff',
            colorBackground: '#ffffff',
            colorInputBackground: '#ffffff',
            colorInputText: '#000000',
            colorText: '#000000',
            colorTextSecondary: '#737373',
            colorSuccess: '#22c55e',
            colorDanger: '#ef4444',
            colorWarning: '#f59e0b',
            colorNeutral: '#737373',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.875rem',
            borderRadius: '0rem',
          },
        }}
        showName={false}
        userProfileMode="navigation"
        userProfileUrl="/profile"
      />
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
  const { user } = useUser()

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
  const { user } = useUser()

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