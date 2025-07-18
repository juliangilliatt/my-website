import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    '/',
    '/recipes',
    '/recipes/(.*)',
    '/blog',
    '/blog/(.*)',
    '/api/github/(.*)',
    '/api/upload',
    '/api/webhooks/(.*)',
    '/api/public/(.*)',
    '/sitemap.xml',
    '/robots.txt',
    '/manifest.json',
    '/favicon.ico',
    '/images/(.*)',
    '/css/(.*)',
    '/js/(.*)',
    '/assets/(.*)',
  ],
  
  // Routes that can always be accessed, and have protection handled by specific pages
  ignoredRoutes: [
    '/api/webhooks/(.*)',
    '/api/public/(.*)',
    '/_next/(.*)',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/images/(.*)',
    '/css/(.*)',
    '/js/(.*)',
    '/assets/(.*)',
    '/((?!api|_next|_vercel|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
  
  // Routes that require authentication
  // /admin routes will be automatically protected
  // /sign-in and /sign-up are handled by Clerk automatically
  
  // Custom redirect URLs
  afterSignInUrl: '/admin',
  afterSignUpUrl: '/admin',
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  
  // Additional configuration
  debug: process.env.NODE_ENV === 'development',
  
  // Protect API routes that require authentication
  apiRoutes: [
    '/api/recipes',
    '/api/blog',
    '/api/tags',
    '/api/admin/(.*)',
  ],
  
  // Custom handler for protected routes
  beforeAuth: (req) => {
    // Add any custom logic before authentication
    return
  },
  
  // Custom handler after authentication
  afterAuth: (auth, req) => {
    // Handle admin route protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!auth.userId) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname)
        return Response.redirect(signInUrl)
      }
    }
    
    // Handle API route protection
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Skip public API routes
      if (req.nextUrl.pathname.startsWith('/api/public/') || 
          req.nextUrl.pathname.startsWith('/api/webhooks/') ||
          req.nextUrl.pathname.startsWith('/api/github/')) {
        return
      }
      
      // Protect admin API routes
      if (req.nextUrl.pathname.startsWith('/api/admin/')) {
        if (!auth.userId) {
          return new Response('Unauthorized', { status: 401 })
        }
      }
    }
    
    return
  },
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}