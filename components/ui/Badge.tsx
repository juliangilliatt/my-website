import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center border-2 border-black px-2.5 py-0.5 text-xs font-mono font-semibold uppercase tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-white text-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5',
        primary: 'bg-primary-500 text-white shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5',
        secondary: 'bg-accent-500 text-white shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5',
        success: 'bg-green-500 text-white shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5',
        warning: 'bg-yellow-500 text-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5',
        danger: 'bg-red-500 text-white shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5',
        outline: 'bg-transparent text-black border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-black hover:text-white',
        ghost: 'bg-transparent text-black border-transparent shadow-none hover:bg-black hover:text-white hover:border-black hover:shadow-brutal-sm',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

// Specialized badge components for common use cases
const TimeBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { time: string; icon?: React.ReactNode }
>(({ className, time, icon, ...props }, ref) => (
  <Badge
    ref={ref}
    variant="outline"
    className={cn('flex items-center gap-1', className)}
    {...props}
  >
    {icon && <span className="text-xs">{icon}</span>}
    {time}
  </Badge>
))
TimeBadge.displayName = 'TimeBadge'

const StatusBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    status: 'draft' | 'published' | 'archived' | 'featured'
  }
>(({ className, status, ...props }, ref) => {
  const statusConfig = {
    draft: { variant: 'outline' as const, text: 'Draft' },
    published: { variant: 'success' as const, text: 'Published' },
    archived: { variant: 'secondary' as const, text: 'Archived' },
    featured: { variant: 'primary' as const, text: 'Featured' },
  }

  const config = statusConfig[status]
  
  return (
    <Badge
      ref={ref}
      variant={config.variant}
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  )
})
StatusBadge.displayName = 'StatusBadge'

const TagBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    tag: string 
    removable?: boolean
    onRemove?: () => void
  }
>(({ className, tag, removable = false, onRemove, ...props }, ref) => (
  <Badge
    ref={ref}
    variant="ghost"
    className={cn('flex items-center gap-1', className)}
    {...props}
  >
    {tag}
    {removable && onRemove && (
      <button
        onClick={onRemove}
        className="ml-1 text-xs hover:text-red-500 transition-colors"
        aria-label={`Remove ${tag} tag`}
      >
        ×
      </button>
    )}
  </Badge>
))
TagBadge.displayName = 'TagBadge'

export { Badge, badgeVariants, TimeBadge, StatusBadge, TagBadge }