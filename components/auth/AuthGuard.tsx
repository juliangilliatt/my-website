'use client'

// Simplified AuthGuard for deployment (stub implementation)
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Mock loading for deployment
    setTimeout(() => {
      setIsChecking(false)
    }, 100)
  }, [])

  // Show loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="text-sm font-mono text-neutral-600">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // Allow all access for deployment
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

// Hook for checking authentication status (mock for deployment)
export function useAuthGuard() {
  return {
    isLoaded: true,
    isSignedIn: true,
    isAuthenticated: true,
    isAdmin: true,
    user: {
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
    },
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
  // Allow all for deployment
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
  // Allow all for deployment
  return <>{children}</>
}