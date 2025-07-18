'use client'

import { useState, useEffect } from 'react'
import { extractTableOfContents } from '@/lib/mdx'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  post: {
    content: string
    title: string
  }
  className?: string
  variant?: 'default' | 'floating' | 'sidebar'
  showToggle?: boolean
}

interface TocItem {
  id: string
  title: string
  level: number
}

export function TableOfContents({
  post,
  className,
  variant = 'default',
  showToggle = true,
}: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Extract TOC from content
    const tocItems = extractTableOfContents(post.content)
    setToc(tocItems)
  }, [post.content])

  useEffect(() => {
    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0,
      }
    )

    // Observe all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading)
      }
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Hide TOC when scrolling past content
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const isNearBottom = scrollPosition >= documentHeight - 100

      setIsVisible(!isNearBottom)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      })
    }
    
    if (variant === 'floating') {
      setIsOpen(false)
    }
  }

  if (toc.length === 0) {
    return null
  }

  if (variant === 'floating') {
    return (
      <div className={cn('fixed bottom-6 left-6 z-50', !isVisible && 'hidden', className)}>
        <div className="relative">
          {/* Toggle button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150 font-mono font-medium text-sm"
          >
            <MenuIcon className="w-4 h-4" />
            {isOpen ? 'Hide TOC' : 'Table of Contents'}
          </button>

          {/* TOC content */}
          {isOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-80 max-h-96 overflow-y-auto bg-white border-2 border-black shadow-brutal">
              <div className="p-4">
                <h3 className="text-lg font-mono font-bold text-black mb-4">Contents</h3>
                <nav>
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleItemClick(item.id)}
                          className={cn(
                            'block w-full text-left text-sm font-mono hover:text-primary-500 transition-colors duration-150',
                            item.level === 1 && 'font-semibold',
                            item.level === 2 && 'ml-3',
                            item.level === 3 && 'ml-6',
                            item.level === 4 && 'ml-9',
                            item.level === 5 && 'ml-12',
                            item.level === 6 && 'ml-15',
                            activeId === item.id ? 'text-primary-500' : 'text-neutral-700'
                          )}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('bg-white border-2 border-black shadow-brutal', className)}>
        <div className="p-4">
          <h3 className="text-lg font-mono font-bold text-black mb-4">Contents</h3>
          <nav>
            <ul className="space-y-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      'block w-full text-left text-sm font-mono hover:text-primary-500 transition-colors duration-150',
                      item.level === 1 && 'font-semibold',
                      item.level === 2 && 'ml-3',
                      item.level === 3 && 'ml-6',
                      item.level === 4 && 'ml-9',
                      item.level === 5 && 'ml-12',
                      item.level === 6 && 'ml-15',
                      activeId === item.id ? 'text-primary-500' : 'text-neutral-700'
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('bg-white border-2 border-black shadow-brutal', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono font-bold text-black">Table of Contents</h3>
          {showToggle && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
            >
              {isOpen ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
        
        {(!showToggle || isOpen) && (
          <nav>
            <ul className="space-y-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      'block w-full text-left text-sm font-mono hover:text-primary-500 transition-colors duration-150',
                      item.level === 1 && 'font-semibold',
                      item.level === 2 && 'ml-4',
                      item.level === 3 && 'ml-8',
                      item.level === 4 && 'ml-12',
                      item.level === 5 && 'ml-16',
                      item.level === 6 && 'ml-20',
                      activeId === item.id ? 'text-primary-500' : 'text-neutral-700'
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}

// Compact TOC for mobile
export function CompactTableOfContents({
  post,
  className,
}: {
  post: { content: string; title: string }
  className?: string
}) {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const tocItems = extractTableOfContents(post.content)
    setToc(tocItems)
  }, [post.content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0,
      }
    )

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading)
      }
    })

    return () => observer.disconnect()
  }, [])

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      })
    }
    
    setIsOpen(false)
  }

  if (toc.length === 0) {
    return null
  }

  return (
    <div className={cn('bg-neutral-50 border-2 border-black shadow-brutal', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 font-mono font-medium text-left hover:bg-neutral-100 transition-colors duration-150"
      >
        <span className="flex items-center gap-2">
          <ListIcon className="w-4 h-4" />
          Table of Contents
        </span>
        <ChevronDownIcon className={cn('w-4 h-4 transform transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>
      
      {isOpen && (
        <div className="border-t-2 border-black p-4 bg-white">
          <nav>
            <ul className="space-y-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      'block w-full text-left text-sm font-mono hover:text-primary-500 transition-colors duration-150',
                      item.level === 1 && 'font-semibold',
                      item.level === 2 && 'ml-4',
                      item.level === 3 && 'ml-8',
                      item.level >= 4 && 'ml-12',
                      activeId === item.id ? 'text-primary-500' : 'text-neutral-700'
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

// Progress-based TOC
export function ProgressTableOfContents({
  post,
  className,
}: {
  post: { content: string; title: string }
  className?: string
}) {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const tocItems = extractTableOfContents(post.content)
    setToc(tocItems)
  }, [post.content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            setProgress(prev => ({
              ...prev,
              [entry.target.id]: true,
            }))
          }
        })
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0,
      }
    )

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading)
      }
    })

    return () => observer.disconnect()
  }, [])

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      })
    }
  }

  if (toc.length === 0) {
    return null
  }

  const completedItems = Object.values(progress).filter(Boolean).length
  const totalItems = toc.length
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className={cn('bg-white border-2 border-black shadow-brutal', className)}>
      <div className="p-4 border-b-2 border-black">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-mono font-bold text-black">Reading Progress</h3>
          <span className="text-sm font-mono text-neutral-600">
            {completedItems}/{totalItems}
          </span>
        </div>
        <div className="w-full bg-neutral-200 border-2 border-black h-2">
          <div 
            className="bg-primary-500 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="p-4">
        <nav>
          <ul className="space-y-2">
            {toc.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left text-sm font-mono hover:text-primary-500 transition-colors duration-150',
                    item.level === 1 && 'font-semibold',
                    item.level === 2 && 'ml-4',
                    item.level === 3 && 'ml-8',
                    item.level >= 4 && 'ml-12',
                    activeId === item.id ? 'text-primary-500' : 'text-neutral-700'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full border border-black',
                    progress[item.id] ? 'bg-primary-500' : 'bg-white'
                  )} />
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

// Icon components
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}