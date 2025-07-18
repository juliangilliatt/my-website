'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/mdx'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  post: {
    slug: string
    title: string
    description: string
    publishedAt: string
    updatedAt?: string
    author?: string
    tags: string[]
    featured?: boolean
    image?: string
    category?: string
    excerpt?: string
  }
  className?: string
  variant?: 'default' | 'featured' | 'compact'
  showImage?: boolean
  showExcerpt?: boolean
  showTags?: boolean
  showCategory?: boolean
  showReadTime?: boolean
}

export function BlogCard({
  post,
  className,
  variant = 'default',
  showImage = true,
  showExcerpt = true,
  showTags = true,
  showCategory = true,
  showReadTime = true,
}: BlogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const readingTime = Math.ceil(post.description.split(' ').length / 200)

  if (variant === 'featured') {
    return (
      <Card className={cn(
        'group relative overflow-hidden bg-white border-2 border-black shadow-brutal hover:shadow-brutal-lg transform hover:-translate-x-2 hover:-translate-y-2 transition-all duration-200',
        className
      )}>
        <Link href={`/blog/${post.slug}`}>
          <div className="relative">
            {/* Featured badge */}
            {post.featured && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="default" className="bg-red-500 text-white border-black">
                  Featured
                </Badge>
              </div>
            )}
            
            {/* Image */}
            {showImage && post.image && !imageError && (
              <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className={cn(
                    'object-cover transition-all duration-300 group-hover:scale-105',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {/* Category and date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {showCategory && post.category && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {post.category}
                    </Badge>
                  )}
                  {showReadTime && (
                    <div className="flex items-center gap-1 text-sm font-mono text-neutral-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{readingTime} min read</span>
                    </div>
                  )}
                </div>
                <time 
                  dateTime={post.publishedAt}
                  className="text-sm font-mono text-neutral-600"
                >
                  {formatDate(post.publishedAt)}
                </time>
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-mono font-bold text-black mb-3 group-hover:text-primary-500 transition-colors duration-150 line-clamp-2">
                {post.title}
              </h2>
              
              {/* Description */}
              <p className="text-neutral-700 font-mono text-sm mb-4 line-clamp-3">
                {post.excerpt || post.description}
              </p>
              
              {/* Tags */}
              {showTags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="font-mono text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn(
        'group bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150',
        className
      )}>
        <Link href={`/blog/${post.slug}`}>
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Image */}
              {showImage && post.image && !imageError && (
                <div className="relative w-20 h-20 bg-neutral-100 border-2 border-black shadow-brutal-sm flex-shrink-0 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className={cn(
                      'object-cover transition-all duration-300 group-hover:scale-105',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Category and date */}
                <div className="flex items-center gap-2 mb-2">
                  {showCategory && post.category && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {post.category}
                    </Badge>
                  )}
                  <time 
                    dateTime={post.publishedAt}
                    className="text-xs font-mono text-neutral-600"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-mono font-bold text-black mb-1 group-hover:text-primary-500 transition-colors duration-150 line-clamp-2">
                  {post.title}
                </h3>
                
                {/* Description */}
                {showExcerpt && (
                  <p className="text-xs font-mono text-neutral-600 line-clamp-2">
                    {post.excerpt || post.description}
                  </p>
                )}
                
                {/* Reading time */}
                {showReadTime && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-mono text-neutral-600">
                    <ClockIcon className="w-3 h-3" />
                    <span>{readingTime} min read</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn(
      'group bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150',
      className
    )}>
      <Link href={`/blog/${post.slug}`}>
        <div className="relative">
          {/* Featured badge */}
          {post.featured && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="default" className="bg-red-500 text-white border-black">
                Featured
              </Badge>
            </div>
          )}
          
          {/* Image */}
          {showImage && post.image && !imageError && (
            <div className="relative aspect-video bg-neutral-100 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className={cn(
                  'object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {/* Category and date */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {showCategory && post.category && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {post.category}
                  </Badge>
                )}
                {showReadTime && (
                  <div className="flex items-center gap-1 text-sm font-mono text-neutral-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>
                )}
              </div>
              <time 
                dateTime={post.publishedAt}
                className="text-sm font-mono text-neutral-600"
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>
            
            {/* Title */}
            <h2 className="text-lg font-mono font-bold text-black mb-2 group-hover:text-primary-500 transition-colors duration-150 line-clamp-2">
              {post.title}
            </h2>
            
            {/* Description */}
            {showExcerpt && (
              <p className="text-neutral-700 font-mono text-sm mb-4 line-clamp-3">
                {post.excerpt || post.description}
              </p>
            )}
            
            {/* Tags */}
            {showTags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="font-mono text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}

// Featured posts grid
export function FeaturedPosts({
  posts,
  className,
}: {
  posts: BlogCardProps['post'][]
  className?: string
}) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} variant="featured" />
      ))}
    </div>
  )
}

// Recent posts list
export function RecentPosts({
  posts,
  className,
  limit = 5,
}: {
  posts: BlogCardProps['post'][]
  className?: string
  limit?: number
}) {
  const recentPosts = posts.slice(0, limit)

  if (recentPosts.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {recentPosts.map((post) => (
        <BlogCard key={post.slug} post={post} variant="compact" />
      ))}
    </div>
  )
}

// Related posts
export function RelatedPosts({
  posts,
  className,
}: {
  posts: BlogCardProps['post'][]
  className?: string
}) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <h3 className="text-2xl font-mono font-bold text-black mb-6">Related Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}

// Blog card skeleton
export function BlogCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card className="bg-white border-2 border-black shadow-brutal">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-neutral-200 border-2 border-black shadow-brutal-sm animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-16 h-4 bg-neutral-200 animate-pulse" />
                <div className="w-20 h-4 bg-neutral-200 animate-pulse" />
              </div>
              <div className="w-full h-4 bg-neutral-200 animate-pulse" />
              <div className="w-3/4 h-4 bg-neutral-200 animate-pulse" />
              <div className="w-16 h-3 bg-neutral-200 animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-2 border-black shadow-brutal">
      <div className="relative">
        <div className="aspect-video bg-neutral-200 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-neutral-200 animate-pulse" />
              <div className="w-20 h-4 bg-neutral-200 animate-pulse" />
            </div>
            <div className="w-24 h-4 bg-neutral-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-6 bg-neutral-200 animate-pulse" />
            <div className="w-4/5 h-6 bg-neutral-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-neutral-200 animate-pulse" />
            <div className="w-full h-4 bg-neutral-200 animate-pulse" />
            <div className="w-3/4 h-4 bg-neutral-200 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-neutral-200 animate-pulse" />
            <div className="w-20 h-6 bg-neutral-200 animate-pulse" />
            <div className="w-14 h-6 bg-neutral-200 animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  )
}

// Icon component
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}