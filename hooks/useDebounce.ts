'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook that debounces a callback function
 * @param callback - The callback function to debounce
 * @param delay - The debounce delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay, ...deps])

  return debouncedCallback
}

/**
 * Custom hook for debounced search functionality
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds
 * @returns Object with search value, debounced value, and setter
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const debouncedSearchValue = useDebounce(searchValue, delay)

  return {
    searchValue,
    debouncedSearchValue,
    setSearchValue,
    isSearching: searchValue !== debouncedSearchValue,
  }
}

/**
 * Custom hook for debounced API calls
 * @param apiCall - The API call function
 * @param delay - Debounce delay in milliseconds
 * @returns Object with debounced API call function and loading state
 */
export function useDebouncedApiCall<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = 300
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const debouncedCall = useDebouncedCallback(
    async (...args: Parameters<T>) => {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await apiCall(...args)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    delay,
    [apiCall]
  )

  return {
    debouncedCall,
    isLoading,
    error,
  }
}

/**
 * Custom hook for debounced form validation
 * @param value - The value to validate
 * @param validator - The validation function
 * @param delay - Debounce delay in milliseconds
 * @returns Object with validation state
 */
export function useDebouncedValidation<T>(
  value: T,
  validator: (value: T) => string | null,
  delay: number = 300
) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    setIsValidating(true)
    
    const error = validator(debouncedValue)
    setValidationError(error)
    setIsValidating(false)
  }, [debouncedValue, validator])

  return {
    validationError,
    isValidating,
    isValid: validationError === null,
  }
}

/**
 * Custom hook for debounced window resize handling
 * @param callback - Callback function to execute on resize
 * @param delay - Debounce delay in milliseconds
 */
export function useDebouncedResize(
  callback: () => void,
  delay: number = 250
) {
  const debouncedCallback = useDebouncedCallback(callback, delay)

  useEffect(() => {
    window.addEventListener('resize', debouncedCallback)
    return () => window.removeEventListener('resize', debouncedCallback)
  }, [debouncedCallback])
}

/**
 * Custom hook for debounced scroll handling
 * @param callback - Callback function to execute on scroll
 * @param delay - Debounce delay in milliseconds
 */
export function useDebouncedScroll(
  callback: () => void,
  delay: number = 100
) {
  const debouncedCallback = useDebouncedCallback(callback, delay)

  useEffect(() => {
    window.addEventListener('scroll', debouncedCallback)
    return () => window.removeEventListener('scroll', debouncedCallback)
  }, [debouncedCallback])
}

/**
 * Custom hook for debounced localStorage updates
 * @param key - localStorage key
 * @param value - Value to store
 * @param delay - Debounce delay in milliseconds
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  value: T,
  delay: number = 500
) {
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(debouncedValue))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [key, debouncedValue])
}

/**
 * Custom hook for debounced URL parameter updates
 * @param params - URL parameters to update
 * @param delay - Debounce delay in milliseconds
 */
export function useDebouncedUrlParams(
  params: Record<string, string | number | boolean | null | undefined>,
  delay: number = 300
) {
  const debouncedParams = useDebounce(params, delay)

  useEffect(() => {
    const url = new URL(window.location.href)
    
    Object.entries(debouncedParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, String(value))
      }
    })

    window.history.replaceState({}, '', url.toString())
  }, [debouncedParams])
}

export default useDebounce