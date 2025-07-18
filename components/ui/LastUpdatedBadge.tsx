'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LastCommitData {
  sha: string
  message: string
  author: {
    name: string
    login: string | null
    avatar_url: string | null
  }
  date: string
  formattedDate: string
  url: string
  error?: string
  ratelimit?: {
    limit: number
    remaining: number
    reset: number
    resetTime: string
  }
}

interface LastUpdatedBadgeProps {
  className?: string
  showMessage?: boolean
  showAuthor?: boolean
  showIcon?: boolean
  variant?: 'default' | 'minimal' | 'detailed'
  owner?: string
  repo?: string
  branch?: string
}

export function LastUpdatedBadge({
  className,
  showMessage = false,
  showAuthor = false,
  showIcon = true,
  variant = 'default',
  owner,
  repo,
  branch,
}: LastUpdatedBadgeProps) {
  const [data, setData] = useState<LastCommitData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLastCommit = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (owner) params.append('owner', owner)
        if (repo) params.append('repo', repo)
        if (branch) params.append('branch', branch)
        
        const url = `/api/github/last-commit${params.toString() ? `?${params.toString()}` : ''}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch commit data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLastCommit()
  }, [owner, repo, branch])

  if (isLoading) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border-2 border-black shadow-brutal-sm font-mono text-sm',
        className
      )}>
        {showIcon && (
          <div className="animate-spin">
            <ClockIcon className="w-4 h-4" />
          </div>
        )}
        <span className="text-neutral-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 border-2 border-red-500 shadow-brutal-sm font-mono text-sm text-red-800',
        className
      )}>
        {showIcon && <ErrorIcon className="w-4 h-4" />}
        <span>Failed to load</span>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const handleClick = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-2 px-2 py-1 bg-white border-2 border-black shadow-brutal-sm font-mono text-xs hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150',
          className
        )}
        title={`Last updated: ${data.formattedDate}`}
      >
        {showIcon && <ClockIcon className="w-3 h-3" />}
        <span className="text-neutral-600">{data.formattedDate}</span>
      </button>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn(
        'inline-flex flex-col gap-2 p-4 bg-white border-2 border-black shadow-brutal font-mono text-sm',
        className
      )}>
        <div className="flex items-center gap-2">
          {showIcon && <ClockIcon className="w-4 h-4" />}
          <span className="font-semibold text-black">Last Updated</span>
        </div>
        
        <div className="text-neutral-600 text-xs">
          <div>{data.formattedDate}</div>
          {showAuthor && data.author.name && (
            <div className="mt-1">by {data.author.name}</div>
          )}
          {showMessage && (
            <div className="mt-1 text-neutral-500">{data.message}</div>
          )}
        </div>
        
        {data.url && (
          <button
            onClick={handleClick}
            className="mt-2 text-xs text-primary-500 hover:text-primary-600 transition-colors duration-150 text-left"
          >
            View commit →
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black shadow-brutal-sm font-mono text-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150',
        className
      )}
      title={showMessage ? data.message : `Last updated: ${data.formattedDate}`}
    >
      {showIcon && <ClockIcon className="w-4 h-4" />}
      <span className="text-neutral-600">Updated {data.formattedDate}</span>
      {showAuthor && data.author.name && (
        <span className="text-neutral-500">by {data.author.name}</span>
      )}
    </button>
  )
}

// Clock icon component
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

// Error icon component
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

// Loading skeleton component
export function LastUpdatedBadgeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border-2 border-black shadow-brutal-sm font-mono text-sm',
      className
    )}>
      <div className="w-4 h-4 bg-neutral-300 animate-pulse" />
      <div className="w-20 h-4 bg-neutral-300 animate-pulse" />
    </div>
  )
}

// Server-side version for SSR/SSG
export async function ServerLastUpdatedBadge({
  className,
  showMessage = false,
  showAuthor = false,
  showIcon = true,
  variant = 'default',
  owner,
  repo,
  branch,
}: LastUpdatedBadgeProps) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    if (owner) params.append('owner', owner)
    if (repo) params.append('repo', repo)
    if (branch) params.append('branch', branch)
    
    const url = `${baseUrl}/api/github/last-commit${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data: LastCommitData = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }

    if (variant === 'minimal') {
      return (
        <div className={cn(
          'inline-flex items-center gap-2 px-2 py-1 bg-white border-2 border-black shadow-brutal-sm font-mono text-xs',
          className
        )}>
          {showIcon && <ClockIcon className="w-3 h-3" />}
          <span className="text-neutral-600">{data.formattedDate}</span>
        </div>
      )
    }

    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black shadow-brutal-sm font-mono text-sm',
        className
      )}>
        {showIcon && <ClockIcon className="w-4 h-4" />}
        <span className="text-neutral-600">Updated {data.formattedDate}</span>
        {showAuthor && data.author.name && (
          <span className="text-neutral-500">by {data.author.name}</span>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border-2 border-black shadow-brutal-sm font-mono text-sm text-neutral-500',
        className
      )}>
        {showIcon && <ClockIcon className="w-4 h-4" />}
        <span>Recently updated</span>
      </div>
    )
  }
}