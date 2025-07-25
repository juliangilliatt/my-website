import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/auth(.*)',
  '/',
  '/about(.*)',
  '/recipes(.*)',
  '/blog(.*)',
  '/projects(.*)',
  '/api/public(.*)',
  '/test-no-auth',
  '/debug-clerk',
  '/test-auth-flow',
])

export default clerkMiddleware((auth, req) => {
  // If it's not a public route, protect it
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}