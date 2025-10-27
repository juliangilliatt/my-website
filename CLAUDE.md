# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and content hub built with Next.js 14, featuring a recipe management system and technical blog. Uses MongoDB (Prisma ORM), Clerk authentication (feature-flagged), and Vercel Blob storage. The design aesthetic is brutalist with black borders, sharp shadows, and monospace typography.

## Commands

### Development
```bash
npm run dev              # Start dev server (Next.js)
npm run build            # Production build (runs prisma generate first)
npm start                # Start production server
```

### Database
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:seed          # Seed database with initial data
npm run db:setup         # Setup database (initial configuration)
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Testing
```bash
npm run test             # Run all Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:headed  # Run E2E tests with browser UI
npm run test:all         # Run lint, type-check, and all tests
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:check       # Run ESLint with zero warnings enforcement
npm run type-check       # TypeScript type checking (no emit)
```

### Deployment
```bash
npm run deploy           # Deploy to production
npm run deploy:preview   # Create preview deployment
npm run deploy:monitor   # Monitor deployment health
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14.2.0 (App Router)
- **Database**: MongoDB Atlas via Prisma 5.10.0
- **Auth**: Clerk 5.0.0 (feature-flagged via `ENABLE_CLERK`)
- **Styling**: Tailwind CSS 3.4.0 with brutalist design system
- **File Storage**: Vercel Blob (feature-flagged via `ENABLE_FILE_UPLOADS`)
- **Content**: Hybrid approach (MongoDB + MDX support)
- **Validation**: Zod schemas
- **Testing**: Jest, Playwright, Axe (accessibility)

### Directory Structure

- **`app/`** - Next.js App Router pages and API routes
  - `api/` - REST endpoints (recipes, upload, GitHub integration)
  - `admin/` - Admin dashboard (auth-gated)
  - `blog/` - Blog listing and individual posts
  - `recipes/` - Recipe listing and individual recipes

- **`lib/`** - Utility libraries and business logic
  - `actions/` - Server Actions for mutations (recipes, blog, tags)
  - `prisma.ts` - Prisma client singleton (global caching)
  - `auth.ts` - Clerk authentication wrapper functions
  - `validations/` - Zod schemas for form/API validation
  - `cache/` - Caching utilities for performance

- **`components/`** - React components
  - `ui/` - Base UI components (Button, Card, Input, Badge, etc.)
  - `recipes/` - Recipe-specific components (RecipeSearchInterface, RecipeCard, RecipeFilters)
  - `blog/` - Blog-specific components (BlogCard, BlogSearch, BlogFilters)
  - `admin/` - Admin dashboard components
  - `layout/` - Site-wide layout components (Header, Footer, Navigation)

- **`hooks/`** - Custom React hooks
  - `useRecipeSearch.ts` - Recipe search/filter logic
  - `useDebounce.ts` - Debounce utility (300ms default)
  - `useAuth.ts` - Auth wrapper hook
  - `useAdminAuth.ts` - Admin authentication check

- **`prisma/`** - Database schema and migrations
  - `schema.prisma` - Data models (User, Recipe, BlogPost, Tag, Image, Analytics, etc.)

### Data Models (Prisma)

Key models with their primary purpose:

- **Recipe**: Full recipe data with ingredients (JSON), instructions (JSON), images (JSON), nutrition (JSON), tags, difficulty, category, cuisine, timing, ratings
- **BlogPost**: Blog content with MDX/HTML content, tags, category, reading time, views, likes, featured status
- **Tag**: Shared tags for both recipes and blog posts (many-to-many relations)
- **User**: User accounts with role (USER/ADMIN), social links, bio
- **Image**: Metadata for uploaded files (Vercel Blob URLs)
- **Analytics**: Event tracking for user interactions
- **Newsletter**: Email subscription management
- **Contact**: Contact form submissions

**Important indexes**:
- Full-text search on Recipe (title, description) and BlogPost (title, excerpt, content)
- Indexes on frequently queried fields (category, status, featured, dates, etc.)

### Server vs Client Components

**Server Components** (default in App Router):
- All page components in `app/` directory
- Fetch data directly from Prisma
- Generate metadata via `Metadata` API
- Use Suspense boundaries for loading states

**Client Components** (`'use client'`):
- Interactive components: RecipeSearchInterface, BlogSearch, filters
- Forms: Recipe/blog creation and editing
- Auth UI components: UserButton, AuthGuard
- Components using hooks: useAuth, useRecipeSearch, useDebounce

### Data Fetching Patterns

1. **Server Actions** (`'use server'` in `lib/actions/`):
   - Recipe mutations (create, update, delete)
   - Blog mutations
   - Tag operations
   - Use `revalidatePath()` to invalidate cache after mutations

2. **API Routes** (`app/api/*/route.ts`):
   - GET `/api/recipes` - List/search recipes (paginated, filterable, sortable)
   - POST `/api/recipes` - Create recipe (auth required)
   - PATCH/DELETE `/api/recipes/[id]` - Update/delete recipe (admin only)
   - POST `/api/upload` - Upload to Vercel Blob (auth required)

3. **Direct Prisma Queries** (in Server Components):
   - Parallel fetching with `Promise.all()`
   - Pagination with `skip`/`take`
   - Full-text search via `search` parameter
   - Filtering by category, cuisine, difficulty, tags, featured status

4. **ISR (Incremental Static Regeneration)**:
   - Blog pages use `export const revalidate = 1800` (30 minutes)
   - Recipe pages are fully dynamic

### Search & Filtering

**Recipe Search** (`RecipeSearchInterface`):
- Full-text search on title/description
- Filters: category, cuisine, difficulty, prep time, cook time, servings, tags
- Sorting: newest, oldest, title, rating, time, difficulty
- Client-side debounced search (300ms)
- Pagination support (12 items per page default)

**Blog Search** (`BlogSearch`):
- Full-text search on title/excerpt/content
- Filters: tags, categories, featured status
- Sorting: newest, oldest, most viewed, most liked

### Authentication & Authorization

**Clerk Integration** (feature-flagged):
- Environment variable: `ENABLE_CLERK` (set to enable)
- Wrapper functions in `lib/auth.ts`:
  - `getCurrentUser()` - Get current user server-side
  - `requireAuth()` - Require authentication (throws if not authed)
  - `requireAdmin()` - Require admin role (throws if not admin)
  - `checkRole(role)` - Check user role
  - `isAdmin()` - Check if user is admin

**Role-based Access**:
- USER: Default role, can view content
- ADMIN: Can access `/admin/*` routes, create/edit/delete content

**Deployment Mode**:
- Currently runs with Clerk disabled for production safety
- Mock auth functions return null/false when disabled
- Admin routes should check `isAdmin()` before rendering admin UI

### Styling & Design System

**Brutalist Design Aesthetic**:
- Black borders (`border-2 border-black`)
- Sharp shadows: `shadow-brutal` (4px 4px), `shadow-brutal-sm` (2px 2px), `shadow-brutal-lg` (8px 8px)
- Monospace fonts for UI: IBM Plex Mono (headers), Fira Code (code)
- Limited color palette:
  - Primary: Red (#ef4444)
  - Accent: Orange (#f97316)
  - Neutral: Grays (#fafafa to #171717)

**Custom Tailwind Classes**:
```css
/* Shadows */
shadow-brutal       /* 4px 4px 0px 0px rgba(0,0,0,1) */
shadow-brutal-sm    /* 2px 2px 0px 0px rgba(0,0,0,1) */
shadow-brutal-lg    /* 8px 8px 0px 0px rgba(0,0,0,1) */

