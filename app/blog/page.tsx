import { Metadata } from 'next'
import { Suspense } from 'react'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogFilters } from '@/components/blog/BlogFilters'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogCategories } from '@/components/blog/BlogCategories'
import { FeaturedPosts } from '@/components/blog/FeaturedPosts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getBlogPostsMetadata, getFeaturedBlogPosts, getAllTags, getAllCategories } from '@/lib/mdx'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Blog - ${SITE_CONFIG.name}`,
  description: 'Thoughts, tutorials, and insights about development, design, and technology.',
  keywords: ['blog', 'development', 'programming', 'tutorials', 'technology'],
  openGraph: {
    title: `Blog - ${SITE_CONFIG.name}`,
    description: 'Thoughts, tutorials, and insights about development, design, and technology.',
    type: 'website',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog - ${SITE_CONFIG.name}`,
    description: 'Thoughts, tutorials, and insights about development, design, and technology.',
  },
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': [
        {
          url: '/blog/feed.xml',
          title: `${SITE_CONFIG.name} Blog RSS Feed`,
        },
      ],
    },
  },
}

interface BlogPageProps {
  searchParams: {
    q?: string
    tag?: string
    category?: string
    page?: string
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q: query, tag, category, page = '1' } = searchParams
  const currentPage = parseInt(page)
  const postsPerPage = 12

  // Get all posts and filter
  const allPosts = await getBlogPostsMetadata()
  const featuredPosts = await getFeaturedBlogPosts()
  const allTags = await getAllTags()
  const allCategories = await getAllCategories()

  // Filter posts based on search params
  let filteredPosts = allPosts

  if (query) {
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.description.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(postTag => postTag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  if (tag) {
    filteredPosts = filteredPosts.filter(post =>
      post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
    )
  }

  if (category) {
    filteredPosts = filteredPosts.filter(post =>
      post.category?.toLowerCase() === category.toLowerCase()
    )
  }

  // Pagination
  const totalPosts = filteredPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-black mb-4">
            Blog
          </h1>
          <p className="text-lg font-mono text-neutral-600 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about development, design, and technology.
          </p>
        </div>

        {/* Featured Posts */}
        {!query && !tag && !category && currentPage === 1 && featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-mono font-bold text-black mb-6">Featured Posts</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <FeaturedPosts posts={featuredPosts} />
            </Suspense>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <BlogSearch initialQuery={query} />
            </div>
            <div className="flex gap-4">
              <BlogFilters
                tags={allTags}
                categories={allCategories}
                selectedTag={tag}
                selectedCategory={category}
              />
            </div>
          </div>
          
          {/* Active Filters */}
          {(query || tag || category) && (
            <div className="flex flex-wrap gap-2">
              {query && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 border-2 border-primary-500 shadow-brutal-sm">
                  <span className="text-sm font-mono text-primary-700">Search: "{query}"</span>
                  <a
                    href="/blog"
                    className="text-primary-700 hover:text-primary-800 transition-colors duration-150"
                  >
                    <XIcon className="w-4 h-4" />
                  </a>
                </div>
              )}
              {tag && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 border-2 border-blue-500 shadow-brutal-sm">
                  <span className="text-sm font-mono text-blue-700">Tag: {tag}</span>
                  <a
                    href={`/blog${query ? `?q=${encodeURIComponent(query)}` : ''}${category ? `${query ? '&' : '?'}category=${encodeURIComponent(category)}` : ''}`}
                    className="text-blue-700 hover:text-blue-800 transition-colors duration-150"
                  >
                    <XIcon className="w-4 h-4" />
                  </a>
                </div>
              )}
              {category && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border-2 border-green-500 shadow-brutal-sm">
                  <span className="text-sm font-mono text-green-700">Category: {category}</span>
                  <a
                    href={`/blog${query ? `?q=${encodeURIComponent(query)}` : ''}${tag ? `${query ? '&' : '?'}tag=${encodeURIComponent(tag)}` : ''}`}
                    className="text-green-700 hover:text-green-800 transition-colors duration-150"
                  >
                    <XIcon className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="mb-12">
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    query={query}
                    tag={tag}
                    category={category}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-mono font-bold text-black mb-2">No posts found</h3>
              <p className="text-neutral-600 font-mono mb-6">
                {query || tag || category
                  ? "Try adjusting your search criteria or browse all posts."
                  : "No blog posts have been published yet."}
              </p>
              {(query || tag || category) && (
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-mono font-medium border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:translate-x-1 hover:translate-y-1 transition-all duration-150"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  View All Posts
                </a>
              )}
            </div>
          )}
        </div>

        {/* Categories and Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-mono font-bold text-black mb-4">Categories</h3>
            <BlogCategories categories={allCategories} selectedCategory={category} />
          </div>
          
          <div>
            <h3 className="text-xl font-mono font-bold text-black mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tagName) => (
                <a
                  key={tagName}
                  href={`/blog?tag=${encodeURIComponent(tagName)}`}
                  className={`px-3 py-1 text-sm font-mono border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-150 ${
                    tag === tagName
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-black hover:bg-neutral-50'
                  }`}
                >
                  {tagName}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  query,
  tag,
  category,
}: {
  currentPage: number
  totalPages: number
  query?: string
  tag?: string
  category?: string
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (tag) params.set('tag', tag)
    if (category) params.set('category', category)
    if (page > 1) params.set('page', page.toString())
    
    const queryString = params.toString()
    return `/blog${queryString ? `?${queryString}` : ''}`
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  )

  return (
    <div className="flex items-center gap-2">
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="px-3 py-2 bg-white text-black font-mono border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </a>
      )}
      
      {visiblePages[0] > 1 && (
        <>
          <a
            href={buildUrl(1)}
            className="px-3 py-2 bg-white text-black font-mono border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150"
          >
            1
          </a>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-neutral-500 font-mono">...</span>
          )}
        </>
      )}
      
      {visiblePages.map((page) => (
        <a
          key={page}
          href={buildUrl(page)}
          className={`px-3 py-2 font-mono border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150 ${
            page === currentPage
              ? 'bg-primary-500 text-white'
              : 'bg-white text-black'
          }`}
        >
          {page}
        </a>
      ))}
      
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-neutral-500 font-mono">...</span>
          )}
          <a
            href={buildUrl(totalPages)}
            className="px-3 py-2 bg-white text-black font-mono border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150"
          >
            {totalPages}
          </a>
        </>
      )}
      
      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="px-3 py-2 bg-white text-black font-mono border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150"
        >
          <ArrowRightIcon className="w-4 h-4" />
        </a>
      )}
    </div>
  )
}

// Icon components
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
    </svg>
  )
}

// This page uses ISR with revalidation
export const revalidate = 1800 // 30 minutes