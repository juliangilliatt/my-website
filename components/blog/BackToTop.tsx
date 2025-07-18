'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface BackToTopProps {
  className?: string
  variant?: 'default' | 'minimal' | 'progress'
  threshold?: number
  smooth?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  showProgress?: boolean
}

export function BackToTop({
  className,
  variant = 'default',
  threshold = 300,
  smooth = true,
  position = 'bottom-right',
  showProgress = false,
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100

      setIsVisible(scrollTop > threshold)
      setScrollProgress(Math.min(100, Math.max(0, progress)))
    }

    const throttledHandleScroll = throttle(handleScroll, 16)
    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [threshold])

  const handleClick = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      window.scrollTo(0, 0)
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6'
      case 'bottom-center':
        return 'bottom-6 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
      default:
        return 'bottom-6 right-6'
    }
  }

  if (!isVisible) return null

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'fixed z-50 w-10 h-10 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center justify-center',
          getPositionClasses(),
          className
        )}
      >
        <ArrowUpIcon className="w-4 h-4 text-black" />
      </button>
    )
  }

  if (variant === 'progress') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'fixed z-50 w-12 h-12 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center justify-center',
          getPositionClasses(),
          className
        )}
      >
        <div className="relative w-8 h-8">
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
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - scrollProgress / 100)}`}
              className="text-primary-500 transition-all duration-150"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowUpIcon className="w-4 h-4 text-black" />
          </div>
        </div>
      </button>
    )
  }

  // Default variant
  return (
    <Button
      onClick={handleClick}
      className={cn(
        'fixed z-50 flex items-center gap-2 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150',
        getPositionClasses(),
        className
      )}
    >
      <ArrowUpIcon className="w-4 h-4" />
      <span className="font-mono text-sm">Back to Top</span>
      {showProgress && (
        <div className="ml-2 w-8 h-1 bg-neutral-200 border border-black">
          <div
            className="h-full bg-primary-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}
    </Button>
  )
}

// Smooth scroll to top with animation
export function AnimatedBackToTop({
  className,
  threshold = 300,
}: {
  className?: string
  threshold?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    const throttledHandleScroll = throttle(handleScroll, 16)
    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [threshold])

  const handleClick = () => {
    setIsAnimating(true)
    
    const scrollToTop = () => {
      const scrollTop = window.scrollY
      if (scrollTop > 0) {
        window.scrollTo(0, scrollTop - scrollTop / 8)
        requestAnimationFrame(scrollToTop)
      } else {
        setIsAnimating(false)
      }
    }
    
    requestAnimationFrame(scrollToTop)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleClick}
      disabled={isAnimating}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-12 h-12 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center justify-center',
        isAnimating && 'animate-bounce',
        className
      )}
    >
      <ArrowUpIcon className={cn('w-5 h-5 text-black transition-transform duration-150', isAnimating && 'scale-110')} />
    </button>
  )
}

// Back to top with scroll indicator
export function ScrollIndicatorBackToTop({
  className,
  threshold = 300,
}: {
  className?: string
  threshold?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100

      setIsVisible(scrollTop > threshold)
      setScrollProgress(Math.min(100, Math.max(0, progress)))
    }

    const throttledHandleScroll = throttle(handleScroll, 16)
    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [threshold])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2', className)}>
      {/* Scroll progress indicator */}
      <div className="w-2 h-20 bg-white border-2 border-black shadow-brutal">
        <div
          className="w-full bg-primary-500 transition-all duration-150"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Back to top button */}
      <button
        onClick={handleClick}
        className="w-12 h-12 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center justify-center"
      >
        <ArrowUpIcon className="w-5 h-5 text-black" />
      </button>
    </div>
  )
}

// Floating action button style
export function FloatingBackToTop({
  className,
  threshold = 300,
}: {
  className?: string
  threshold?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    const throttledHandleScroll = throttle(handleScroll, 16)
    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [threshold])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 text-white border-2 border-black shadow-brutal hover:shadow-brutal-lg transform transition-all duration-300 flex items-center justify-center rounded-full',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0',
        isHovered && 'scale-110',
        className
      )}
    >
      <ArrowUpIcon className="w-6 h-6" />
    </button>
  )
}

// Compact back to top with keyboard shortcut
export function CompactBackToTop({
  className,
  threshold = 300,
  showKeyboardShortcut = true,
}: {
  className?: string
  threshold?: number
  showKeyboardShortcut?: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Home') {
        e.preventDefault()
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    }

    const throttledHandleScroll = throttle(handleScroll, 16)
    window.addEventListener('scroll', throttledHandleScroll)
    if (showKeyboardShortcut) {
      window.addEventListener('keydown', handleKeyDown)
    }
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (showKeyboardShortcut) {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [threshold, showKeyboardShortcut])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 relative', className)}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-10 h-10 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center justify-center"
      >
        <ArrowUpIcon className="w-4 h-4 text-black" />
      </button>
      
      {showTooltip && showKeyboardShortcut && (
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs font-mono whitespace-nowrap">
          Back to top (Ctrl+Home)
        </div>
      )}
    </div>
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