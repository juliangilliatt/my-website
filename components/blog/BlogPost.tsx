'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/mdx'
import { cn } from '@/lib/utils'

interface BlogPostProps {
  post: {
    slug: string
    title: string
    description: string
    publishedAt: string
    updatedAt?: string
    author?: string
    tags: string[]
    featured?: boolean
    readingTime: number
    content: string
    excerpt?: string
    image?: string
    category?: string
  }
  className?: string
}

export function BlogPost({ post, className }: BlogPostProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <article className={cn('max-w-none', className)}>
      {/* Header */}
      <header className="mb-8">
        {/* Category and metadata */}
        <div className="flex items-center gap-4 mb-4">
          {post.category && (
            <Badge variant="outline" className="font-mono">
              {post.category}
            </Badge>
          )}
          <div className="flex items-center gap-4 text-sm font-mono text-neutral-600">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <span>
                Updated {formatDate(post.updatedAt)}
              </span>
            )}
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-black mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl font-mono text-neutral-700 mb-6 leading-relaxed">
          {post.description}
        </p>

        {/* Author and tags */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {post.author && (
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-neutral-600" />
              <span className="font-mono text-sm text-neutral-600">
                By {post.author}
              </span>
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="font-mono text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured image */}
        {post.image && !imageError && (
          <div className="relative aspect-video bg-neutral-100 border-2 border-black shadow-brutal mb-8 overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className={cn(
                'object-cover transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t-2 border-black">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-neutral-600">
              Published on {formatDate(post.publishedAt)}
            </span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <span className="font-mono text-sm text-neutral-600">
                • Updated {formatDate(post.updatedAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="font-mono">
              <BookmarkIcon className="w-4 h-4 mr-1" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm" className="font-mono">
              <ShareIcon className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </footer>
    </article>
  )
}

// Blog post skeleton
export function BlogPostSkeleton({ className }: { className?: string }) {
  return (
    <article className={cn('max-w-none', className)}>
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-6 bg-neutral-200 animate-pulse" />
          <div className="w-32 h-4 bg-neutral-200 animate-pulse" />
          <div className="w-24 h-4 bg-neutral-200 animate-pulse" />
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="w-full h-8 bg-neutral-200 animate-pulse" />
          <div className="w-4/5 h-8 bg-neutral-200 animate-pulse" />
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="w-full h-6 bg-neutral-200 animate-pulse" />
          <div className="w-full h-6 bg-neutral-200 animate-pulse" />
          <div className="w-3/4 h-6 bg-neutral-200 animate-pulse" />
        </div>
        
        <div className="flex gap-4 mb-8">
          <div className="w-24 h-4 bg-neutral-200 animate-pulse" />
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-neutral-200 animate-pulse" />
            <div className="w-20 h-6 bg-neutral-200 animate-pulse" />
            <div className="w-14 h-6 bg-neutral-200 animate-pulse" />
          </div>
        </div>
        
        <div className="aspect-video bg-neutral-200 animate-pulse mb-8" />
      </header>
      
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="w-full h-4 bg-neutral-200 animate-pulse" />
            <div className="w-full h-4 bg-neutral-200 animate-pulse" />
            <div className="w-3/4 h-4 bg-neutral-200 animate-pulse" />
          </div>
        ))}
      </div>
    </article>
  )
}

// Blog post navigation
export function BlogNavigation({
  post,
  className,
}: {
  post: BlogPostProps['post']
  className?: string
}) {
  return (
    <nav className={cn('flex items-center justify-between mb-8', className)}>
      <div className="flex items-center space-x-2 text-sm font-mono text-neutral-600">
        <a href="/" className="hover:text-primary-500 transition-colors duration-150">
          Home
        </a>
        <span>/</span>
        <a href="/blog" className="hover:text-primary-500 transition-colors duration-150">
          Blog
        </a>
        <span>/</span>
        <span className="text-black font-medium">{post.title}</span>
      </div>
      
      <a
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Blog
      </a>
    </nav>
  )
}

// Blog post meta information
export function BlogPostMeta({
  post,
  className,
}: {
  post: BlogPostProps['post']
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-sm font-mono text-neutral-600', className)}>
      <time dateTime={post.publishedAt}>
        {formatDate(post.publishedAt)}
      </time>
      {post.updatedAt && post.updatedAt !== post.publishedAt && (
        <span>
          Updated {formatDate(post.updatedAt)}
        </span>
      )}
      <div className="flex items-center gap-1">
        <ClockIcon className="w-4 h-4" />
        <span>{post.readingTime} min read</span>
      </div>
      {post.author && (
        <div className="flex items-center gap-1">
          <UserIcon className="w-4 h-4" />
          <span>By {post.author}</span>
        </div>
      )}
    </div>
  )
}

// Blog post actions
export function BlogPostActions({
  post,
  className,
}: {
  post: BlogPostProps['post']
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="outline" size="sm" className="font-mono">
        <BookmarkIcon className="w-4 h-4 mr-1" />
        Bookmark
      </Button>
      <Button variant="outline" size="sm" className="font-mono">
        <ShareIcon className="w-4 h-4 mr-1" />
        Share
      </Button>
      <Button variant="outline" size="sm" className="font-mono">
        <PrintIcon className="w-4 h-4 mr-1" />
        Print
      </Button>
    </div>
  )
}

// Icon components
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
  )
}

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="6,9 6,2 18,2 18,9" />
      <path d="M6,18H4a2,2 0 0,1-2-2v-5a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
      <rect x="6" y="14" width="12" height="8" />
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