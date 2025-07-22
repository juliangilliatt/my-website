# Feature Restoration Plan

*Last Updated: July 21, 2025*

This document tracks the incremental restoration of features that were stripped back for initial Vercel deployment.

## Overview

The website was stripped back from a full-featured recipe and blog platform to a basic static site for deployment. This plan outlines step-by-step restoration while maintaining build stability.

## External Services Required

### 🔴 Required Services (for core functionality)
1. **MongoDB Atlas** - Database & search (free tier available)
2. **Clerk** - Authentication (free tier available)
3. **Vercel Blob** - Image storage (Pro plan required)

### 🟡 Recommended Services
1. **GitHub Token** - For repository info
2. **Email Service** - For contact forms (Gmail/SendGrid/Mailgun)

### 🟢 Optional Services
1. **Redis** - Caching (Upstash free tier)
2. **Sentry** - Error tracking
3. **CDN** - Performance optimization

## Progress Tracking

- [x] Phase 1: Environment & Configuration Setup ✅
- [x] Phase 2: Database Infrastructure ✅
- [x] Phase 3: Authentication Foundation ✅
- [x] Phase 4: Content Management System ✅
- [x] Phase 5: File Upload System ✅  
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
- [x] Restore basic Prisma client in `lib/prisma.ts` (without actual DB connection)
- [x] Replace mock with real client but keep connection disabled
- [x] **Build Check**: `npm run build` ✅

### **Step 2.2: Database Models (One by One)**
- [x] Add User model to schema (all models already exist)
- [x] Run `npx prisma generate`
- [x] **Build Check**: Ensure no TypeScript errors ✅
- [x] Add Recipe model to schema
- [x] Run `npx prisma generate`
- [x] **Build Check**: Test again ✅
- [x] Add remaining models: BlogPost, Tag, Analytics
- [x] **Build Check**: `npm run build` ✅

### **Step 2.3: Database Actions Stubs**
- [x] Restore function signatures in `lib/actions/recipes.ts` (return mock data)
- [x] **Build Check**: Ensure TypeScript compiles ✅
- [x] Restore function signatures in `lib/actions/blog.ts` (existing stubs sufficient)
- [x] **Build Check**: Test build ✅
- [x] Restore function signatures in `lib/actions/tags.ts` (existing stubs sufficient)
- [x] **Build Check**: Final test ✅

---

## **Phase 3: Authentication Foundation**

### **Step 3.1: Clerk Dependencies**
- [x] Add `@clerk/nextjs` back to package.json (already installed)
- [x] Install dependency: `npm install @clerk/nextjs`
- [x] **Build Check**: `npm run build` ✅

### **Step 3.2: Auth Configuration (Disabled)**
- [x] Add Clerk environment variables (with placeholder values)
- [x] Restore Clerk provider in root layout (with feature flag to disable)
- [x] **Build Check**: Ensure no import errors ✅

### **Step 3.3: Auth Functions (Stubbed)**
- [x] Restore auth function signatures in `lib/auth.ts`
- [x] Keep all functions returning mock data
- [x] **Build Check**: TypeScript compilation ✅
- [x] Restore admin guard signatures (included in main auth.ts)
- [x] **Build Check**: Final test ✅

### **Step 3.4: Auth Components**
- [x] Restore `AuthGuard` component structure (always allow access)
- [x] **Build Check**: Component renders without errors ✅
- [x] Update sign-in/sign-up pages (existing pages work with disabled auth)
- [x] **Build Check**: Pages load correctly ✅

---

## **Phase 4: Content Management System**

### **Step 4.1: Recipe Actions (Mock Data)**
- [x] Restore create recipe function (return success without DB write)
- [x] **Build Check**: Function exists and returns proper types ✅
- [x] Restore update recipe function
- [x] **Build Check**: Test ✅
- [x] Restore delete recipe function
- [x] **Build Check**: Test ✅
- [x] Restore get recipes functions
- [x] **Build Check**: Final test ✅

### **Step 4.2: Blog Actions (Mock Data)**
- [x] Follow same pattern as recipes for blog posts
- [x] Restore create, update, delete, get functions
- [x] **Build Check**: After each function restoration ✅

### **Step 4.3: Tag Management**
- [x] Restore tag CRUD functions with mock data
- [x] **Build Check**: TypeScript and build success ✅

### **Step 4.4: UI Integration**
- [x] Update recipe forms to call new functions (existing forms work with mock data)
- [x] **Build Check**: Forms render and submit without errors ✅
- [x] Update blog forms similarly (existing forms work with mock data)
- [x] **Build Check**: Test all forms ✅

---

## **Phase 5: File Upload System**

### **Step 5.1: Upload Route Structure**
- [x] Restore upload API route structure in `app/api/upload/route.ts`
- [x] Return mock success responses
- [x] **Build Check**: API route accessible ✅

### **Step 5.2: Vercel Blob Preparation**
- [x] Add `@vercel/blob` dependency
- [x] Add blob storage environment variables (placeholder)
- [x] **Build Check**: Dependencies install correctly ✅

### **Step 5.3: Upload Integration**
- [x] Connect upload forms to API route (mock responses)
- [x] **Build Check**: Upload forms work with mock data ✅

---

## **Phase 5.5: External Service Account Setup**

### **Step 5.5.1: Required Accounts (High Priority)**
- [ ] **MongoDB Atlas**
  - [ ] Create account at https://cloud.mongodb.com
  - [ ] Create a new cluster (free tier available)
  - [ ] Create database user and password
  - [ ] Get connection string
  - [ ] Update `DATABASE_URL` in `.env.local`
- [ ] **Clerk Authentication**
  - [ ] Create account at https://clerk.com
  - [ ] Create new application
  - [ ] Get publishable key and secret key
  - [ ] Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- [ ] **Vercel Blob Storage**
  - [ ] Upgrade to Vercel Pro (if not already)
  - [ ] Enable Blob storage in project settings
  - [ ] Get read-write token
  - [ ] Update `BLOB_READ_WRITE_TOKEN`

### **Step 5.5.2: Recommended Accounts (Medium Priority)**
- [ ] **GitHub Personal Access Token**
  - [ ] Go to https://github.com/settings/tokens
  - [ ] Generate new token with `repo` scope
  - [ ] Update `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- [ ] **Security Secrets**
  - [ ] Generate random string for `NEXTAUTH_SECRET`
  - [ ] Generate random string for `WEBHOOK_SECRET`

### **Step 5.5.3: Optional Services (Low Priority)**
- [ ] **Email Service** (choose one):
  - [ ] Gmail App Password
  - [ ] SendGrid API
  - [ ] Mailgun API
- [ ] **Redis Cache**:
  - [ ] Local Redis or Upstash
- [ ] **Error Tracking**:
  - [ ] Sentry account
- [ ] **CDN Configuration**:
  - [ ] Cloudflare or similar

## **Phase 6: Live Feature Activation**

### **Step 6.1: Database Connection**
- [ ] Verify MongoDB Atlas instance is set up
- [ ] Test connection string locally
- [ ] Enable database connection in `lib/prisma.ts`
- [ ] Run database migrations/push
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