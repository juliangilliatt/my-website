import * as React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary'
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-4',
    }

    const variantClasses = {
      default: 'border-black border-t-transparent',
      primary: 'border-primary-500 border-t-transparent',
      secondary: 'border-accent-500 border-t-transparent',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'h-4 w-full bg-neutral-200 border-2 border-neutral-300',
      card: 'h-32 w-full bg-neutral-200 border-2 border-black shadow-brutal',
      text: 'h-4 bg-neutral-200 border border-neutral-300',
      avatar: 'h-12 w-12 bg-neutral-200 border-2 border-black',
      button: 'h-10 w-24 bg-neutral-200 border-2 border-black shadow-brutal',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white border-2 border-black shadow-brutal p-4 space-y-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-4/5" />
        <Skeleton variant="text" className="h-4 w-3/5" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton variant="button" className="h-8 w-20" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  )
)
SkeletonCard.displayName = 'SkeletonCard'

const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { lines?: number }
>(({ className, lines = 3, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
))
SkeletonText.displayName = 'SkeletonText'

const LoadingDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center space-x-1', className)}
      {...props}
    >
      <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
    </div>
  )
)
LoadingDots.displayName = 'LoadingDots'

export {
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  LoadingDots,
}