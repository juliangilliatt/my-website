'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Recipe } from '@prisma/client'

export interface RecipeInteractionState {
  // Ingredients checklist
  checkedIngredients: string[]
  ingredientsProgress: number
  
  // Instructions progress
  completedSteps: number[]
  instructionsProgress: number
  
  // Serving scaling
  servingSize: number
  scalingFactor: number
  
  // Timer functionality
  activeTimers: Record<string, { startTime: number; duration: number }>
  
  // Notes
  personalNotes: string
  
  // Favorites
  isFavorited: boolean
  
  // Print settings
  printSettings: {
    includeNotes: boolean
    includeNutrition: boolean
    includeServings: boolean
  }
}

export interface RecipeInteractionActions {
  // Ingredients
  toggleIngredient: (ingredient: string) => void
  checkAllIngredients: () => void
  uncheckAllIngredients: () => void
  
  // Instructions
  toggleStep: (stepIndex: number) => void
  markStepComplete: (stepIndex: number) => void
  markStepIncomplete: (stepIndex: number) => void
  resetProgress: () => void
  
  // Serving scaling
  setServingSize: (size: number) => void
  scaleUp: () => void
  scaleDown: () => void
  resetServingSize: () => void
  
  // Timers
  startTimer: (id: string, duration: number) => void
  stopTimer: (id: string) => void
  clearAllTimers: () => void
  
  // Notes
  updateNotes: (notes: string) => void
  
  // Favorites
  toggleFavorite: () => void
  
  // Print settings
  updatePrintSettings: (settings: Partial<RecipeInteractionState['printSettings']>) => void
  
  // Persistence
  saveState: () => void
  loadState: () => void
  clearState: () => void
}

export function useRecipeInteractions(recipe: Recipe): RecipeInteractionState & RecipeInteractionActions {
  const storageKey = `recipe-interactions-${recipe.id}`
  
  const [state, setState] = useState<RecipeInteractionState>(() => ({
    checkedIngredients: [],
    ingredientsProgress: 0,
    completedSteps: [],
    instructionsProgress: 0,
    servingSize: recipe.servings,
    scalingFactor: 1,
    activeTimers: {},
    personalNotes: '',
    isFavorited: false,
    printSettings: {
      includeNotes: true,
      includeNutrition: true,
      includeServings: true,
    },
  }))

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsedState = JSON.parse(saved)
          setState(prevState => ({
            ...prevState,
            ...parsedState,
            activeTimers: {}, // Don't restore timers
          }))
        }
      } catch (error) {
        console.error('Error loading recipe interactions:', error)
      }
    }
    
    loadState()
  }, [storageKey])

  // Save state to localStorage
  const saveState = useCallback(() => {
    try {
      const stateToSave = {
        ...state,
        activeTimers: {}, // Don't save timers
      }
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error saving recipe interactions:', error)
    }
  }, [state, storageKey])

  // Auto-save state changes
  useEffect(() => {
    const timeoutId = setTimeout(saveState, 1000)
    return () => clearTimeout(timeoutId)
  }, [saveState])

  // Calculate progress
  const ingredientsProgress = useMemo(() => {
    if (recipe.ingredients.length === 0) return 0
    return (state.checkedIngredients.length / recipe.ingredients.length) * 100
  }, [state.checkedIngredients.length, recipe.ingredients.length])

  const instructionsProgress = useMemo(() => {
    if (recipe.instructions.length === 0) return 0
    return (state.completedSteps.length / recipe.instructions.length) * 100
  }, [state.completedSteps.length, recipe.instructions.length])

  const scalingFactor = useMemo(() => {
    return state.servingSize / recipe.servings
  }, [state.servingSize, recipe.servings])

  // Update calculated values
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      ingredientsProgress,
      instructionsProgress,
      scalingFactor,
    }))
  }, [ingredientsProgress, instructionsProgress, scalingFactor])

  // Ingredient actions
  const toggleIngredient = useCallback((ingredient: string) => {
    setState(prevState => ({
      ...prevState,
      checkedIngredients: prevState.checkedIngredients.includes(ingredient)
        ? prevState.checkedIngredients.filter(i => i !== ingredient)
        : [...prevState.checkedIngredients, ingredient],
    }))
  }, [])

  const checkAllIngredients = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      checkedIngredients: [...recipe.ingredients],
    }))
  }, [recipe.ingredients])

  const uncheckAllIngredients = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      checkedIngredients: [],
    }))
  }, [])

  // Instruction actions
  const toggleStep = useCallback((stepIndex: number) => {
    setState(prevState => ({
      ...prevState,
      completedSteps: prevState.completedSteps.includes(stepIndex)
        ? prevState.completedSteps.filter(i => i !== stepIndex)
        : [...prevState.completedSteps, stepIndex],
    }))
  }, [])

  const markStepComplete = useCallback((stepIndex: number) => {
    setState(prevState => ({
      ...prevState,
      completedSteps: prevState.completedSteps.includes(stepIndex)
        ? prevState.completedSteps
        : [...prevState.completedSteps, stepIndex],
    }))
  }, [])

  const markStepIncomplete = useCallback((stepIndex: number) => {
    setState(prevState => ({
      ...prevState,
      completedSteps: prevState.completedSteps.filter(i => i !== stepIndex),
    }))
  }, [])

  const resetProgress = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      checkedIngredients: [],
      completedSteps: [],
    }))
  }, [])

  // Serving scaling actions
  const setServingSize = useCallback((size: number) => {
    setState(prevState => ({
      ...prevState,
      servingSize: Math.max(1, size),
    }))
  }, [])

  const scaleUp = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      servingSize: prevState.servingSize + 1,
    }))
  }, [])

  const scaleDown = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      servingSize: Math.max(1, prevState.servingSize - 1),
    }))
  }, [])

  const resetServingSize = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      servingSize: recipe.servings,
    }))
  }, [recipe.servings])

  // Timer actions
  const startTimer = useCallback((id: string, duration: number) => {
    setState(prevState => ({
      ...prevState,
      activeTimers: {
        ...prevState.activeTimers,
        [id]: {
          startTime: Date.now(),
          duration,
        },
      },
    }))
  }, [])

  const stopTimer = useCallback((id: string) => {
    setState(prevState => ({
      ...prevState,
      activeTimers: Object.fromEntries(
        Object.entries(prevState.activeTimers).filter(([timerId]) => timerId !== id)
      ),
    }))
  }, [])

  const clearAllTimers = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      activeTimers: {},
    }))
  }, [])

  // Notes actions
  const updateNotes = useCallback((notes: string) => {
    setState(prevState => ({
      ...prevState,
      personalNotes: notes,
    }))
  }, [])

  // Favorites actions
  const toggleFavorite = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isFavorited: !prevState.isFavorited,
    }))
    
    // Also update global favorites list
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]')
      const newFavorites = state.isFavorited
        ? favorites.filter((id: string) => id !== recipe.id)
        : [...favorites, recipe.id]
      localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites))
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }, [recipe.id, state.isFavorited])

  // Print settings actions
  const updatePrintSettings = useCallback((settings: Partial<RecipeInteractionState['printSettings']>) => {
    setState(prevState => ({
      ...prevState,
      printSettings: {
        ...prevState.printSettings,
        ...settings,
      },
    }))
  }, [])

  // Persistence actions
  const loadState = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedState = JSON.parse(saved)
        setState(prevState => ({
          ...prevState,
          ...parsedState,
          activeTimers: {}, // Don't restore timers
        }))
      }
    } catch (error) {
      console.error('Error loading recipe interactions:', error)
    }
  }, [storageKey])

  const clearState = useCallback(() => {
    setState({
      checkedIngredients: [],
      ingredientsProgress: 0,
      completedSteps: [],
      instructionsProgress: 0,
      servingSize: recipe.servings,
      scalingFactor: 1,
      activeTimers: {},
      personalNotes: '',
      isFavorited: false,
      printSettings: {
        includeNotes: true,
        includeNutrition: true,
        includeServings: true,
      },
    })
    
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing recipe interactions:', error)
    }
  }, [recipe.servings, storageKey])

  // Load favorites status on mount
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]')
      setState(prevState => ({
        ...prevState,
        isFavorited: favorites.includes(recipe.id),
      }))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [recipe.id])

  return {
    ...state,
    ingredientsProgress,
    instructionsProgress,
    scalingFactor,
    toggleIngredient,
    checkAllIngredients,
    uncheckAllIngredients,
    toggleStep,
    markStepComplete,
    markStepIncomplete,
    resetProgress,
    setServingSize,
    scaleUp,
    scaleDown,
    resetServingSize,
    startTimer,
    stopTimer,
    clearAllTimers,
    updateNotes,
    toggleFavorite,
    updatePrintSettings,
    saveState,
    loadState,
    clearState,
  }
}

