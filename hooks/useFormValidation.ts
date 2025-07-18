'use client'

import { useState, useCallback, useEffect } from 'react'
import { z } from 'zod'

export interface FormValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
  schema?: z.ZodSchema<any>
}

export interface FormError {
  message: string
  field?: string
  code?: string
}

export interface FormState<T = any> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  submitCount: number
}

export interface FormActions<T = any> {
  setValue: (field: keyof T, value: any) => void
  setValues: (values: Partial<T>) => void
  setError: (field: string, error: string) => void
  setErrors: (errors: Record<string, string>) => void
  clearError: (field: string) => void
  clearErrors: () => void
  setFieldTouched: (field: string, touched?: boolean) => void
  setTouched: (touched: Record<string, boolean>) => void
  validateField: (field: string) => Promise<boolean>
  validateForm: () => Promise<boolean>
  reset: (values?: Partial<T>) => void
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (field: string) => (e: React.FocusEvent) => void
  getFieldProps: (field: keyof T) => {
    name: string
    value: any
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    onBlur: (e: React.FocusEvent) => void
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: FormValidationOptions = {}
): FormState<T> & FormActions<T> {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    schema
  } = options

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  })

  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({})

  // Update isValid when errors change
  useEffect(() => {
    const hasErrors = Object.keys(state.errors).some(key => state.errors[key])
    if (state.isValid === hasErrors) {
      setState(prev => ({ ...prev, isValid: !hasErrors }))
    }
  }, [state.errors, state.isValid])

  // Validate a single field
  const validateField = useCallback(async (field: string): Promise<boolean> => {
    if (!schema) return true

    try {
      const fieldSchema = schema.shape?.[field]
      if (!fieldSchema) return true

      await fieldSchema.parseAsync(state.values[field as keyof T])
      
      // Clear error if validation passes
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' }
      }))
      
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message || 'Invalid value'
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [field]: fieldError }
        }))
      }
      return false
    }
  }, [schema, state.values])

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!schema) return true

    try {
      await schema.parseAsync(state.values)
      setState(prev => ({ ...prev, errors: {} }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const field = err.path.join('.')
          errors[field] = err.message
        })
        setState(prev => ({ ...prev, errors }))
      }
      return false
    }
  }, [schema, state.values])

  // Debounced validation
  const debouncedValidateField = useCallback((field: string) => {
    if (debounceTimers[field]) {
      clearTimeout(debounceTimers[field])
    }

    const timer = setTimeout(() => {
      validateField(field)
    }, debounceMs)

    setDebounceTimers(prev => ({ ...prev, [field]: timer }))
  }, [debounceTimers, debounceMs, validateField])

  // Form actions
  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      isDirty: true
    }))

    if (validateOnChange) {
      debouncedValidateField(field as string)
    }
  }, [validateOnChange, debouncedValidateField])

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      isDirty: true
    }))

    if (validateOnChange) {
      Object.keys(values).forEach(field => {
        debouncedValidateField(field)
      })
    }
  }, [validateOnChange, debouncedValidateField])

  const setError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }))
  }, [])

  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors }
    }))
  }, [])

  const clearError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' }
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }))
  }, [])

  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched }
    }))
  }, [])

  const setTouched = useCallback((touched: Record<string, boolean>) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, ...touched }
    }))
  }, [])

  const reset = useCallback((values?: Partial<T>) => {
    setState({
      values: values ? { ...initialValues, ...values } : initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      submitCount: 0,
    })
  }, [initialValues])

  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      e?.preventDefault()

      setState(prev => ({ 
        ...prev, 
        isSubmitting: true,
        submitCount: prev.submitCount + 1
      }))

      try {
        const isValid = await validateForm()
        
        if (!isValid) {
          setState(prev => ({ ...prev, isSubmitting: false }))
          return
        }

        await onSubmit(state.values)
        
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false,
          isDirty: false
        }))
      } catch (error) {
        setState(prev => ({ ...prev, isSubmitting: false }))
        
        if (error instanceof Error) {
          setError('submit', error.message)
        }
      }
    }
  }, [validateForm, state.values, setError])

  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : e.target.type === 'number'
        ? parseFloat(e.target.value) || 0
        : e.target.value

      setValue(field, value)
    }
  }, [setValue])

  const handleBlur = useCallback((field: string) => {
    return (e: React.FocusEvent) => {
      setFieldTouched(field, true)
      
      if (validateOnBlur) {
        validateField(field)
      }
    }
  }, [validateOnBlur, validateField, setFieldTouched])

  const getFieldProps = useCallback((field: keyof T) => {
    const fieldName = field as string
    const hasError = state.touched[fieldName] && state.errors[fieldName]
    
    return {
      name: fieldName,
      value: state.values[field] || '',
      onChange: handleChange(field),
      onBlur: handleBlur(fieldName),
      'aria-invalid': Boolean(hasError),
      'aria-describedby': hasError ? `${fieldName}-error` : undefined,
    }
  }, [state.values, state.touched, state.errors, handleChange, handleBlur])

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => clearTimeout(timer))
    }
  }, [debounceTimers])

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    isDirty: state.isDirty,
    submitCount: state.submitCount,
    
    // Actions
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setFieldTouched,
    setTouched,
    validateField,
    validateForm,
    reset,
    handleSubmit,
    handleChange,
    handleBlur,
    getFieldProps,
  }
}