/* Typography */
font-mono           /* IBM Plex Mono */
font-sans           /* Inter */
font-code           /* Fira Code */

/* Spacing */
/* 8px grid system (1 = 4px, 2 = 8px, 4 = 16px, etc.) */
```

**Component Styling**:
- Prefer utility classes over custom CSS
- Use `clsx()` from `clsx` package for conditional classes
- Use `cn()` utility (tailwind-merge wrapper) to merge classes safely

### Image Handling

**Vercel Blob Upload**:
- Endpoint: `POST /api/upload`
- Feature flag: `ENABLE_FILE_UPLOADS`
- Authenticated users only
- Returns URL for storage in database

**Image Optimization**:
- Use `OptimizedImage` component (wrapper around `next/image`)
- Sharp processing via Next.js Image component
- Remote patterns configured in `next.config.js`:
  - `*.blob.vercel-storage.com`
  - `*.public.blob.vercel-storage.com`

**Image Storage**:
- Images stored in Vercel Blob
- Metadata stored in MongoDB `Image` model
- Recipe/blog images stored as JSON arrays in respective models

### API Response Format

**Success Response** (recipes):
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "details": { ... }  // Optional, for validation errors
}
```

**Status Codes**:
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Not found
- 500: Server error

### Performance Optimizations

1. **Prisma Client Singleton**: Global caching in `lib/prisma.ts` prevents multiple instances
2. **ISR on Blog**: 30-minute revalidation reduces database load
3. **Image Optimization**: Next.js Image component with Sharp processing
4. **Debounced Search**: 300ms debounce on search inputs
5. **Pagination**: Limit queries with `take`/`skip`
6. **Indexes**: Strategic indexes on Prisma models for fast queries
7. **Parallel Fetching**: Use `Promise.all()` for independent queries