// Hook for recipe timers
export function useRecipeTimer(id: string, duration: number) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false)
            setIsCompleted(true)
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsCompleted(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const start = useCallback(() => {
    setIsActive(true)
    setIsCompleted(false)
  }, [])

  const pause = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(duration)
    setIsActive(false)
    setIsCompleted(false)
  }, [duration])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    timeLeft,
    isActive,
    isCompleted,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    reset,
  }
}

// Hook for ingredient scaling
export function useIngredientScaling(originalAmount: number, originalUnit: string, scalingFactor: number) {
  const scaledAmount = useMemo(() => {
    return originalAmount * scalingFactor
  }, [originalAmount, scalingFactor])

  const formatScaledAmount = useCallback((amount: number, unit: string) => {
    // Handle fractional amounts
    const fractions: Record<string, string> = {
      '0.125': '⅛',
      '0.25': '¼',
      '0.33': '⅓',
      '0.375': '⅜',
      '0.5': '½',
      '0.625': '⅝',
      '0.66': '⅔',
      '0.75': '¾',
      '0.875': '⅞',
    }

    // Round to nearest 1/8 for display
    const rounded = Math.round(amount * 8) / 8
    const whole = Math.floor(rounded)
    const decimal = rounded - whole

    const decimalStr = decimal.toFixed(3)
    if (fractions[decimalStr]) {
      return whole > 0 
        ? `${whole}${fractions[decimalStr]} ${unit}`
        : `${fractions[decimalStr]} ${unit}`
    }

    // For larger amounts, use decimal
    if (rounded >= 1) {
      return rounded % 1 === 0 
        ? `${rounded} ${unit}`
        : `${rounded.toFixed(1)} ${unit}`
    }

    return `${rounded.toFixed(2)} ${unit}`
  }, [])

  return {
    originalAmount,
    scaledAmount,
    formattedAmount: formatScaledAmount(scaledAmount, originalUnit),
    scalingFactor,
  }
}