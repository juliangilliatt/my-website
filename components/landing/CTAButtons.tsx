'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CTAButtonsProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'hero'
  showSecondaryActions?: boolean
}

export function CTAButtons({
  className,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  showSecondaryActions = true,
}: CTAButtonsProps) {
  const isVertical = orientation === 'vertical'
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const containerClasses = cn(
    'flex gap-4',
    isVertical ? 'flex-col' : 'flex-row flex-wrap',
    className
  )

  const primaryButtonClasses = cn(
    'inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wide transition-all duration-150 border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0',
    'bg-primary-500 text-white hover:bg-primary-600',
    sizeClasses[size]
  )

  const secondaryButtonClasses = cn(
    'inline-flex items-center justify-center font-mono font-medium uppercase tracking-wide transition-all duration-150 border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0',
    'bg-white text-black hover:bg-neutral-50',
    sizeClasses[size]
  )

  if (variant === 'hero') {
    return (
      <div className={containerClasses}>
        <Link href="/recipes" className={cn(primaryButtonClasses, 'group')}>
          <span>Explore Recipes</span>
          <svg
            className="ml-2 w-5 h-5 transition-transform duration-150 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>

        <Link href="/blog" className={cn(secondaryButtonClasses, 'group')}>
          <span>Read Blog</span>
          <svg
            className="ml-2 w-5 h-5 transition-transform duration-150 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>

        {showSecondaryActions && (
          <div className={cn(
            'flex gap-3',
            isVertical ? 'flex-col' : 'flex-row'
          )}>
            <Link
              href="/about"
              className="inline-flex items-center font-mono text-sm text-neutral-600 hover:text-black transition-colors duration-150"
            >
              <span>About Me</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center font-mono text-sm text-neutral-600 hover:text-black transition-colors duration-150"
            >
              <span>Contact</span>
            </Link>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={containerClasses}>
        <Link href="/recipes" className={cn(primaryButtonClasses, 'flex-1')}>
          Recipes
        </Link>
        <Link href="/blog" className={cn(secondaryButtonClasses, 'flex-1')}>
          Blog
        </Link>
      </div>
    )
  }

  // Default variant
  return (
    <div className={containerClasses}>
      <Link href="/recipes" className={cn(primaryButtonClasses, 'group')}>
        <ChefHatIcon className="mr-2 w-5 h-5" />
        <span>Browse Recipes</span>
        <svg
          className="ml-2 w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>

      <Link href="/blog" className={cn(secondaryButtonClasses, 'group')}>
        <PenIcon className="mr-2 w-5 h-5" />
        <span>Read Blog</span>
        <svg
          className="ml-2 w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>

      {showSecondaryActions && (
        <div className={cn(
          'flex gap-3 items-center',
          isVertical ? 'flex-col' : 'flex-row'
        )}>
          <Link
            href="/about"
            className="inline-flex items-center font-mono text-sm text-neutral-600 hover:text-black transition-colors duration-150"
          >
            <UserIcon className="mr-1 w-4 h-4" />
            <span>About</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center font-mono text-sm text-neutral-600 hover:text-black transition-colors duration-150"
          >
            <MailIcon className="mr-1 w-4 h-4" />
            <span>Contact</span>
          </Link>
        </div>
      )}
    </div>
  )
}

// Social CTA buttons
export function SocialCTAButtons({
  className,
  orientation = 'horizontal',
  size = 'md',
}: {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}) {
  const isVertical = orientation === 'vertical'
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const containerClasses = cn(
    'flex gap-3',
    isVertical ? 'flex-col' : 'flex-row',
    className
  )

  const buttonClasses = cn(
    'inline-flex items-center justify-center font-mono transition-all duration-150 border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0',
    'bg-white text-black hover:bg-neutral-50',
    sizeClasses[size]
  )

  return (
    <div className={containerClasses}>
      <a
        href="https://github.com/your-username"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        aria-label="GitHub"
      >
        <GitHubIcon className={iconSizes[size]} />
      </a>
      <a
        href="https://twitter.com/your-username"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        aria-label="Twitter"
      >
        <TwitterIcon className={iconSizes[size]} />
      </a>
      <a
        href="mailto:your-email@example.com"
        className={buttonClasses}
        aria-label="Email"
      >
        <MailIcon className={iconSizes[size]} />
      </a>
    </div>
  )
}

// Quick action buttons
export function QuickActionButtons({
  className,
  orientation = 'horizontal',
}: {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}) {
  const isVertical = orientation === 'vertical'
  const containerClasses = cn(
    'flex gap-2',
    isVertical ? 'flex-col' : 'flex-row',
    className
  )

  const buttonClasses = cn(
    'inline-flex items-center justify-center px-3 py-2 font-mono text-sm transition-all duration-150 border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0',
    'bg-white text-black hover:bg-neutral-50'
  )

  return (
    <div className={containerClasses}>
      <Link href="/search" className={buttonClasses}>
        <SearchIcon className="mr-2 w-4 h-4" />
        <span>Search</span>
      </Link>
      <Link href="/favorites" className={buttonClasses}>
        <HeartIcon className="mr-2 w-4 h-4" />
        <span>Favorites</span>
      </Link>
    </div>
  )
}

// Icon components
function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  )
}

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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  )
}