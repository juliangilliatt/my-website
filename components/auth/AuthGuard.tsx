'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAuth, useUser } from '@/lib/auth'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAdmin?: boolean
  loadingComponent?: ReactNode
}

// Feature flag for auth protection (disabled for deployment)
const ENABLE_AUTH_PROTECTION = process.env.NEXT_PUBLIC_ENABLE_AUTH_PROTECTION === 'true'

export function AuthGuard({ 
  children, 
  fallback, 
  requireAdmin = false, 
  loadingComponent 
}: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // For deployment, always allow access (no auth protection)
  if (!ENABLE_AUTH_PROTECTION || !isClient) {
    return <>{children}</>
  }

  // Show loading while auth state is being determined
  if (!isLoaded) {
    return loadingComponent ? <>{loadingComponent}</> : <AuthLoading />
  }

  // User is not signed in
  if (!isSignedIn || !user) {
    return fallback ? <>{fallback}</> : <AuthRequired />
  }

  // Check admin requirement
  if (requireAdmin) {
    // In real implementation, this would check user.role from database
    const isAdmin = false // Always false for now
    
    if (!isAdmin) {
      return fallback ? <>{fallback}</> : <AuthRequired message="Admin access required." />
    }
  }

  // User is authenticated and authorized
  return <>{children}</>
}

// Loading component for auth states
export function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Component for when user is not signed in
export function AuthRequired({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Required
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message || 'You need to be signed in to access this page.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="/sign-in" 
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </a>
          <a 
            href="/sign-up" 
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Sign Up
          </a>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <a 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAdmin?: boolean
    fallback?: ReactNode
  }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard 
        requireAdmin={options?.requireAdmin} 
        fallback={options?.fallback}
      >
        <Component {...props} />
      </AuthGuard>
    )
  }

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return AuthenticatedComponent
}

// Hook for checking auth state in components
export function useAuthGuard(requireAdmin = false) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isAuthenticated = ENABLE_AUTH_PROTECTION 
    ? (isLoaded && isSignedIn && user) 
    : true // Always authenticated when protection is disabled

  const isAuthorized = requireAdmin && ENABLE_AUTH_PROTECTION
    ? false // Would check user.role in real implementation
    : true

  return {
    isLoaded: isClient && isLoaded,
    isAuthenticated,
    isAuthorized,
    user: ENABLE_AUTH_PROTECTION ? user : null,
  }
}