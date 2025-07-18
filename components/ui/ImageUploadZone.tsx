'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Button } from './Button'
import { Card } from './Card'
import { cn } from '@/lib/utils'
import { 
  validateImageFile, 
  validateImageFiles, 
  type ImageValidationConfig,
  IMAGE_VALIDATION_CONFIGS 
} from '@/lib/image/validation'

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  url?: string
}

interface ImageUploadZoneProps {
  onUpload?: (files: File[]) => Promise<void>
  onFilesChange?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number
  accept?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'avatar'
  validationConfig?: keyof typeof IMAGE_VALIDATION_CONFIGS | ImageValidationConfig
  showPreview?: boolean
  showProgress?: boolean
  dragText?: string
  browseText?: string
  dropText?: string
  errorText?: string
  children?: React.ReactNode
}

export function ImageUploadZone({
  onUpload,
  onFilesChange,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*',
  multiple = true,
  disabled = false,
  className,
  variant = 'default',
  validationConfig = 'general',
  showPreview = true,
  showProgress = true,
  dragText = 'Drag & drop images here',
  browseText = 'Browse files',
  dropText = 'Drop files here',
  errorText = 'Upload failed',
  children,
}: ImageUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [globalError, setGlobalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Get validation config
  const getValidationConfig = useCallback((): ImageValidationConfig => {
    if (typeof validationConfig === 'string') {
      return IMAGE_VALIDATION_CONFIGS[validationConfig]
    }
    return validationConfig
  }, [validationConfig])

  // Handle file validation and processing
  const processFiles = useCallback(async (newFiles: File[]) => {
    const config = getValidationConfig()
    
    // Validate files
    const validation = await validateImageFiles(newFiles, config)
    
    if (validation.globalErrors.length > 0) {
      setGlobalError(validation.globalErrors.join(', '))
      return
    }

    // Check total file count
    if (files.length + newFiles.length > maxFiles) {
      setGlobalError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setGlobalError(null)

    // Create uploaded file objects
    const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      status: validation.results[index].isValid ? 'pending' : 'error',
      progress: 0,
      error: validation.results[index].errors.join(', ') || undefined,
    }))

    setFiles(prev => [...prev, ...uploadedFiles])
    onFilesChange?.([...files, ...uploadedFiles])

    // Start upload process
    if (onUpload) {
      const validFiles = uploadedFiles.filter(f => f.status === 'pending')
      if (validFiles.length > 0) {
        await handleUpload(validFiles)
      }
    }
  }, [files, maxFiles, onUpload, onFilesChange, getValidationConfig])

  // Handle file upload
  const handleUpload = useCallback(async (filesToUpload: UploadedFile[]) => {
    if (!onUpload) return

    for (const uploadedFile of filesToUpload) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ))

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ))
        }, 100)

        // Perform upload
        await onUpload([uploadedFile.file])

        // Clear progress interval
        clearInterval(progressInterval)

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ))
      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'error', 
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ))
      }
    }
  }, [onUpload])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
    // Reset input
    e.target.value = ''
  }, [processFiles])

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set drag inactive if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragActive(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }, [disabled, processFiles])

  // Handle browse click
  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  // Handle file removal
  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId)
      onFilesChange?.(updatedFiles)
      return updatedFiles
    })
  }, [onFilesChange])

  // Handle retry upload
  const handleRetryUpload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file && onUpload) {
      handleUpload([file])
    }
  }, [files, onUpload, handleUpload])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-4 min-h-[120px]'
      case 'avatar':
        return 'p-6 min-h-[200px] aspect-square'
      default:
        return 'p-8 min-h-[200px]'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
          getVariantClasses(),
          dragActive && !disabled 
            ? 'border-blue-500 bg-blue-50 shadow-brutal' 
            : 'border-neutral-300 hover:border-neutral-400',
          disabled && 'opacity-50 cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        )}
        tabIndex={0}
        role="button"
        aria-label="Upload images"
      >
        {children || (
          <div className="flex flex-col items-center justify-center text-center">
            <UploadIcon className="w-12 h-12 text-neutral-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-mono font-medium text-black">
                {dragActive ? dropText : dragText}
              </p>
              <p className="text-sm font-mono text-neutral-500">
                or <span className="text-blue-600 underline">{browseText}</span>
              </p>
              <p className="text-xs font-mono text-neutral-400">
                {accept} • Max {maxFiles} files • {Math.round(maxFileSize / 1024 / 1024)}MB each
              </p>
            </div>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="p-3 bg-red-50 border-2 border-red-500 shadow-brutal">
          <div className="flex items-center gap-2">
            <ErrorIcon className="w-5 h-5 text-red-500" />
            <p className="text-sm font-mono text-red-700">{globalError}</p>
          </div>
        </div>
      )}

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-mono font-medium text-black">
            Uploaded Files ({files.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                showProgress={showProgress}
                onRemove={() => handleRemoveFile(file.id)}
                onRetry={() => handleRetryUpload(file.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// File preview component
interface FilePreviewProps {
  file: UploadedFile
  showProgress: boolean
  onRemove: () => void
  onRetry: () => void
}

function FilePreview({ file, showProgress, onRemove, onRetry }: FilePreviewProps) {
  const getStatusColor = () => {
    switch (file.status) {
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      case 'uploading':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-neutral-300 bg-white'
    }
  }

  const getStatusIcon = () => {
    switch (file.status) {
      case 'success':
        return <CheckIcon className="w-4 h-4 text-green-500" />
      case 'error':
        return <ErrorIcon className="w-4 h-4 text-red-500" />
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <ClockIcon className="w-4 h-4 text-neutral-400" />
    }
  }

  return (
    <Card className={cn('p-3 transition-all duration-200', getStatusColor())}>
      <div className="space-y-2">
        {/* Image Preview */}
        <div className="relative aspect-square overflow-hidden rounded border-2 border-black">
          <Image
            src={file.preview}
            alt={file.file.name}
            fill
            className="object-cover"
          />
          
          {/* Status Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {getStatusIcon()}
          </div>
        </div>

        {/* File Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-black truncate flex-1">
              {file.file.name}
            </p>
            <button
              onClick={onRemove}
              className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
            >
              <XIcon className="w-3 h-3 text-red-500" />
            </button>
          </div>
          
          <p className="text-xs font-mono text-neutral-500">
            {formatFileSize(file.file.size)}
          </p>
          
          {/* Progress Bar */}
          {showProgress && file.status === 'uploading' && (
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}
          
          {/* Error Message */}
          {file.status === 'error' && file.error && (
            <div className="space-y-1">
              <p className="text-xs font-mono text-red-600">
                {file.error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-full font-mono text-xs"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Utility function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Icon components
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
      />
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  )
}