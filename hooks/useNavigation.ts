'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface NavigationContextType {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  currentSection: string
  setCurrentSection: (section: string) => void
  isDesktopSidebarCollapsed: boolean
  setIsDesktopSidebarCollapsed: (collapsed: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState('')
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Persist desktop sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('desktop-sidebar-collapsed')
    if (saved) {
      setIsDesktopSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('desktop-sidebar-collapsed', JSON.stringify(isDesktopSidebarCollapsed))
  }, [isDesktopSidebarCollapsed])

  const value: NavigationContextType = {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentSection,
    setCurrentSection,
    isDesktopSidebarCollapsed,
    setIsDesktopSidebarCollapsed,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

// Hook for tracking active section (for smooth scrolling navigation)
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState('')

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
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    )

    // Observe all sections with IDs
    const sections = document.querySelectorAll('[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return activeSection
}

// Hook for handling breadcrumb navigation
export function useBreadcrumbs() {
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; href?: string }>>([])

  const addBreadcrumb = (label: string, href?: string) => {
    setBreadcrumbs((prev) => [...prev, { label, href }])
  }

  const removeBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index))
  }

  const clearBreadcrumbs = () => {
    setBreadcrumbs([])
  }

  const setBreadcrumbsFromPath = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    const newBreadcrumbs = [{ label: 'Home', href: '/' }]
    
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      newBreadcrumbs.push({ label, href })
    })
    
    setBreadcrumbs(newBreadcrumbs)
  }

  return {
    breadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
    setBreadcrumbsFromPath,
  }
}

// Hook for managing navigation state across page transitions
export function useNavigationState() {
  const { currentSection, setCurrentSection } = useNavigation()
  const [isLoading, setIsLoading] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])

  const navigateToSection = (sectionId: string) => {
    setCurrentSection(sectionId)
    setNavigationHistory((prev) => [...prev, sectionId])
  }

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory]
      newHistory.pop()
      const previousSection = newHistory[newHistory.length - 1]
      setCurrentSection(previousSection)
      setNavigationHistory(newHistory)
    }
  }

  const clearHistory = () => {
    setNavigationHistory([])
  }

  return {
    currentSection,
    isLoading,
    setIsLoading,
    navigationHistory,
    navigateToSection,
    goBack,
    clearHistory,
  }
}