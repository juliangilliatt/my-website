# Deployment Setup Guide

## Environment Variables for Vercel

You need to add these environment variables to your Vercel project:

### Required Variables

1. **DATABASE_URL**
   - Go to MongoDB Atlas → Database Access
   - Create/update user password
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

2. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   - From Clerk dashboard
   - Example: `pk_test_...`

3. **CLERK_SECRET_KEY**
   - From Clerk dashboard
   - Example: `sk_test_...`

4. **BLOB_READ_WRITE_TOKEN**
   - From Vercel dashboard → Storage → Blob
   - Auto-generated when you enable Blob storage

### Optional but Recommended

- `NEXT_PUBLIC_SITE_URL` = `https://juliangilliatt.com`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/auth/sign-in`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/admin`

## Steps to Deploy

1. **Secure your MongoDB database:**
   ```
   - Go to MongoDB Atlas
   - Database Access → Edit user "julian"
   - Change password
   - Update DATABASE_URL with new password
   ```

2. **Add environment variables to Vercel:**
   ```
   - Vercel Dashboard → Your Project
   - Settings → Environment Variables
   - Add each variable listed above
   - Apply to: Production, Preview, Development
   ```

3. **Redeploy:**
   ```
   - Vercel will auto-deploy on git push
   - Or manually trigger: Deployments → Redeploy
   ```

## Testing

After deployment:
- Visit `/admin` - should show Clerk login
- After login - should show admin dashboard
- Try creating a recipe
- Recipe should save to MongoDB
- Recipe should appear on `/recipes` page

## Troubleshooting

If you see database errors:
1. Check DATABASE_URL is set in Vercel
2. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Check MongoDB user has read/write permissions
4. Test connection string locally first

If Clerk auth doesn't work:
1. Verify Clerk keys are correct
2. Check Clerk dashboard → Allowed redirect URLs includes your domain
3. Ensure NEXT_PUBLIC_CLERK_* variables are set
