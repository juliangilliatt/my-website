# Feature Restoration Plan

*Last Updated: July 21, 2025*

This document tracks the incremental restoration of features that were stripped back for initial Vercel deployment.

## Overview

The website was stripped back from a full-featured recipe and blog platform to a basic static site for deployment. This plan outlines step-by-step restoration while maintaining build stability.

## Progress Tracking

- [ ] Phase 1: Environment & Configuration Setup
- [ ] Phase 2: Database Infrastructure  
- [ ] Phase 3: Authentication Foundation
- [ ] Phase 4: Content Management System
- [ ] Phase 5: File Upload System
- [ ] Phase 6: Live Feature Activation
- [ ] Phase 7: Advanced Features

---

## **Phase 1: Environment & Configuration Setup**

### **Step 1.1: Environment Variables Setup**
- [x] Copy `.env.example` to `.env.local`
- [x] Add placeholder values for all variables
- [x] Test build succeeds with placeholder values
- [x] **Build Check**: `npm run build` ✅

### **Step 1.2: Package Dependencies**
- [x] Review `package.json` for commented out dependencies
- [x] Add back essential dependencies one by one:
  - [x] `@prisma/client` (already installed)
  - [x] `prisma` (already installed)
  - [x] Test build after each addition
- [x] **Build Check**: `npm run build && npm run dev` ✅

### **Step 1.3: Configuration Files**
- [x] Create basic database schema in `prisma/schema.prisma` (already exists)
- [x] Add minimal Prisma configuration (fixed schema issues)
- [x] **Build Check**: `npx prisma generate` ✅

---

## **Phase 2: Database Infrastructure**

### **Step 2.1: Prisma Client Restoration**
- [ ] Restore basic Prisma client in `lib/prisma.ts` (without actual DB connection)
- [ ] Replace mock with real client but keep connection disabled
- [ ] **Build Check**: `npm run build`

### **Step 2.2: Database Models (One by One)**
- [ ] Add User model to schema
- [ ] Run `npx prisma generate`
- [ ] **Build Check**: Ensure no TypeScript errors
- [ ] Add Recipe model to schema
- [ ] Run `npx prisma generate`
- [ ] **Build Check**: Test again
- [ ] Add remaining models: BlogPost, Tag, Analytics
- [ ] **Build Check**: `npm run build`

### **Step 2.3: Database Actions Stubs**
- [ ] Restore function signatures in `lib/actions/recipes.ts` (return mock data)
- [ ] **Build Check**: Ensure TypeScript compiles
- [ ] Restore function signatures in `lib/actions/blog.ts`
- [ ] **Build Check**: Test build
- [ ] Restore function signatures in `lib/actions/tags.ts`
- [ ] **Build Check**: Final test

---

## **Phase 3: Authentication Foundation**

### **Step 3.1: Clerk Dependencies**
- [ ] Add `@clerk/nextjs` back to package.json
- [ ] Install dependency: `npm install @clerk/nextjs`
- [ ] **Build Check**: `npm run build`

### **Step 3.2: Auth Configuration (Disabled)**
- [ ] Add Clerk environment variables (with placeholder values)
- [ ] Restore Clerk provider in root layout (with feature flag to disable)
- [ ] **Build Check**: Ensure no import errors

### **Step 3.3: Auth Functions (Stubbed)**
- [ ] Restore auth function signatures in `lib/auth.ts`
- [ ] Keep all functions returning mock data
- [ ] **Build Check**: TypeScript compilation
- [ ] Restore admin guard signatures in `lib/auth/admin-guards.ts`
- [ ] **Build Check**: Final test

### **Step 3.4: Auth Components**
- [ ] Restore `AuthGuard` component structure (always allow access)
- [ ] **Build Check**: Component renders without errors
- [ ] Update sign-in/sign-up pages with proper components (disabled state)
- [ ] **Build Check**: Pages load correctly

---

## **Phase 4: Content Management System**

### **Step 4.1: Recipe Actions (Mock Data)**
- [ ] Restore create recipe function (return success without DB write)
- [ ] **Build Check**: Function exists and returns proper types
- [ ] Restore update recipe function
- [ ] **Build Check**: Test
- [ ] Restore delete recipe function
- [ ] **Build Check**: Test
- [ ] Restore get recipes functions
- [ ] **Build Check**: Final test

