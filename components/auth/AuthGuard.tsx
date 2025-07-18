'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback,
  redirectTo,
}: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      setIsChecking(false)
      
      // Check authentication requirement
      if (requireAuth && !isSignedIn) {
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.push('/sign-in')
        }
        return
      }

      // Check admin requirement
      if (requireAdmin && user) {
        const isAdmin = user.publicMetadata?.role === 'admin'
        if (!isAdmin) {
          if (redirectTo) {
            router.push(redirectTo)
          } else {
            router.push('/')
          }
          return
        }
      }
    }
  }, [isLoaded, isSignedIn, user, requireAuth, requireAdmin, redirectTo, router])

  // Show loading state
  if (isChecking || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-mono text-neutral-600">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // Check authentication
  if (requireAuth && !isSignedIn) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-mono font-bold text-black">
            Authentication Required
          </h1>
          <p className="text-sm font-mono text-neutral-600">
            You must be signed in to access this page.
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="btn"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // Check admin requirement
  if (requireAdmin && user) {
    const isAdmin = user.publicMetadata?.role === 'admin'
    if (!isAdmin) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-mono font-bold text-black">
              Admin Access Required
            </h1>
            <p className="text-sm font-mono text-neutral-600">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Simplified version for requiring just authentication
export function RequireAuth({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// Simplified version for requiring admin access
export function RequireAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// Hook for checking authentication status
export function useAuthGuard() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  const isAdmin = user?.publicMetadata?.role === 'admin'
  const isAuthenticated = isLoaded && isSignedIn

  return {
    isLoaded,
    isSignedIn,
    isAuthenticated,
    isAdmin,
    user,
  }
}

// Component for conditional rendering based on auth status
export function AuthConditional({
  children,
  fallback,
  requireAuth = true,
  requireAdmin = false,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}) {
  const { isLoaded, isSignedIn, isAdmin } = useAuthGuard()

  if (!isLoaded) {
    return null
  }

  if (requireAuth && !isSignedIn) {
    return fallback || null
  }

  if (requireAdmin && !isAdmin) {
    return fallback || null
  }

  return <>{children}</>
}

// Admin-only wrapper component
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthConditional requireAuth={true} requireAdmin={true} fallback={fallback}>
      {children}
    </AuthConditional>
  )
}

// Authenticated-only wrapper component
export function AuthenticatedOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthConditional requireAuth={true} requireAdmin={false} fallback={fallback}>
      {children}
    </AuthConditional>
  )
}

// Guest-only wrapper component (for non-authenticated users)
export function GuestOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isLoaded, isSignedIn } = useAuthGuard()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return fallback || null
  }

  return <>{children}</>
}