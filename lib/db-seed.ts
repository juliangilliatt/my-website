import { PrismaClient } from '@prisma/client'
import { slugify } from './utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.analytics.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      bio: 'Full-stack developer and cooking enthusiast',
      website: 'https://example.com',
      github: 'yourusername',
      twitter: 'yourusername',
    },
  })

  // Create tags
  console.log('🏷️ Creating tags...')
  const recipeTags = [
    { name: 'Quick & Easy', color: '#22c55e' },
    { name: 'Vegetarian', color: '#16a34a' },
    { name: 'Gluten-Free', color: '#ca8a04' },
    { name: 'Healthy', color: '#059669' },
    { name: 'Comfort Food', color: '#dc2626' },
    { name: 'Italian', color: '#7c3aed' },
    { name: 'Asian', color: '#ea580c' },
    { name: 'Mexican', color: '#dc2626' },
    { name: 'Dessert', color: '#ec4899' },
    { name: 'Breakfast', color: '#f59e0b' },
  ]

  const blogTags = [
    { name: 'Development', color: '#3b82f6' },
    { name: 'React', color: '#06b6d4' },
    { name: 'Next.js', color: '#000000' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'Tutorial', color: '#8b5cf6' },
    { name: 'Tips', color: '#10b981' },
    { name: 'Cooking', color: '#f59e0b' },
    { name: 'Lifestyle', color: '#ef4444' },
  ]

  const allTags = [...recipeTags, ...blogTags]
  const createdTags = await Promise.all(
    allTags.map(tag =>
      prisma.tag.create({
        data: {
          name: tag.name,
          slug: slugify(tag.name),
          color: tag.color,
        },
      })
    )
  )

  // Create sample recipes
  console.log('🍳 Creating sample recipes...')
  const sampleRecipes = [
    {
      title: 'Classic Spaghetti Carbonara',
      description: 'A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
      prepTime: 15,
      cookTime: 20,
      totalTime: 35,
      servings: 4,
      difficulty: 'medium',
      category: 'main-course',
      cuisine: 'italian',
      featured: true,
      published: true,
      ingredients: [
        { name: 'Spaghetti', amount: 400, unit: 'g' },
        { name: 'Pancetta', amount: 200, unit: 'g' },
        { name: 'Eggs', amount: 4, unit: 'large' },
        { name: 'Parmesan cheese', amount: 100, unit: 'g', notes: 'freshly grated' },
        { name: 'Black pepper', amount: 1, unit: 'tsp', notes: 'freshly ground' },
        { name: 'Salt', amount: 1, unit: 'tsp' },
      ],
      instructions: [
        { step: 1, description: 'Cook spaghetti in salted boiling water until al dente.' },
        { step: 2, description: 'Fry pancetta in a large pan until crispy.' },
        { step: 3, description: 'Beat eggs with parmesan and black pepper in a bowl.' },
        { step: 4, description: 'Drain pasta and add to pan with pancetta.' },
        { step: 5, description: 'Remove from heat and quickly stir in egg mixture.' },
        { step: 6, description: 'Serve immediately with extra parmesan.' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1551892374-ecf8db2d447d', alt: 'Spaghetti Carbonara', isPrimary: true },
      ],
      nutrition: {
        calories: 520,
        protein: 25,
        carbs: 45,
        fat: 28,
        fiber: 2,
      },
      tags: ['Italian', 'Comfort Food'],
    },
    {
      title: 'Avocado Toast with Poached Egg',
      description: 'A healthy and delicious breakfast featuring creamy avocado and perfectly poached eggs.',
      prepTime: 10,
      cookTime: 5,
      totalTime: 15,
      servings: 2,
      difficulty: 'easy',
      category: 'breakfast',
      cuisine: 'american',
      featured: false,
      published: true,
      ingredients: [
        { name: 'Bread', amount: 2, unit: 'slices', notes: 'sourdough or whole grain' },
        { name: 'Avocado', amount: 1, unit: 'large', notes: 'ripe' },
        { name: 'Eggs', amount: 2, unit: 'large' },
        { name: 'Lemon juice', amount: 1, unit: 'tsp' },
        { name: 'Salt', amount: 0.5, unit: 'tsp' },
        { name: 'Black pepper', amount: 0.25, unit: 'tsp' },
        { name: 'Red pepper flakes', amount: 0.25, unit: 'tsp', optional: true },
      ],
      instructions: [
        { step: 1, description: 'Toast bread slices until golden brown.' },
        { step: 2, description: 'Mash avocado with lemon juice, salt, and pepper.' },
        { step: 3, description: 'Poach eggs in simmering water for 3-4 minutes.' },
        { step: 4, description: 'Spread avocado mixture on toast.' },
        { step: 5, description: 'Top with poached eggs and seasonings.' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d', alt: 'Avocado Toast', isPrimary: true },
      ],
      nutrition: {
        calories: 320,
        protein: 15,
        carbs: 25,
        fat: 20,
        fiber: 8,
      },
      tags: ['Healthy', 'Breakfast', 'Quick & Easy', 'Vegetarian'],
    },
    {
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies that are crispy on the outside and chewy inside.',
      prepTime: 15,
      cookTime: 12,
      totalTime: 27,
      servings: 24,
      difficulty: 'easy',
      category: 'desserts',
      cuisine: 'american',
      featured: true,
      published: true,
      ingredients: [
        { name: 'All-purpose flour', amount: 2.25, unit: 'cups' },
        { name: 'Butter', amount: 1, unit: 'cup', notes: 'softened' },
        { name: 'Brown sugar', amount: 0.75, unit: 'cup', notes: 'packed' },
        { name: 'Granulated sugar', amount: 0.75, unit: 'cup' },
        { name: 'Eggs', amount: 2, unit: 'large' },
        { name: 'Vanilla extract', amount: 2, unit: 'tsp' },
        { name: 'Baking soda', amount: 1, unit: 'tsp' },
        { name: 'Salt', amount: 1, unit: 'tsp' },
        { name: 'Chocolate chips', amount: 2, unit: 'cups' },
      ],
      instructions: [
        { step: 1, description: 'Preheat oven to 375°F (190°C).' },
        { step: 2, description: 'Mix flour, baking soda, and salt in a bowl.' },
        { step: 3, description: 'Cream butter and sugars until fluffy.' },
        { step: 4, description: 'Beat in eggs and vanilla.' },
        { step: 5, description: 'Gradually mix in flour mixture.' },
        { step: 6, description: 'Stir in chocolate chips.' },
        { step: 7, description: 'Drop rounded tablespoons on baking sheet.' },
        { step: 8, description: 'Bake for 9-11 minutes until golden brown.' },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e', alt: 'Chocolate Chip Cookies', isPrimary: true },
      ],
      nutrition: {
        calories: 180,
        protein: 2,
        carbs: 25,
        fat: 8,
        fiber: 1,
        sugar: 18,
      },
      tags: ['Dessert', 'Comfort Food'],
    },
  ]

  for (const recipe of sampleRecipes) {
    const recipeTagIds = createdTags
      .filter(tag => recipe.tags.includes(tag.name))
      .map(tag => tag.id)

    await prisma.recipe.create({
      data: {
        title: recipe.title,
        slug: slugify(recipe.title),
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        category: recipe.category,
        cuisine: recipe.cuisine,
        featured: recipe.featured,
        published: recipe.published,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        images: recipe.images,
        nutrition: recipe.nutrition,
        authorId: adminUser.id,
        tagIds: recipeTagIds,
      },
    })
  }

  // Create sample blog posts
  console.log('📝 Creating sample blog posts...')
  const sampleBlogPosts = [
    {
      title: 'Building a Modern Recipe App with Next.js 14',
      excerpt: 'Learn how to create a full-stack recipe application using Next.js 14, Prisma, and MongoDB.',
      content: `# Building a Modern Recipe App with Next.js 14

In this comprehensive tutorial, we'll build a modern recipe application using the latest web technologies.

## What We'll Build

Our recipe app will include:
- Recipe listing and detail pages
- Search and filtering functionality
- Admin dashboard for managing recipes
- User authentication
- Responsive design

## Tech Stack

- **Next.js 14** - React framework with app router
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **MongoDB** - NoSQL database
- **Tailwind CSS** - Styling
- **Clerk** - Authentication

## Getting Started

First, let's set up our Next.js project:

\`\`\`bash
npx create-next-app@latest recipe-app --typescript --tailwind --app
cd recipe-app
npm install prisma @prisma/client
\`\`\`

## Database Schema

We'll define our Prisma schema for recipes:

\`\`\`prisma
model Recipe {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  slug        String @unique
  description String
  // ... more fields
}
\`\`\`

This is just the beginning of our journey. In the next posts, we'll dive deeper into each component.`,
      category: 'development',
      status: 'PUBLISHED',
      featured: true,
      publishedAt: new Date('2024-01-15'),
      readingTime: 8,
      views: 1250,
      likes: 45,
      tags: ['Development', 'React', 'Next.js', 'TypeScript', 'Tutorial'],
    },
    {
      title: 'The Science of Perfect Chocolate Chip Cookies',
      excerpt: 'Discover the chemistry behind baking the perfect chocolate chip cookie every time.',
      content: `# The Science of Perfect Chocolate Chip Cookies

There's more to baking perfect chocolate chip cookies than following a recipe. Understanding the science behind each ingredient helps you achieve consistent results.

## The Role of Each Ingredient

### Flour
The protein content in flour affects texture:
- **All-purpose flour** (10-12% protein) creates a tender, chewy texture
- **Bread flour** (12-14% protein) makes cookies more chewy
- **Cake flour** (7-9% protein) produces tender, delicate cookies

### Sugars
Different sugars create different textures:
- **Brown sugar** adds moisture and chewiness
- **Granulated sugar** promotes spreading and crispness
- The ratio determines your final texture

### Butter Temperature
- **Room temperature**: Creates fluffy, cake-like cookies
- **Melted and cooled**: Results in dense, chewy cookies
- **Cold**: Produces thick, less spread cookies

## The Perfect Recipe Formula

After testing dozens of variations, here's my science-backed formula:
- 60% brown sugar, 40% granulated sugar
- Room temperature butter
- Slightly underbaked (9-10 minutes)
- Rest dough for 30 minutes

## Common Mistakes

1. **Overmixing** - Develops gluten, making cookies tough
2. **Wrong oven temperature** - Too hot = burnt edges, raw centers
3. **Not measuring by weight** - Inconsistent results

Follow these principles, and you'll have perfect cookies every time!`,
      category: 'cooking',
      status: 'PUBLISHED',
      featured: false,
      publishedAt: new Date('2024-01-10'),
      readingTime: 6,
      views: 890,
      likes: 32,
      tags: ['Cooking', 'Tips'],
    },
    {
      title: 'My Journey from Developer to Food Blogger',
      excerpt: 'How I transitioned from writing code to writing about food, and what I learned along the way.',
      content: `# My Journey from Developer to Food Blogger

Five years ago, I was a typical software developer working long hours, surviving on takeout and instant ramen. Today, I run a successful food blog while maintaining my development career.

## The Spark

It started during the pandemic lockdown. With restaurants closed and time on my hands, I began experimenting in the kitchen. What started as necessity became passion.

## Finding My Voice

Initially, I tried to copy other food bloggers' styles. But I found my unique voice when I started applying my analytical, problem-solving developer mindset to cooking.

## The Technical Side

Building this blog taught me new skills:
- Food photography
- Recipe development and testing
- SEO optimization
- Community building

## Lessons Learned

1. **Authenticity matters** - Readers connect with genuine stories
2. **Consistency is key** - Regular posting builds audience
3. **Engagement over followers** - Quality community beats quantity
4. **Document everything** - Great content comes from good notes

## What's Next

I'm working on a cookbook that combines my two passions: "Code & Cook: A Developer's Guide to Systematic Cooking."

The journey continues, and I'm excited to share it with you.`,
      category: 'personal',
      status: 'PUBLISHED',
      featured: true,
      publishedAt: new Date('2024-01-05'),
      readingTime: 4,
      views: 2100,
      likes: 78,
      tags: ['Lifestyle', 'Cooking'],
    },
  ]

  for (const post of sampleBlogPosts) {
    const postTagIds = createdTags
      .filter(tag => post.tags.includes(tag.name))
      .map(tag => tag.id)

    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: slugify(post.title),
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        status: post.status as 'PUBLISHED',
        featured: post.featured,
        publishedAt: post.publishedAt,
        readingTime: post.readingTime,
        views: post.views,
        likes: post.likes,
        authorId: adminUser.id,
        tagIds: postTagIds,
      },
    })
  }

  // Update tag counts
  console.log('🔄 Updating tag counts...')
  for (const tag of createdTags) {
    const recipeCount = await prisma.recipe.count({
      where: {
        tagIds: {
          has: tag.id,
        },
      },
    })

    const blogPostCount = await prisma.blogPost.count({
      where: {
        tagIds: {
          has: tag.id,
        },
      },
    })

    await prisma.tag.update({
      where: { id: tag.id },
      data: {
        count: recipeCount + blogPostCount,
      },
    })
  }

  // Create sample newsletter subscribers
  console.log('📧 Creating sample newsletter subscribers...')
  const sampleSubscribers = [
    { email: 'john@example.com', name: 'John Doe', subscribed: true, confirmed: true },
    { email: 'jane@example.com', name: 'Jane Smith', subscribed: true, confirmed: true },
    { email: 'bob@example.com', name: 'Bob Johnson', subscribed: true, confirmed: false },
  ]

  for (const subscriber of sampleSubscribers) {
    await prisma.newsletter.create({
      data: subscriber,
    })
  }

  // Create sample analytics data
  console.log('📊 Creating sample analytics data...')
  const sampleAnalytics = [
    { event: 'page_view', path: '/', userAgent: 'Mozilla/5.0' },
    { event: 'page_view', path: '/recipes', userAgent: 'Mozilla/5.0' },
    { event: 'page_view', path: '/blog', userAgent: 'Mozilla/5.0' },
    { event: 'recipe_view', path: '/recipes/classic-spaghetti-carbonara', userAgent: 'Mozilla/5.0' },
    { event: 'blog_view', path: '/blog/building-modern-recipe-app-nextjs-14', userAgent: 'Mozilla/5.0' },
  ]

  for (const analytics of sampleAnalytics) {
    await prisma.analytics.create({
      data: analytics,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`Created:
  - 1 admin user
  - ${createdTags.length} tags
  - ${sampleRecipes.length} recipes
  - ${sampleBlogPosts.length} blog posts
  - ${sampleSubscribers.length} newsletter subscribers
  - ${sampleAnalytics.length} analytics entries`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })