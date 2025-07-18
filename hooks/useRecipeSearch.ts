'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Recipe } from '@prisma/client'
import { useDebounce } from './useDebounce'

export interface RecipeFilters {
  category: string
  difficulty: string
  maxTime: number
  servings: number
  tags: string[]
}

export interface RecipeSearchState {
  query: string
  filters: RecipeFilters
  sortBy: string
  isLoading: boolean
  results: Recipe[]
  totalResults: number
  currentPage: number
  totalPages: number
  hasMore: boolean
}

export interface RecipeSearchActions {
  setQuery: (query: string) => void
  setFilters: (filters: Partial<RecipeFilters>) => void
  setSortBy: (sortBy: string) => void
  setPage: (page: number) => void
  clearFilters: () => void
  clearSearch: () => void
  reset: () => void
}

const DEFAULT_FILTERS: RecipeFilters = {
  category: 'all',
  difficulty: 'all',
  maxTime: 0,
  servings: 0,
  tags: [],
}

const ITEMS_PER_PAGE = 12

export function useRecipeSearch(initialRecipes: Recipe[] = []) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from URL params
  const [query, setQueryState] = useState(() => searchParams.get('q') || '')
  const [filters, setFiltersState] = useState<RecipeFilters>(() => ({
    category: searchParams.get('category') || 'all',
    difficulty: searchParams.get('difficulty') || 'all',
    maxTime: parseInt(searchParams.get('maxTime') || '0'),
    servings: parseInt(searchParams.get('servings') || '0'),
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
  }))
  const [sortBy, setSortByState] = useState(() => searchParams.get('sort') || 'newest')
  const [currentPage, setCurrentPageState] = useState(() => parseInt(searchParams.get('page') || '1'))
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Recipe[]>(initialRecipes)
  const [totalResults, setTotalResults] = useState(initialRecipes.length)

  // Debounce the search query
  const debouncedQuery = useDebounce(query, 300)

  // Calculate pagination
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)
  const hasMore = currentPage < totalPages

  // Update URL when search state changes
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.difficulty !== 'all') params.set('difficulty', filters.difficulty)
    if (filters.maxTime > 0) params.set('maxTime', filters.maxTime.toString())
    if (filters.servings > 0) params.set('servings', filters.servings.toString())
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    const queryString = params.toString()
    const newPath = `/recipes${queryString ? `?${queryString}` : ''}`
    
    router.push(newPath, { scroll: false })
  }, [debouncedQuery, filters, sortBy, currentPage, router])

  // Perform search when parameters change
  const performSearch = useCallback(async () => {
    setIsLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (filters.category !== 'all') params.set('category', filters.category)
      if (filters.difficulty !== 'all') params.set('difficulty', filters.difficulty)
      if (filters.maxTime > 0) params.set('maxTime', filters.maxTime.toString())
      if (filters.servings > 0) params.set('servings', filters.servings.toString())
      if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
      if (sortBy !== 'newest') params.set('sort', sortBy)
      params.set('page', currentPage.toString())
      params.set('limit', ITEMS_PER_PAGE.toString())
      
      const response = await fetch(`/api/recipes/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to search recipes')
      }
      
      const data = await response.json()
      
      setResults(data.recipes || [])
      setTotalResults(data.total || 0)
      
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery, filters, sortBy, currentPage])

  // Effect to perform search when dependencies change
  useEffect(() => {
    performSearch()
  }, [performSearch])

  // Effect to update URL when search state changes
  useEffect(() => {
    updateURL()
  }, [updateURL])

  // Actions
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)
    setCurrentPageState(1) // Reset to first page when query changes
  }, [])

  const setFilters = useCallback((newFilters: Partial<RecipeFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPageState(1) // Reset to first page when filters change
  }, [])

  const setSortBy = useCallback((newSortBy: string) => {
    setSortByState(newSortBy)
    setCurrentPageState(1) // Reset to first page when sort changes
  }, [])

  const setPage = useCallback((page: number) => {
    setCurrentPageState(page)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
    setCurrentPageState(1)
  }, [])

  const clearSearch = useCallback(() => {
    setQueryState('')
    setCurrentPageState(1)
  }, [])

  const reset = useCallback(() => {
    setQueryState('')
    setFiltersState(DEFAULT_FILTERS)
    setSortByState('newest')
    setCurrentPageState(1)
  }, [])

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== 'all' ||
      filters.difficulty !== 'all' ||
      filters.maxTime > 0 ||
      filters.servings > 0 ||
      filters.tags.length > 0
    )
  }, [filters])

  const hasSearchQuery = useMemo(() => {
    return debouncedQuery.length > 0
  }, [debouncedQuery])

  const isEmpty = useMemo(() => {
    return results.length === 0 && !isLoading
  }, [results.length, isLoading])

  const searchSummary = useMemo(() => {
    if (isLoading) return 'Searching...'
    if (isEmpty) return 'No recipes found'
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalResults)
    
    return `Showing ${start}-${end} of ${totalResults} recipe${totalResults !== 1 ? 's' : ''}`
  }, [isLoading, isEmpty, currentPage, totalResults])

  const state: RecipeSearchState = {
    query,
    filters,
    sortBy,
    isLoading,
    results,
    totalResults,
    currentPage,
    totalPages,
    hasMore,
  }

  const actions: RecipeSearchActions = {
    setQuery,
    setFilters,
    setSortBy,
    setPage,
    clearFilters,
    clearSearch,
    reset,
  }

  return {
    ...state,
    ...actions,
    hasActiveFilters,
    hasSearchQuery,
    isEmpty,
    searchSummary,
    itemsPerPage: ITEMS_PER_PAGE,
    debouncedQuery,
  }
}

// Hook for managing search suggestions
export function useSearchSuggestions(query: string, maxSuggestions: number = 5) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const debouncedQuery = useDebounce(query, 150)

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      
      try {
        const response = await fetch(`/api/recipes/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=${maxSuggestions}`)
        
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, maxSuggestions])

  return {
    suggestions,
    isLoading,
  }
}

// Hook for managing search history
export function useSearchHistory(maxHistory: number = 10) {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('recipeSearchHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error loading search history:', error)
      }
    }
  }, [])

  const addToHistory = useCallback((query: string) => {
    if (!query || query.length < 2) return

    setHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)]
        .slice(0, maxHistory)
      
      try {
        localStorage.setItem('recipeSearchHistory', JSON.stringify(newHistory))
      } catch (error) {
        console.error('Error saving search history:', error)
      }
      
      return newHistory
    })
  }, [maxHistory])

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== query)
      
      try {
        localStorage.setItem('recipeSearchHistory', JSON.stringify(newHistory))
      } catch (error) {
        console.error('Error saving search history:', error)
      }
      
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    
    try {
      localStorage.removeItem('recipeSearchHistory')
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }, [])

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}

// Hook for managing recent searches
export function useRecentSearches(maxRecent: number = 5) {
  const [recentSearches, setRecentSearches] = useState<Array<{ query: string; filters: RecipeFilters; timestamp: number }>>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentRecipeSearches')
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  const addRecentSearch = useCallback((query: string, filters: RecipeFilters) => {
    const searchKey = `${query}-${JSON.stringify(filters)}`
    
    setRecentSearches(prev => {
      const newSearches = [
        { query, filters, timestamp: Date.now() },
        ...prev.filter(search => `${search.query}-${JSON.stringify(search.filters)}` !== searchKey)
      ].slice(0, maxRecent)
      
      try {
        localStorage.setItem('recentRecipeSearches', JSON.stringify(newSearches))
      } catch (error) {
        console.error('Error saving recent searches:', error)
      }
      
      return newSearches
    })
  }, [maxRecent])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    
    try {
      localStorage.removeItem('recentRecipeSearches')
    } catch (error) {
      console.error('Error clearing recent searches:', error)
    }
  }, [])

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  }
}