import { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroSection, FeatureHighlights, StatsSection, NewsletterSection } from '@/components/landing/HeroSection'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getLatestRecipes } from '@/lib/actions/recipes'
import { getLatestBlogPosts } from '@/lib/actions/blog'
import { getLastCommit } from '@/lib/github'
import { SITE_CONFIG } from '@/lib/constants'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to my brutalist portfolio featuring recipes and blog posts about development and cooking',
  keywords: ['portfolio', 'recipes', 'blog', 'developer', 'cooking', 'brutalism'],
  openGraph: {
    title: `${SITE_CONFIG.name} - Home`,
    description: 'Welcome to my brutalist portfolio featuring recipes and blog posts',
    type: 'website',
    url: '/',
  },
}

// ISR: Revalidate every hour
export const revalidate = 3600

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Highlights */}
      <FeatureHighlights />
      
      {/* Recent Content */}
      <Suspense fallback={<RecentContentSkeleton />}>
        <RecentContent />
      </Suspense>
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Newsletter Section */}
      <NewsletterSection />
    </main>
  )
}

async function RecentContent() {
  try {
    // Fetch latest content in parallel
    const [recipesResponse, blogResponse, commitResponse] = await Promise.allSettled([
      getLatestRecipes({ limit: 3 }),
      getLatestBlogPosts({ limit: 3 }),
      getLastCommit()
    ])

    const recipes = recipesResponse.status === 'fulfilled' ? recipesResponse.value.recipes : []
    const blogPosts = blogResponse.status === 'fulfilled' ? blogResponse.value.posts : []
    const lastCommit = commitResponse.status === 'fulfilled' ? commitResponse.value.data : null

    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Recipes */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold text-black uppercase tracking-wide">
                  Recent Recipes
                </h2>
                <Link
                  href="/recipes"
                  className="inline-flex items-center font-mono text-sm text-primary-500 hover:text-primary-600 transition-colors duration-150"
                >
                  View All
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <p className="font-mono text-neutral-600">
                      No recipes yet. Check back soon!
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Blog Posts */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold text-black uppercase tracking-wide">
                  Recent Posts
                </h2>
                <Link
                  href="/blog"
                  className="inline-flex items-center font-mono text-sm text-primary-500 hover:text-primary-600 transition-colors duration-150"
                >
                  View All
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="space-y-4">
                {blogPosts.length > 0 ? (
                  blogPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <p className="font-mono text-neutral-600">
                      No blog posts yet. Check back soon!
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Activity */}
          {lastCommit && (
            <div className="mt-12 pt-8 border-t-2 border-black">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-mono font-semibold text-black uppercase tracking-wide">
                  Recent Activity
                </h3>
                <Badge variant="outline" className="font-mono text-xs">
                  GitHub
                </Badge>
              </div>
              
              <div className="mt-4 p-4 bg-neutral-50 border-2 border-black shadow-brutal">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500 border-2 border-black shadow-brutal-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm text-black">
                      Latest commit: {lastCommit.commit.message}
                    </p>
                    <p className="font-mono text-xs text-neutral-600 mt-1">
                      by {lastCommit.commit.author.name} • {new Date(lastCommit.commit.author.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error fetching recent content:', error)
    return <RecentContentError />
  }
}

function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <Card className="p-4 hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-mono font-semibold text-black text-lg">
            {recipe.title}
          </h3>
          <Badge variant="outline" className="font-mono text-xs">
            {recipe.category}
          </Badge>
        </div>
        
        <p className="font-mono text-sm text-neutral-600 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>{recipe.prepTime} + {recipe.cookTime}</span>
          <span>{recipe.servings} servings</span>
        </div>
        
        <Link
          href={`/recipes/${recipe.slug}`}
          className="inline-flex items-center font-mono text-sm text-primary-500 hover:text-primary-600 transition-colors duration-150"
        >
          Read Recipe
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </Card>
  )
}

function BlogPostCard({ post }: { post: any }) {
  return (
    <Card className="p-4 hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-mono font-semibold text-black text-lg">
            {post.title}
          </h3>
          <Badge variant="outline" className="font-mono text-xs">
            {post.category}
          </Badge>
        </div>
        
        <p className="font-mono text-sm text-neutral-600 line-clamp-2">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          <span>{post.readTime} min read</span>
        </div>
        
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center font-mono text-sm text-primary-500 hover:text-primary-600 transition-colors duration-150"
        >
          Read Post
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </Card>
  )
}

function RecentContentSkeleton() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recent Recipes Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-neutral-200 animate-pulse" />
              <div className="h-6 w-20 bg-neutral-200 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="h-6 w-3/4 bg-neutral-200 animate-pulse" />
                      <div className="h-5 w-16 bg-neutral-200 animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-neutral-200 animate-pulse" />
                    <div className="h-4 w-2/3 bg-neutral-200 animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-neutral-200 animate-pulse" />
                      <div className="h-4 w-16 bg-neutral-200 animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Blog Posts Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-neutral-200 animate-pulse" />
              <div className="h-6 w-20 bg-neutral-200 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="h-6 w-3/4 bg-neutral-200 animate-pulse" />
                      <div className="h-5 w-16 bg-neutral-200 animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-neutral-200 animate-pulse" />
                    <div className="h-4 w-2/3 bg-neutral-200 animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-neutral-200 animate-pulse" />
                      <div className="h-4 w-16 bg-neutral-200 animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RecentContentError() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center border-2 border-red-500 bg-red-50">
          <h2 className="text-2xl font-mono font-bold text-red-800 mb-4">
            Content Unavailable
          </h2>
          <p className="font-mono text-red-600 mb-6">
            Unable to load recent content. Please try again later.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/recipes"
              className="px-4 py-2 bg-white text-black border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 font-mono text-sm"
            >
              View Recipes
            </Link>
            <Link
              href="/blog"
              className="px-4 py-2 bg-white text-black border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 font-mono text-sm"
            >
              View Blog
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}