'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  post: {
    slug: string
    title: string
    description: string
    image?: string
  }
  className?: string
  variant?: 'default' | 'compact' | 'floating'
  showLabels?: boolean
  platforms?: ('twitter' | 'facebook' | 'linkedin' | 'reddit' | 'email' | 'copy')[]
}

export function ShareButtons({
  post,
  className,
  variant = 'default',
  showLabels = true,
  platforms = ['twitter', 'facebook', 'linkedin', 'reddit', 'email', 'copy'],
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : ''
  const shareText = `Check out this post: ${post.title}`

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(postUrl)
    const encodedTitle = encodeURIComponent(post.title)
    const encodedText = encodeURIComponent(shareText)
    const encodedDescription = encodeURIComponent(post.description)

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    }

    if (platform === 'copy') {
      handleCopyLink()
    } else if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: postUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <TwitterIcon className="w-4 h-4" />
      case 'facebook':
        return <FacebookIcon className="w-4 h-4" />
      case 'linkedin':
        return <LinkedInIcon className="w-4 h-4" />
      case 'reddit':
        return <RedditIcon className="w-4 h-4" />
      case 'email':
        return <EmailIcon className="w-4 h-4" />
      case 'copy':
        return copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />
      default:
        return <ShareIcon className="w-4 h-4" />
    }
  }

  const getLabel = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'Twitter'
      case 'facebook':
        return 'Facebook'
      case 'linkedin':
        return 'LinkedIn'
      case 'reddit':
        return 'Reddit'
      case 'email':
        return 'Email'
      case 'copy':
        return copied ? 'Copied!' : 'Copy Link'
      default:
        return 'Share'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600'
      case 'facebook':
        return 'hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700'
      case 'linkedin':
        return 'hover:bg-blue-50 hover:border-blue-700 hover:text-blue-800'
      case 'reddit':
        return 'hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600'
      case 'email':
        return 'hover:bg-gray-50 hover:border-gray-500 hover:text-gray-600'
      case 'copy':
        return copied ? 'bg-green-50 border-green-500 text-green-600' : 'hover:bg-gray-50 hover:border-gray-500 hover:text-gray-600'
      default:
        return 'hover:bg-gray-50 hover:border-gray-500 hover:text-gray-600'
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Native share button for mobile */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="p-2"
          >
            <ShareIcon className="w-4 h-4" />
          </Button>
        )}
        
        {platforms.map((platform) => (
          <Button
            key={platform}
            variant="outline"
            size="sm"
            onClick={() => handleShare(platform)}
            className={cn('p-2', getPlatformColor(platform))}
          >
            {getIcon(platform)}
          </Button>
        ))}
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <div className={cn('fixed left-6 top-1/2 transform -translate-y-1/2 z-50', className)}>
        <div className="flex flex-col gap-2">
          {platforms.map((platform) => (
            <Button
              key={platform}
              variant="outline"
              size="sm"
              onClick={() => handleShare(platform)}
              className={cn('w-10 h-10 p-0 shadow-brutal hover:shadow-brutal-sm', getPlatformColor(platform))}
            >
              {getIcon(platform)}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-mono font-bold text-black">Share this post</h3>
      
      <div className="flex flex-wrap gap-3">
        {/* Native share button for mobile */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="flex items-center gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            {showLabels && <span>Share</span>}
          </Button>
        )}
        
        {platforms.map((platform) => (
          <Button
            key={platform}
            variant="outline"
            onClick={() => handleShare(platform)}
            className={cn('flex items-center gap-2', getPlatformColor(platform))}
          >
            {getIcon(platform)}
            {showLabels && <span>{getLabel(platform)}</span>}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Share modal
export function ShareModal({
  post,
  isOpen,
  onClose,
  className,
}: {
  post: ShareButtonsProps['post']
  isOpen: boolean
  onClose: () => void
  className?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={cn('bg-white border-2 border-black shadow-brutal max-w-md w-full', className)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-mono font-bold text-black">Share this post</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mb-4">
            <h4 className="font-mono font-semibold text-black mb-2">{post.title}</h4>
            <p className="text-sm font-mono text-neutral-600">{post.description}</p>
          </div>
          
          <ShareButtons
            post={post}
            variant="default"
            showLabels={true}
            platforms={['twitter', 'facebook', 'linkedin', 'reddit', 'email', 'copy']}
          />
        </div>
      </div>
    </div>
  )
}

// Quick share buttons
export function QuickShareButtons({
  post,
  className,
}: {
  post: ShareButtonsProps['post']
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        <ShareIcon className="w-4 h-4" />
        Share
      </Button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-1 bg-white border-2 border-black shadow-brutal z-50 p-4 min-w-[200px]">
          <ShareButtons
            post={post}
            variant="compact"
            showLabels={false}
            platforms={['twitter', 'facebook', 'copy']}
          />
        </div>
      )}
    </div>
  )
}

// Social media follow buttons
export function SocialMediaLinks({
  className,
  links = {},
}: {
  className?: string
  links?: {
    twitter?: string
    github?: string
    linkedin?: string
    email?: string
  }
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {links.twitter && (
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-neutral-600 hover:text-blue-500 transition-colors duration-150"
        >
          <TwitterIcon className="w-5 h-5" />
        </a>
      )}
      {links.github && (
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-neutral-600 hover:text-black transition-colors duration-150"
        >
          <GitHubIcon className="w-5 h-5" />
        </a>
      )}
      {links.linkedin && (
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-neutral-600 hover:text-blue-700 transition-colors duration-150"
        >
          <LinkedInIcon className="w-5 h-5" />
        </a>
      )}
      {links.email && (
        <a
          href={`mailto:${links.email}`}
          className="p-2 text-neutral-600 hover:text-gray-600 transition-colors duration-150"
        >
          <EmailIcon className="w-5 h-5" />
        </a>
      )}
    </div>
  )
}

// Icon components
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}