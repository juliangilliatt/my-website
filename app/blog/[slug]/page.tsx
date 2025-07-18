import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from '@/lib/mdx'
import { BlogPost } from '@/components/blog/BlogPost'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { BlogNavigation } from '@/components/blog/BlogNavigation'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { BackToTop } from '@/components/blog/BackToTop'
import { SITE_CONFIG } from '@/lib/constants'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: post.title,
    description: post.description,
    keywords: [
      'blog',
      'programming',
      'development',
      'tutorial',
      ...(post.tags || []),
      ...(post.category ? [post.category] : []),
    ],
    authors: [{ name: post.author || SITE_CONFIG.name }],
    openGraph: {
      title: `${post.title} - ${SITE_CONFIG.name}`,
      description: post.description,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author || SITE_CONFIG.name],
      section: post.category,
      tags: post.tags,
      images: post.image ? [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post, 3)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    author: {
      '@type': 'Person',
      name: post.author || SITE_CONFIG.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
    wordCount: post.content.split(' ').length,
    keywords: post.tags.join(', '),
    articleSection: post.category,
    inLanguage: 'en-US',
    timeRequired: `PT${post.readingTime}M`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      <ReadingProgress />
      
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <BlogNavigation post={post} />
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8">
                <TableOfContents post={post} />
              </div>
            </div>
            
            {/* Blog post content */}
            <div className="lg:col-span-3">
              <BlogPost post={post} />
              
              {/* Table of Contents - Mobile */}
              <div className="lg:hidden mt-8">
                <TableOfContents post={post} />
              </div>
              
              {/* Share buttons */}
              <div className="mt-8 pt-8 border-t-2 border-black">
                <ShareButtons post={post} />
              </div>
              
              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-black">
                  <RelatedPosts posts={relatedPosts} />
                </div>
              )}
              
              {/* Navigation between posts */}
              <div className="mt-12 pt-8 border-t-2 border-black">
                <PostNavigation currentPost={post} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BackToTop />
    </>
  )
}

// Post navigation component
async function PostNavigation({ currentPost }: { currentPost: any }) {
  const allPosts = await getAllBlogPosts()
  const currentIndex = allPosts.findIndex(post => post.slug === currentPost.slug)
  
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  if (!previousPost && !nextPost) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {previousPost && (
        <a
          href={`/blog/${previousPost.slug}`}
          className="group p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
        >
          <div className="flex items-center gap-3 mb-3">
            <ArrowLeftIcon className="w-5 h-5 text-neutral-600 group-hover:text-primary-500 transition-colors duration-150" />
            <span className="text-sm font-mono text-neutral-600 uppercase tracking-wide">
              Previous Post
            </span>
          </div>
          <h3 className="text-lg font-mono font-semibold text-black group-hover:text-primary-500 transition-colors duration-150 line-clamp-2">
            {previousPost.title}
          </h3>
        </a>
      )}
      
      {nextPost && (
        <a
          href={`/blog/${nextPost.slug}`}
          className="group p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 md:text-right"
        >
          <div className="flex items-center gap-3 mb-3 md:justify-end">
            <span className="text-sm font-mono text-neutral-600 uppercase tracking-wide">
              Next Post
            </span>
            <ArrowRightIcon className="w-5 h-5 text-neutral-600 group-hover:text-primary-500 transition-colors duration-150" />
          </div>
          <h3 className="text-lg font-mono font-semibold text-black group-hover:text-primary-500 transition-colors duration-150 line-clamp-2">
            {nextPost.title}
          </h3>
        </a>
      )}
    </div>
  )
}

// Generate static params for popular posts
export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  
  return posts.slice(0, 10).map((post) => ({
    slug: post.slug,
  }))
}

// Icon components
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
export const revalidate = 3600 // 1 hour