### **Step 4.2: Blog Actions (Mock Data)**
- [ ] Follow same pattern as recipes for blog posts
- [ ] Restore create, update, delete, get functions
- [ ] **Build Check**: After each function restoration

### **Step 4.3: Tag Management**
- [ ] Restore tag CRUD functions with mock data
- [ ] **Build Check**: TypeScript and build success

### **Step 4.4: UI Integration**
- [ ] Update recipe forms to call new functions (but show "Feature Coming Soon")
- [ ] **Build Check**: Forms render and submit without errors
- [ ] Update blog forms similarly
- [ ] **Build Check**: Test all forms

---

## **Phase 5: File Upload System**

### **Step 5.1: Upload Route Structure**
- [ ] Restore upload API route structure in `app/api/upload/route.ts`
- [ ] Return mock success responses
- [ ] **Build Check**: API route accessible

### **Step 5.2: Vercel Blob Preparation**
- [ ] Add `@vercel/blob` dependency
- [ ] Add blob storage environment variables (placeholder)
- [ ] **Build Check**: Dependencies install correctly

### **Step 5.3: Upload Integration**
- [ ] Connect upload forms to API route (mock responses)
- [ ] **Build Check**: Upload forms work with mock data

---

## **Phase 6: Live Feature Activation**

### **Step 6.1: Database Connection**
- [ ] Set up MongoDB Atlas instance
- [ ] Add real database URL to environment
- [ ] Test database connection in development
- [ ] **Build Check**: `npm run dev` with real DB

### **Step 6.2: Enable Database Actions**
- [ ] Replace mock data with real database calls (one model at a time)
- [ ] Start with Users model
- [ ] **Test**: Create, read, update, delete operations
- [ ] Enable Recipes model
- [ ] **Test**: Recipe CRUD operations
- [ ] Enable remaining models

### **Step 6.3: Authentication Activation**
- [ ] Add real Clerk API keys
- [ ] Enable Clerk provider
- [ ] **Test**: Sign up, sign in, sign out
- [ ] Enable auth guards
- [ ] **Test**: Protected routes work

### **Step 6.4: File Upload Activation**
- [ ] Configure Vercel Blob storage
- [ ] Enable real file uploads
- [ ] **Test**: Image upload and retrieval

---

## **Phase 7: Advanced Features**

### **Step 7.1: Redis Caching**
- [ ] Add Redis provider (Upstash/Redis Labs)
- [ ] Implement basic caching
- [ ] **Test**: Cache hit/miss functionality

### **Step 7.2: Email System**
- [ ] Configure SMTP provider
- [ ] Enable newsletter signup
- [ ] **Test**: Email sending

### **Step 7.3: Analytics**
- [ ] Enable one analytics provider at a time
- [ ] Start with Google Analytics
- [ ] **Test**: Event tracking

---

## **Build Verification Commands**

Run these commands after each step:

```bash
npm run build          # Production build test
npm run dev           # Development server test
npm run lint          # Code quality check (if available)
npm run type-check    # TypeScript validation (if available)
```

## **Rollback Strategy**

- Commit after each successful step
- Keep feature flags for easy disable/enable
- Maintain both mock and real implementations during transition
- Use git branches for major phase work

## **Key Files to Monitor**

- `lib/prisma.ts` - Database client
- `lib/auth.ts` - Authentication functions
- `lib/actions/` - Data operations
- `middleware.ts` - Request handling
- `app/api/upload/route.ts` - File uploads
- `components/auth/AuthGuard.tsx` - Auth protection

## **Environment Variables Needed**

### Database
- `DATABASE_URL`
- `DIRECT_URL`

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### File Storage (Vercel Blob)
- `BLOB_READ_WRITE_TOKEN`

### Caching (Redis)
- `REDIS_URL`

### Email
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

### Analytics
- `NEXT_PUBLIC_GA_ID`
- `PLAUSIBLE_DOMAIN`

## **Notes**

- Always test in development before deploying
- Keep the current working deployment as main branch
- Use feature branches for restoration work
- Document any issues encountered for future reference