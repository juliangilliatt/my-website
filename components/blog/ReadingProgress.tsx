'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ReadingProgressProps {
  className?: string
  position?: 'top' | 'bottom'
  variant?: 'bar' | 'circle' | 'minimal'
  showPercentage?: boolean
  color?: 'primary' | 'secondary' | 'accent'
}

export function ReadingProgress({
  className,
  position = 'top',
  variant = 'bar',
  showPercentage = false,
  color = 'primary',
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 100) // Show after scrolling 100px
    }

    const throttledUpdateProgress = throttle(updateProgress, 16) // ~60fps

    window.addEventListener('scroll', throttledUpdateProgress)
    updateProgress() // Initial call

    return () => window.removeEventListener('scroll', throttledUpdateProgress)
  }, [])

  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'primary':
        return 'bg-primary-500'
      case 'secondary':
        return 'bg-secondary-500'
      case 'accent':
        return 'bg-accent-500'
      default:
        return 'bg-primary-500'
    }
  }

  if (!isVisible) {
    return null
  }

  if (variant === 'circle') {
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-neutral-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={cn('transition-all duration-150', getColorClasses(color))}
              strokeLinecap="round"
            />
          </svg>
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-black">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <div className="bg-white border-2 border-black shadow-brutal px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-neutral-200 border border-black">
              <div 
                className={cn('h-full transition-all duration-150', getColorClasses(color))}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-black min-w-[2rem]">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Bar variant (default)
  return (
    <div className={cn(
      'fixed left-0 right-0 z-50 h-1',
      position === 'top' ? 'top-0' : 'bottom-0',
      className
    )}>
      <div className="w-full h-full bg-neutral-200 border-b-2 border-black">
        <div 
          className={cn('h-full transition-all duration-150', getColorClasses(color))}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="absolute right-4 top-1 bg-white border-2 border-black shadow-brutal px-2 py-1">
          <span className="text-xs font-mono font-bold text-black">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Reading progress with estimated time
export function ReadingProgressWithTime({
  className,
  estimatedReadTime,
}: {
  className?: string
  estimatedReadTime: number
}) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 100)
    }

    const throttledUpdateProgress = throttle(updateProgress, 16)

    window.addEventListener('scroll', throttledUpdateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', throttledUpdateProgress)
  }, [])

  if (!isVisible) {
    return null
  }

  const remainingTime = Math.max(0, estimatedReadTime * (1 - progress / 100))

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <div className="bg-white border-2 border-black shadow-brutal p-4 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono font-semibold text-black">Reading Progress</span>
          <span className="text-xs font-mono text-neutral-600">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full h-2 bg-neutral-200 border border-black mb-2">
          <div 
            className="h-full bg-primary-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs font-mono text-neutral-600">
          <span>
            {remainingTime < 1 ? 'Almost done!' : `${Math.ceil(remainingTime)} min left`}
          </span>
          <span>{estimatedReadTime} min read</span>
        </div>
      </div>
    </div>
  )
}

// Sticky reading progress
export function StickyReadingProgress({
  className,
  title,
  showTitle = true,
}: {
  className?: string
  title?: string
  showTitle?: boolean
}) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 200)
    }

    const throttledUpdateProgress = throttle(updateProgress, 16)

    window.addEventListener('scroll', throttledUpdateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', throttledUpdateProgress)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black shadow-brutal', className)}>
      {showTitle && title && (
        <div className="px-4 py-2">
          <h2 className="text-sm font-mono font-semibold text-black truncate">
            {title}
          </h2>
        </div>
      )}
      <div className="h-1 bg-neutral-200">
        <div 
          className="h-full bg-primary-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Reading progress with sections
export function SectionedReadingProgress({
  className,
  sections,
}: {
  className?: string
  sections: Array<{ id: string; title: string }>
}) {
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 100)
    }

    const throttledUpdateProgress = throttle(updateProgress, 16)

    window.addEventListener('scroll', throttledUpdateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', throttledUpdateProgress)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0,
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [sections])

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black shadow-brutal', className)}>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold text-black">
              {sections.find(s => s.id === activeSection)?.title || 'Reading...'}
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-600">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <div className="h-1 bg-neutral-200">
        <div 
          className="h-full bg-primary-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Back to top button with progress
export function BackToTop({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 300)
    }

    const throttledUpdateProgress = throttle(updateProgress, 16)

    window.addEventListener('scroll', throttledUpdateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', throttledUpdateProgress)
  }, [])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-12 h-12 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center justify-center',
        className
      )}
    >
      <div className="relative">
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="text-primary-500 transition-all duration-150"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <ArrowUpIcon className="w-3 h-3 text-black" />
        </div>
      </div>
    </button>
  )
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

// Icon component
function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}