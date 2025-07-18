'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CTAButtons, SocialCTAButtons } from './CTAButtons'
import { LastUpdatedBadge } from '@/components/ui/LastUpdatedBadge'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  className?: string
  variant?: 'default' | 'minimal' | 'full'
  showProfileImage?: boolean
  showLastUpdated?: boolean
  showSocial?: boolean
}

export function HeroSection({
  className,
  variant = 'default',
  showProfileImage = true,
  showLastUpdated = true,
  showSocial = true,
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (variant === 'minimal') {
    return (
      <section className={cn(
        'relative py-16 px-4 sm:px-6 lg:px-8',
        className
      )}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-black uppercase tracking-wide mb-6">
            {SITE_CONFIG.name}
          </h1>
          <p className="text-lg sm:text-xl font-mono text-neutral-600 mb-8">
            {SITE_CONFIG.description}
          </p>
          <CTAButtons variant="compact" />
        </div>
      </section>
    )
  }

  if (variant === 'full') {
    return (
      <section className={cn(
        'relative min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8',
        className
      )}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold text-black uppercase tracking-wide">
                    {SITE_CONFIG.name}
                  </h1>
                  {showLastUpdated && (
                    <LastUpdatedBadge variant="minimal" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <p className="text-xl sm:text-2xl font-mono text-neutral-600">
                    {SITE_CONFIG.description}
                  </p>
                  <p className="text-lg font-mono text-neutral-500">
                    Welcome to my brutalist digital space where I share recipes, 
                    development insights, and thoughts on building things that matter.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <CTAButtons variant="hero" size="lg" />
                {showSocial && (
                  <SocialCTAButtons size="md" />
                )}
              </div>
            </div>

            {/* Profile Image */}
            {showProfileImage && (
              <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                  <div className="aspect-square bg-neutral-100 border-2 border-black shadow-brutal overflow-hidden">
                    {!imageError ? (
                      <Image
                        src={SITE_CONFIG.profileImage || '/images/profile-placeholder.jpg'}
                        alt="Profile"
                        width={400}
                        height={400}
                        className={cn(
                          'w-full h-full object-cover transition-opacity duration-300',
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-300 rounded-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-neutral-500" />
                          </div>
                          <p className="font-mono text-sm text-neutral-500">
                            Profile Image
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-500 border-2 border-black shadow-brutal" />
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent-500 border-2 border-black shadow-brutal" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default variant
  return (
    <section className={cn(
      'relative py-20 px-4 sm:px-6 lg:px-8',
      className
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Profile Image */}
          {showProfileImage && (
            <div className="lg:col-span-1">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="aspect-square bg-neutral-100 border-2 border-black shadow-brutal overflow-hidden">
                  {!imageError ? (
                    <Image
                      src={SITE_CONFIG.profileImage || '/images/profile-placeholder.jpg'}
                      alt="Profile"
                      width={300}
                      height={300}
                      className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      )}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-neutral-300 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-neutral-500" />
                        </div>
                        <p className="font-mono text-xs text-neutral-500">
                          Profile
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary-500 border-2 border-black shadow-brutal" />
                <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-accent-500 border-2 border-black shadow-brutal" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'space-y-8',
            showProfileImage ? 'lg:col-span-2' : 'lg:col-span-3'
          )}>
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl sm:text-5xl font-mono font-bold text-black uppercase tracking-wide">
                  {SITE_CONFIG.name}
                </h1>
                {showLastUpdated && (
                  <LastUpdatedBadge />
                )}
              </div>
              
              <div className="space-y-4">
                <p className="text-xl sm:text-2xl font-mono text-neutral-600">
                  {SITE_CONFIG.description}
                </p>
                <p className="text-lg font-mono text-neutral-500 max-w-2xl">
                  I'm a developer and cooking enthusiast sharing my journey through 
                  code and cuisine. This brutalist website is my digital cookbook 
                  and blog where function meets form.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <CTAButtons variant="default" size="md" />
              {showSocial && (
                <SocialCTAButtons />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Feature highlights section
export function FeatureHighlights({ className }: { className?: string }) {
  const features = [
    {
      icon: '🍳',
      title: 'Curated Recipes',
      description: 'Tested recipes with detailed instructions and tips',
    },
    {
      icon: '📝',
      title: 'Development Blog',
      description: 'Insights on web development, tools, and best practices',
    },
    {
      icon: '🎨',
      title: 'Brutalist Design',
      description: 'Bold, functional design that prioritizes usability',
    },
    {
      icon: '⚡',
      title: 'Fast & Accessible',
      description: 'Optimized for speed and accessibility standards',
    },
  ]

  return (
    <section className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-black uppercase tracking-wide text-center mb-12">
          What You'll Find Here
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-mono font-semibold text-black mb-2">
                {feature.title}
              </h3>
              <p className="text-sm font-mono text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats section
export function StatsSection({ className }: { className?: string }) {
  const stats = [
    { label: 'Recipes Shared', value: '50+' },
    { label: 'Blog Posts', value: '25+' },
    { label: 'GitHub Stars', value: '100+' },
    { label: 'Coffee Cups', value: '∞' },
  ]

  return (
    <section className={cn('py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-black mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-mono text-neutral-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Newsletter signup section
export function NewsletterSection({ className }: { className?: string }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    setEmail('')
  }

  if (isSubmitted) {
    return (
      <section className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-green-50 border-2 border-green-500 shadow-brutal">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-2xl font-mono font-bold text-black mb-4">
              Thanks for subscribing!
            </h2>
            <p className="font-mono text-neutral-600">
              You'll receive updates about new recipes and blog posts.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-8 bg-white border-2 border-black shadow-brutal">
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-black mb-4">
            Stay Updated
          </h2>
          <p className="font-mono text-neutral-600 mb-8">
            Get notified when I publish new recipes and blog posts.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 font-mono text-base bg-white border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:outline-none transition-shadow duration-150"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-500 text-white font-mono font-semibold uppercase tracking-wide border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

// User icon component
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}