// Helper hook for array fields (like ingredients, instructions)
export function useArrayField<T>(
  initialValues: T[],
  options: FormValidationOptions = {}
) {
  const [items, setItems] = useState<T[]>(initialValues)
  const [errors, setErrors] = useState<Record<number, string>>({})

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  const updateItem = useCallback((index: number, value: T) => {
    setItems(prev => prev.map((item, i) => i === index ? value : item))
  }, [])

  const moveItem = useCallback((from: number, to: number) => {
    setItems(prev => {
      const newItems = [...prev]
      const item = newItems.splice(from, 1)[0]
      newItems.splice(to, 0, item)
      return newItems
    })
  }, [])

  const setItemError = useCallback((index: number, error: string) => {
    setErrors(prev => ({ ...prev, [index]: error }))
  }, [])

  const clearItemError = useCallback((index: number) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  const reset = useCallback((values?: T[]) => {
    setItems(values || initialValues)
    setErrors({})
  }, [initialValues])

  return {
    items,
    errors,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    setItemError,
    clearItemError,
    reset,
  }
}

// Helper hook for file uploads
export function useFileUpload(
  options: {
    accept?: string
    maxSize?: number
    maxFiles?: number
    onUpload?: (files: File[]) => Promise<void>
    onError?: (error: string) => void
  } = {}
) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { accept, maxSize = 5 * 1024 * 1024, maxFiles = 1, onUpload, onError } = options

  const validateFile = useCallback((file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      const error = `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
      setError(error)
      onError?.(error)
      return false
    }

    if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
      const error = `File type not allowed. Accepted types: ${accept}`
      setError(error)
      onError?.(error)
      return false
    }

    return true
  }, [accept, maxSize, onError])

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile)
    
    if (validFiles.length === 0) return

    setFiles(prev => {
      const combined = [...prev, ...validFiles]
      return combined.slice(0, maxFiles)
    })

    // Create previews for image files
    const newPreviews = validFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file)
      }
      return ''
    })

    setPreviews(prev => [...prev, ...newPreviews])
    setError(null)
  }, [validateFile, maxFiles])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Clean up object URLs
      if (prev[index]) {
        URL.revokeObjectURL(prev[index])
      }
      return newPreviews
    })
  }, [])

  const uploadFiles = useCallback(async () => {
    if (!onUpload || files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      await onUpload(files)
      setProgress(100)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [files, onUpload, onError])

  const reset = useCallback(() => {
    // Clean up object URLs
    previews.forEach(preview => {
      if (preview) URL.revokeObjectURL(preview)
    })
    
    setFiles([])
    setPreviews([])
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [previews])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview)
      })
    }
  }, [previews])

  return {
    files,
    previews,
    uploading,
    progress,
    error,
    addFiles,
    removeFile,
    uploadFiles,
    reset,
  }
}