### Error Handling

- **Zod Validation**: All API inputs validated with Zod schemas
- **Try-Catch Blocks**: Wrap all async operations
- **Detailed Errors (Dev)**: Full error details in development
- **Generic Errors (Prod)**: User-friendly messages in production
- **Logging**: Console logs for debugging (consider structured logging service)

### Feature Flags

Environment variables to toggle features:

- `ENABLE_CLERK`: Enable/disable Clerk authentication (default: false in production)
- `ENABLE_FILE_UPLOADS`: Enable/disable Vercel Blob uploads (default: false in production)
- `DATABASE_URL`: MongoDB connection string (required)
- `NEXT_PUBLIC_SITE_URL`: Public site URL for SEO/OG images

### Build Configuration

**Important Build Settings** (`next.config.js`):
```js
{
  typescript: { ignoreBuildErrors: true },  // Ignores TS errors during build
  eslint: { ignoreDuringBuilds: true },     // Ignores ESLint warnings during build
  swcMinify: true                            // Use SWC minification
}
```

**Build Process**:
1. `prisma generate` runs before `next build` (see `package.json` build script)
2. TypeScript/ESLint errors are ignored for deployment safety
3. Prisma client must be generated before building

### Testing Strategy

**Unit Tests** (`__tests__/`):
- Test utilities, hooks, and helper functions
- Use Jest with React Testing Library
- Run with `npm run test:unit`

**Integration Tests**:
- Test API routes and server actions
- Use Jest with Prisma mocks
- Run with `npm run test:integration`

**E2E Tests**:
- Test user flows with Playwright
- Run with `npm run test:e2e`
- Run with browser UI: `npm run test:e2e:headed`

**Accessibility Tests**:
- Use Axe-core with Playwright
- Run with `npm run test:accessibility`

### Common Development Tasks

**Adding a New Recipe**:
1. Navigate to `/admin/recipes`
2. Click "New Recipe"
3. Fill out form (title, description, ingredients, instructions, images, etc.)
4. Validate with Zod schema in `lib/validations/recipe.ts`
5. Submit to create via Server Action in `lib/actions/recipes.ts`
6. Revalidate `/recipes` path

**Adding a New Blog Post**:
1. Create MDX file in designated content directory (if using MDX)
2. OR use admin UI to create in database
3. Add frontmatter (title, date, category, tags, etc.)
4. Content processes via `lib/mdx.ts` (currently stubbed for deployment)
5. Revalidate `/blog` path

**Modifying Database Schema**:
1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to push changes (dev)
3. Run `npm run db:generate` to regenerate Prisma client
4. Update TypeScript types if needed
5. Test queries with Prisma Studio: `npm run db:studio`

**Adding a New API Route**:
1. Create `route.ts` in `app/api/[endpoint]/`
2. Export GET/POST/PUT/DELETE functions
3. Validate input with Zod schema
4. Use try-catch for error handling
5. Return NextResponse with consistent format
6. Add rate limiting if needed (use `lib/ratelimit.ts`)

### Deployment Notes

- **Platform**: Vercel (primary target)
- **Database**: MongoDB Atlas (ensure `DATABASE_URL` is set in Vercel environment)
- **Environment Variables**: Set in Vercel dashboard (Clerk keys, Blob tokens, etc.)
- **Build Command**: `npm run build` (includes Prisma generation)
- **Output**: Serverless functions (API routes as separate functions)
- **Post-Deploy**: Run smoke tests with `npm run test:smoke`

### Code Conventions

- Use TypeScript strict mode
- Prefer server components over client components
- Use Server Actions for mutations (avoid direct API calls from client when possible)
- Validate all inputs with Zod schemas
- Use `cn()` utility for className merging
- Follow Next.js App Router conventions (app/, layout.tsx, page.tsx, route.ts)
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)
- Write tests for critical paths (auth, data mutations, user flows)

### Troubleshooting

**Prisma Client Not Generated**:
- Run `npm run db:generate`
- Ensure `DATABASE_URL` is set
- Check `prisma/schema.prisma` syntax

**Build Failures**:
- Check Prisma client generation
- Verify MongoDB connection string
- Review TypeScript errors (though ignored, they may indicate issues)

**Authentication Not Working**:
- Verify `ENABLE_CLERK` is set
- Check Clerk environment variables
- Ensure middleware is configured correctly in `middleware.ts`

**Images Not Loading**:
- Verify Vercel Blob environment variables
- Check `next.config.js` remote patterns
- Ensure `ENABLE_FILE_UPLOADS` is set

**Search Not Working**:
- Verify MongoDB full-text indexes are created
- Check Prisma preview features include `fullTextSearch`
- Ensure search queries use correct Prisma syntax
