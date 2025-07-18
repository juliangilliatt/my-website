'use client'

import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Form field wrapper with validation styling
interface FormFieldProps {
  children: ReactNode
  label?: string
  error?: string
  warning?: string
  required?: boolean
  className?: string
  description?: string
  htmlFor?: string
}

export function FormField({
  children,
  label,
  error,
  warning,
  required,
  className,
  description,
  htmlFor,
}: FormFieldProps) {
  const fieldId = htmlFor || `field-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-mono font-medium text-black"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
        
        {(error || warning) && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            {error && <ErrorIcon className="w-5 h-5 text-red-500" />}
            {warning && !error && <WarningIcon className="w-5 h-5 text-yellow-500" />}
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-xs font-mono text-neutral-500">{description}</p>
      )}
      
      {error && (
        <p 
          id={`${fieldId}-error`}
          className="text-xs font-mono text-red-600 font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {warning && !error && (
        <p 
          id={`${fieldId}-warning`}
          className="text-xs font-mono text-yellow-600 font-medium"
        >
          {warning}
        </p>
      )}
    </div>
  )
}

// Input component with validation states
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  warning?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, warning, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 font-mono text-sm bg-white border-2 shadow-brutal transition-all duration-200',
          'focus:outline-none focus:shadow-brutal-sm',
          'disabled:bg-neutral-50 disabled:text-neutral-500',
          // Default state
          !error && !warning && 'border-black',
          // Error state
          error && 'border-red-500 focus:border-red-500',
          // Warning state
          warning && !error && 'border-yellow-500 focus:border-yellow-500',
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
    )
  }
)

FormInput.displayName = 'FormInput'

// Textarea component with validation states
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  warning?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, warning, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 font-mono text-sm bg-white border-2 shadow-brutal transition-all duration-200',
          'focus:outline-none focus:shadow-brutal-sm resize-vertical',
          'disabled:bg-neutral-50 disabled:text-neutral-500',
          // Default state
          !error && !warning && 'border-black',
          // Error state
          error && 'border-red-500 focus:border-red-500',
          // Warning state
          warning && !error && 'border-yellow-500 focus:border-yellow-500',
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// Select component with validation states
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  warning?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, warning, options, placeholder, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2 font-mono text-sm bg-white border-2 shadow-brutal transition-all duration-200',
          'focus:outline-none focus:shadow-brutal-sm',
          'disabled:bg-neutral-50 disabled:text-neutral-500',
          // Default state
          !error && !warning && 'border-black',
          // Error state
          error && 'border-red-500 focus:border-red-500',
          // Warning state
          warning && !error && 'border-yellow-500 focus:border-yellow-500',
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)

FormSelect.displayName = 'FormSelect'

// Checkbox component with validation states
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  warning?: string
  label?: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ error, warning, label, className, ...props }, ref) => {
    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'w-4 h-4 mt-1 border-2 shadow-brutal transition-all duration-200',
            'focus:outline-none focus:shadow-brutal-sm',
            'disabled:bg-neutral-50 disabled:text-neutral-500',
            // Default state
            !error && !warning && 'border-black',
            // Error state
            error && 'border-red-500 focus:border-red-500',
            // Warning state
            warning && !error && 'border-yellow-500 focus:border-yellow-500',
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {label && (
          <label 
            htmlFor={props.id}
            className="text-sm font-mono text-black cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

FormCheckbox.displayName = 'FormCheckbox'

// Form section wrapper
interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="border-b-2 border-black pb-2">
        <h3 className="text-lg font-mono font-bold text-black">{title}</h3>
        {description && (
          <p className="text-sm font-mono text-neutral-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Form error summary
interface FormErrorSummaryProps {
  errors: Record<string, string>
  className?: string
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, error]) => error)
  
  if (errorEntries.length === 0) return null
  
  return (
    <div className={cn(
      'p-4 bg-red-50 border-2 border-red-500 shadow-brutal',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <ErrorIcon className="w-5 h-5 text-red-500" />
        <h4 className="font-mono font-bold text-red-700">
          {errorEntries.length} error{errorEntries.length !== 1 ? 's' : ''} found
        </h4>
      </div>
      <ul className="space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field} className="text-sm font-mono text-red-600">
            • {field}: {error}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Form success message
interface FormSuccessMessageProps {
  message: string
  className?: string
}

export function FormSuccessMessage({ message, className }: FormSuccessMessageProps) {
  return (
    <div className={cn(
      'p-4 bg-green-50 border-2 border-green-500 shadow-brutal',
      className
    )}>
      <div className="flex items-center gap-2">
        <CheckIcon className="w-5 h-5 text-green-500" />
        <p className="font-mono font-medium text-green-700">{message}</p>
      </div>
    </div>
  )
}

// Form loading state
interface FormLoadingProps {
  message?: string
  className?: string
}

export function FormLoading({ message = 'Loading...', className }: FormLoadingProps) {
  return (
    <div className={cn(
      'p-4 bg-blue-50 border-2 border-blue-500 shadow-brutal',
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        <p className="font-mono font-medium text-blue-700">{message}</p>
      </div>
    </div>
  )
}

// Character counter
interface CharacterCounterProps {
  current: number
  max: number
  className?: string
}

export function CharacterCounter({ current, max, className }: CharacterCounterProps) {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isOverLimit = current > max
  
  return (
    <div className={cn(
      'text-xs font-mono',
      isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-neutral-500',
      className
    )}>
      {current} / {max} characters
      {isOverLimit && ` (${current - max} over limit)`}
    </div>
  )
}

// Field validation indicator
interface FieldValidationIndicatorProps {
  isValid?: boolean
  isValidating?: boolean
  className?: string
}

export function FieldValidationIndicator({ 
  isValid, 
  isValidating, 
  className 
}: FieldValidationIndicatorProps) {
  if (isValidating) {
    return (
      <div className={cn('animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full', className)} />
    )
  }
  
  if (isValid === true) {
    return <CheckIcon className={cn('w-4 h-4 text-green-500', className)} />
  }
  
  if (isValid === false) {
    return <ErrorIcon className={cn('w-4 h-4 text-red-500', className)} />
  }
  
  return null
}

// Icon components
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// Form validation utilities
export function getFieldError(
  errors: Record<string, string>,
  field: string
): string | undefined {
  return errors[field] || undefined
}

export function hasFieldError(
  errors: Record<string, string>,
  field: string
): boolean {
  return Boolean(errors[field])
}

export function getFieldId(name: string): string {
  return `field-${name}`
}

export function getFieldErrorId(name: string): string {
  return `${getFieldId(name)}-error`
}

export function getFieldWarningId(name: string): string {
  return `${getFieldId(name)}-warning`
}

// Form validation context (for complex forms)
export interface FormValidationContextValue {
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  setFieldError: (field: string, error: string) => void
  clearFieldError: (field: string) => void
  setFieldTouched: (field: string, touched?: boolean) => void
}