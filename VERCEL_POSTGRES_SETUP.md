# Set Up Vercel Postgres Database

## Quick Steps

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `my-website` project

2. **Create Postgres Database**
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a region (closest to you for best performance)
   - Click "Create"

3. **Connect Database to Project**
   - Vercel will automatically add these environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`
   - These will be available in Production, Preview, and Development

4. **Run Database Migration**
   After the database is created, you need to create the tables.

   **Option A - From Vercel Dashboard:**
   - Go to Storage → Your Database → Query
   - Or use the Vercel CLI (see below)

   **Option B - From your local machine:**
   ```bash
   # Pull the new environment variables
   vercel env pull .env.local

   # Run the migration
   npx prisma db push

   # Optionally, seed with sample data
   npm run db:seed
   ```

5. **Trigger Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - The new deployment will use Postgres!

## What Changed

- **Database**: MongoDB → PostgreSQL
- **Provider**: MongoDB Atlas → Vercel Postgres
- **IDs**: ObjectId → cuid (more portable)
- **Many-to-Many**: Array fields → Proper relation tables
- **JSON fields**: Still supported (JSONB in Postgres)

## Testing

After deployment:
1. Visit `/admin`
2. Login with Clerk
3. Try creating a recipe
4. It should save successfully!
5. Visit `/recipes` to see your recipe

## Benefits of Vercel Postgres

✅ Zero configuration - auto-connects to your project
✅ Free tier: 256 MB storage, 60 compute hours/month
✅ Connection pooling built-in
✅ Automatic backups
✅ Better performance for relational queries
✅ No more MongoDB authentication issues!

## Troubleshooting

If you see database errors after deployment:
1. Check that the Postgres database is created in Vercel
2. Verify environment variables are set (they should auto-set)
3. Make sure you ran `npx prisma db push` to create tables
4. Check deployment logs for specific errors

## Rolling Back (if needed)

If you need to go back to MongoDB:
1. Restore the old `schema.prisma` from git history
2. Run `npx prisma generate`
3. Set `DATABASE_URL` back to MongoDB connection string
4. Redeploy
