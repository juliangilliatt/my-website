import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-sm font-medium uppercase tracking-wider transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-black',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-black hover:text-white shadow-brutal hover:shadow-brutal-sm active:shadow-none',
        primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-brutal hover:shadow-brutal-sm active:shadow-none',
        secondary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-brutal hover:shadow-brutal-sm active:shadow-none',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-brutal hover:shadow-brutal-sm active:shadow-none',
        outline: 'border-2 border-black bg-transparent text-black hover:bg-black hover:text-white shadow-brutal hover:shadow-brutal-sm active:shadow-none',
        ghost: 'border-transparent bg-transparent text-black hover:bg-black hover:text-white hover:border-black shadow-none hover:shadow-brutal-sm active:shadow-none',
        link: 'text-black underline-offset-4 hover:underline border-transparent bg-transparent shadow-none hover:shadow-none active:shadow-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        style={{
          transform: props.disabled ? 'none' : undefined,
        }}
        onMouseDown={(e) => {
          if (!props.disabled) {
            const button = e.currentTarget
            button.style.transform = 'translate(4px, 4px)'
          }
          props.onMouseDown?.(e)
        }}
        onMouseUp={(e) => {
          if (!props.disabled) {
            const button = e.currentTarget
            button.style.transform = 'translate(2px, 2px)'
          }
          props.onMouseUp?.(e)
        }}
        onMouseLeave={(e) => {
          if (!props.disabled) {
            const button = e.currentTarget
            button.style.transform = 'translate(0, 0)'
          }
          props.onMouseLeave?.(e)
        }}
        onMouseEnter={(e) => {
          if (!props.disabled) {
            const button = e.currentTarget
            button.style.transform = 'translate(2px, 2px)'
          }
          props.onMouseEnter?.(e)
        }}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }