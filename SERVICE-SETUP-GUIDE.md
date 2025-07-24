# External Service Setup Guide

*Step-by-step instructions for setting up required external services*

## 🔴 Required Services (for core functionality)

### 1. MongoDB Atlas Setup

**Purpose**: Primary database for all content, users, and metadata

**Steps**:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account or sign in
3. Create a new project (e.g., "my-website")
4. Create a new cluster:
   - Choose "M0 Sandbox" (free tier)
   - Select a cloud provider and region close to you
   - Name: "my-website-cluster"
5. Create database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `mywebsite-user`
   - Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
6. Set up network access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
7. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `my-website`

**Update `.env.local`**:
```bash
DATABASE_URL="mongodb+srv://mywebsite-user:YOUR_PASSWORD@my-website-cluster.xxxxx.mongodb.net/my-website?retryWrites=true&w=majority"
```

---

### 2. Clerk Authentication Setup

**Purpose**: User authentication and management

**Steps**:
1. Go to [Clerk](https://clerk.com)
2. Create a free account or sign in
3. Create a new application:
   - Name: "My Website"
   - Choose sign-in options (email, Google, GitHub, etc.)
4. Get API keys:
   - Go to "API Keys" in dashboard
   - Copy "Publishable key" and "Secret key"
5. Configure settings:
   - Go to "User & Authentication" → "Social Connections"
   - Enable desired social providers (optional)
   - Go to "Paths" and verify sign-in/sign-up URLs match your app

**Update `.env.local`**:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
CLERK_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
ENABLE_CLERK="true"
```

---

### 3. Vercel Blob Storage Setup

**Purpose**: Image and file storage for recipes and blog posts

**Prerequisites**: Vercel Pro plan required ($20/month)

**Steps**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Upgrade to Pro plan if not already
3. Select your project
4. Go to "Storage" tab
5. Create a new Blob store:
   - Name: "my-website-uploads"
   - Region: Choose closest to your users
6. Get API token:
   - Go to "Settings" → "Environment Variables"
   - Add `BLOB_READ_WRITE_TOKEN`
   - Copy the token from Blob store settings

**Update `.env.local`**:
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_YOUR_TOKEN"
ENABLE_FILE_UPLOADS="true"
```

---

## 🟡 Recommended Services

### 4. GitHub Personal Access Token

**Purpose**: Shows "last updated" badge on landing page

**Steps**:
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "My Website Repository Access"
4. Expiration: Set to your preference
5. Scopes: Check "repo" (or just "public_repo" if repository is public)
6. Generate and copy the token

**Update `.env.local`**:
```bash
GITHUB_TOKEN="ghp_YOUR_GITHUB_TOKEN"
GITHUB_OWNER="YOUR_GITHUB_USERNAME"
GITHUB_REPO="my-website"
```

### 5. Security Secrets

**Purpose**: Session security and webhook validation

**Generate secure random strings**:
```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

**Update `.env.local`**:
```bash
NEXTAUTH_SECRET="YOUR_32_CHARACTER_RANDOM_STRING"
WEBHOOK_SECRET="YOUR_32_CHARACTER_RANDOM_STRING"
```

---

## 🟢 Optional Services

### 6. Email Service (Choose One)

#### Option A: Gmail App Password
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings → Security → 2-Step Verification → App passwords
3. Generate app password for "Mail"

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-character-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

#### Option B: SendGrid
1. Go to [SendGrid](https://sendgrid.com)
2. Create free account (100 emails/day)
3. Create API key with "Mail Send" permissions

```bash
SENDGRID_API_KEY="SG.YOUR_SENDGRID_API_KEY"
```

### 7. Redis Cache (Optional Performance)

#### Option A: Upstash (Free tier)
1. Go to [Upstash](https://upstash.com)
2. Create free account
3. Create Redis database
4. Copy connection URL

```bash
REDIS_URL="redis://default:YOUR_PASSWORD@your-endpoint.upstash.io:6379"
```

### 8. Error Tracking - Sentry (Optional)

1. Go to [Sentry](https://sentry.io)
2. Create free account
3. Create new project (Next.js)
4. Copy DSN

```bash
SENTRY_DSN="https://YOUR_DSN@sentry.io/PROJECT_ID"
```

---

## Activation Checklist

After setting up each service, update these feature flags:

```bash
# Required for basic functionality
DATABASE_URL="mongodb+srv://..."          # ✅ MongoDB Atlas
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."  # ✅ Clerk Auth
CLERK_SECRET_KEY="sk_..."                 # ✅ Clerk Auth
ENABLE_CLERK="true"                       # ✅ Enable auth
BLOB_READ_WRITE_TOKEN="vercel_blob_..."   # ✅ Vercel Blob
ENABLE_FILE_UPLOADS="true"               # ✅ Enable uploads

# Recommended  
GITHUB_TOKEN="ghp_..."                   # ✅ GitHub API
NEXTAUTH_SECRET="..."                    # ✅ Security
WEBHOOK_SECRET="..."                     # ✅ Security

# Optional
SMTP_HOST="smtp.gmail.com"               # ✅ Email (if desired)
REDIS_URL="redis://..."                  # ✅ Cache (if desired)
SENTRY_DSN="https://..."                 # ✅ Monitoring (if desired)
```

## Testing Your Setup

After configuration, test each service:

```bash
# 1. Test build
npm run build

# 2. Test development server
npm run dev

# 3. Test database connection
# Visit /admin (should work with auth)

# 4. Test file uploads
# Try uploading an image in admin area

# 5. Test authentication
# Try signing up/signing in
```

## Troubleshooting

### MongoDB Connection Issues
- Check IP whitelist (0.0.0.0/0 for development)
- Verify username/password in connection string
- Ensure database name matches in URL

### Clerk Authentication Issues  
- Verify publishable key starts with `pk_`
- Verify secret key starts with `sk_`
- Check domain settings in Clerk dashboard

### File Upload Issues
- Ensure Vercel Pro plan is active
- Verify blob token has read/write permissions
- Check file size limits (10MB default)

### Environment Variable Issues
- Restart development server after changes
- Check for typos in variable names
- Ensure no extra spaces or quotes

## Cost Summary

- **MongoDB Atlas**: Free (M0 Sandbox - 512MB)
- **Clerk**: Free (up to 10,000 MAU)
- **Vercel Blob**: Requires Pro plan ($20/month + usage)
- **GitHub**: Free for public repos
- **SendGrid**: Free (100 emails/day)
- **Upstash**: Free (10K requests/day)
- **Sentry**: Free (5K errors/month)

**Total minimum cost**: $20/month (Vercel Pro for Blob storage)