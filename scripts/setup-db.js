const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setupDatabase() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db();
    console.log('✅ Connected to database:', db.databaseName);
    
    // Create text indexes for search functionality
    console.log('📝 Creating text indexes...');
    
    // Recipe search index
    await db.collection('recipes').createIndex(
      { 
        title: 'text', 
        description: 'text',
        'ingredients.name': 'text',
        'instructions.description': 'text'
      },
      { 
        name: 'recipe_search_index',
        weights: {
          title: 10,
          description: 5,
          'ingredients.name': 3,
          'instructions.description': 1
        }
      }
    );
    console.log('✅ Created recipe search index');
    
    // Blog post search index
    await db.collection('blog_posts').createIndex(
      { 
        title: 'text', 
        excerpt: 'text',
        content: 'text'
      },
      { 
        name: 'blog_search_index',
        weights: {
          title: 10,
          excerpt: 5,
          content: 1
        }
      }
    );
    console.log('✅ Created blog post search index');
    
    // Create compound indexes for performance
    console.log('🔍 Creating compound indexes...');
    
    // Recipe filtering indexes
    await db.collection('recipes').createIndex(
      { published: 1, featured: 1, createdAt: -1 },
      { name: 'recipe_published_featured_created' }
    );
    
    await db.collection('recipes').createIndex(
      { published: 1, category: 1, createdAt: -1 },
      { name: 'recipe_published_category_created' }
    );
    
    await db.collection('recipes').createIndex(
      { published: 1, cuisine: 1, createdAt: -1 },
      { name: 'recipe_published_cuisine_created' }
    );
    
    await db.collection('recipes').createIndex(
      { published: 1, difficulty: 1, createdAt: -1 },
      { name: 'recipe_published_difficulty_created' }
    );
    
    await db.collection('recipes').createIndex(
      { published: 1, prepTime: 1, cookTime: 1 },
      { name: 'recipe_published_time' }
    );
    
    await db.collection('recipes').createIndex(
      { published: 1, servings: 1 },
      { name: 'recipe_published_servings' }
    );
    
    await db.collection('recipes').createIndex(
      { published: 1, rating: -1 },
      { name: 'recipe_published_rating' }
    );
    
    console.log('✅ Created recipe compound indexes');
    
    // Blog post filtering indexes
    await db.collection('blog_posts').createIndex(
      { status: 1, featured: 1, publishedAt: -1 },
      { name: 'blog_status_featured_published' }
    );
    
    await db.collection('blog_posts').createIndex(
      { status: 1, category: 1, publishedAt: -1 },
      { name: 'blog_status_category_published' }
    );
    
    await db.collection('blog_posts').createIndex(
      { status: 1, views: -1 },
      { name: 'blog_status_views' }
    );
    
    await db.collection('blog_posts').createIndex(
      { status: 1, likes: -1 },
      { name: 'blog_status_likes' }
    );
    
    console.log('✅ Created blog post compound indexes');
    
    // Tag indexes
    await db.collection('tags').createIndex(
      { count: -1 },
      { name: 'tag_count' }
    );
    
    console.log('✅ Created tag indexes');
    
    // Analytics indexes
    await db.collection('analytics').createIndex(
      { event: 1, createdAt: -1 },
      { name: 'analytics_event_created' }
    );
    
    await db.collection('analytics').createIndex(
      { path: 1, createdAt: -1 },
      { name: 'analytics_path_created' }
    );
    
    await db.collection('analytics').createIndex(
      { event: 1, path: 1, createdAt: -1 },
      { name: 'analytics_event_path_created' }
    );
    
    console.log('✅ Created analytics indexes');
    
    // User-related indexes
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true, name: 'user_email_unique' }
    );
    
    await db.collection('users').createIndex(
      { role: 1 },
      { name: 'user_role' }
    );
    
    console.log('✅ Created user indexes');
    
    // Newsletter indexes
    await db.collection('newsletter').createIndex(
      { email: 1 },
      { unique: true, name: 'newsletter_email_unique' }
    );
    
    await db.collection('newsletter').createIndex(
      { subscribed: 1, confirmed: 1 },
      { name: 'newsletter_subscribed_confirmed' }
    );
    
    console.log('✅ Created newsletter indexes');
    
    // Contact form indexes
    await db.collection('contacts').createIndex(
      { status: 1, createdAt: -1 },
      { name: 'contact_status_created' }
    );
    
    await db.collection('contacts').createIndex(
      { email: 1 },
      { name: 'contact_email' }
    );
    
    console.log('✅ Created contact indexes');
    
    // Session and auth indexes
    await db.collection('sessions').createIndex(
      { sessionToken: 1 },
      { unique: true, name: 'session_token_unique' }
    );
    
    await db.collection('sessions').createIndex(
      { expires: 1 },
      { name: 'session_expires', expireAfterSeconds: 0 }
    );
    
    await db.collection('verification_tokens').createIndex(
      { token: 1 },
      { unique: true, name: 'verification_token_unique' }
    );
    
    await db.collection('verification_tokens').createIndex(
      { expires: 1 },
      { name: 'verification_expires', expireAfterSeconds: 0 }
    );
    
    console.log('✅ Created session and auth indexes');
    
    // List all indexes for verification
    console.log('📋 Listing all indexes...');
    const collections = ['recipes', 'blog_posts', 'tags', 'users', 'analytics'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      console.log(`\n${collectionName} indexes:`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma db push');
    console.log('3. Run: npm run seed (or tsx lib/db-seed.ts)');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Database connection closed');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };