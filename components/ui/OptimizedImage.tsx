'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  fallback?: string
  loading?: 'eager' | 'lazy'
  unoptimized?: boolean
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onClick,
  onLoad,
  onError,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  fallback = '/images/placeholder.jpg',
  loading = 'lazy',
  unoptimized = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, isInView])

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (w: number, h: number): string => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    
    return canvas.toDataURL()
  }

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate responsive sizes
  const generateSizes = (): string => {
    if (sizes) return sizes
    
    if (width && height) {
      return `(max-width: 768px) ${Math.min(width, 768)}px, ${width}px`
    }
    
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  }

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
    ...style
  }

  // Add aspect ratio if provided
  if (aspectRatio && !fill) {
    containerStyles.aspectRatio = aspectRatio
  }

  // Image styles
  const imageStyles: React.CSSProperties = {
    objectFit,
    objectPosition,
    transition: 'opacity 0.3s ease-in-out'
  }

  // Placeholder component
  const Placeholder = () => (
    <div
      className={cn(
        'absolute inset-0 bg-gray-200 animate-pulse',
        'flex items-center justify-center',
        className
      )}
      style={containerStyles}
    >
      <div className="text-gray-400">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  )

  // Error fallback component
  const ErrorFallback = () => (
    <div
      className={cn(
        'relative bg-gray-100 border border-gray-200',
        'flex items-center justify-center',
        className
      )}
      style={containerStyles}
    >
      {fallback ? (
        <Image
          src={fallback}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          style={imageStyles}
          unoptimized={unoptimized}
        />
      ) : (
        <div className="text-gray-400 text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      )}
    </div>
  )

  // Show placeholder while not in view
  if (!isInView) {
    return (
      <div ref={imgRef} className={className} style={containerStyles}>
        <Placeholder />
      </div>
    )
  }

  // Show error fallback
  if (hasError) {
    return <ErrorFallback />
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative', className)}
      style={containerStyles}
      onClick={onClick}
    >
      {/* Loading placeholder */}
      {!isLoaded && <Placeholder />}
      
      {/* Optimized image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined)}
        sizes={generateSizes()}
        style={{
          ...imageStyles,
          opacity: isLoaded ? 1 : 0
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        unoptimized={unoptimized}
      />
    </div>
  )
}

export default OptimizedImage