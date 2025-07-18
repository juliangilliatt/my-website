'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FormField, FormInput, CharacterCounter } from './FormValidation'
import { 
  validateImageFile, 
  processImageFile, 
  uploadImageToServer, 
  formatFileSize,
  createImagePreviewUrl,
  cleanupImagePreviewUrl,
  type ImageUploadOptions,
  type ImageUploadResult
} from '@/lib/image-upload'
import { useFileUpload } from '@/hooks/useFormValidation'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  onImageData?: (data: ImageUploadResult) => void
  onError?: (error: string) => void
  className?: string
  label?: string
  required?: boolean
  accept?: string
  maxSize?: number
  options?: ImageUploadOptions
  showAltText?: boolean
  showCaption?: boolean
  altText?: string
  onAltTextChange?: (altText: string) => void
  caption?: string
  onCaptionChange?: (caption: string) => void
  multiple?: boolean
  disabled?: boolean
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'free'
}

export function ImageUpload({
  value,
  onChange,
  onImageData,
  onError,
  className,
  label = 'Image',
  required,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 5 * 1024 * 1024, // 5MB
  options = {},
  showAltText = true,
  showCaption = false,
  altText = '',
  onAltTextChange,
  caption = '',
  onCaptionChange,
  multiple = false,
  disabled = false,
  aspectRatio = 'free',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [imageData, setImageData] = useState<ImageUploadResult | null>(null)
  const [altTextValue, setAltTextValue] = useState(altText)
  const [captionValue, setCaptionValue] = useState(caption)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Update internal state when props change
  useEffect(() => {
    setAltTextValue(altText)
  }, [altText])

  useEffect(() => {
    setCaptionValue(caption)
  }, [caption])

  useEffect(() => {
    setPreviewUrl(value || null)
  }, [value])

  const handleFileValidation = useCallback((file: File): boolean => {
    const validation = validateImageFile(file, { maxSize, allowedTypes: accept.split(',') })
    
    if (!validation.isValid) {
      const error = validation.errors.join(', ')
      setError(error)
      onError?.(error)
      return false
    }
    
    setError(null)
    return true
  }, [accept, maxSize, onError])

  const handleFileUpload = useCallback(async (file: File) => {
    if (!handleFileValidation(file)) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Create immediate preview
      const preview = createImagePreviewUrl(file)
      setPreviewUrl(preview)

      // Process and upload image
      const result = await uploadImageToServer(file, {
        maxSize,
        allowedTypes: accept.split(','),
        ...options,
      })

      setImageData(result)
      setPreviewUrl(result.url)
      setUploadProgress(100)
      
      onChange?.(result.url)
      onImageData?.(result)

      // Clean up preview URL
      cleanupImagePreviewUrl(preview)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setError(errorMessage)
      onError?.(errorMessage)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }, [handleFileValidation, maxSize, accept, options, onChange, onImageData, onError])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [disabled, handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null)
    setImageData(null)
    setError(null)
    setUploadProgress(0)
    onChange?.('')
    onImageData?.(null as any)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange, onImageData])

  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleAltTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAltTextValue(value)
    onAltTextChange?.(value)
  }, [onAltTextChange])

  const handleCaptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCaptionValue(value)
    onCaptionChange?.(value)
  }, [onCaptionChange])

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'landscape':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      default:
        return 'aspect-video'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <FormField
        label={label}
        required={required}
        error={error || undefined}
      >
        <div className="space-y-3">
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'relative border-2 border-dashed rounded-lg transition-all duration-200',
              dragActive && !disabled ? 'border-blue-500 bg-blue-50' : 'border-neutral-300',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'hover:border-neutral-400 cursor-pointer'
            )}
            onClick={handleBrowseClick}
          >
            {previewUrl ? (
              <div className="relative group">
                <div className={cn('relative overflow-hidden rounded-lg', getAspectRatioClass())}>
                  <Image
                    src={previewUrl}
                    alt={altTextValue || 'Uploaded image'}
                    fill
                    className="object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm font-mono">Uploading... {uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {!disabled && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage()
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <div className="space-y-2">
                  <p className="text-sm font-mono font-medium text-black">
                    Drop image here or click to browse
                  </p>
                  <p className="text-xs font-mono text-neutral-500">
                    Supports: {accept.replace(/image\//g, '').toUpperCase()}
                  </p>
                  <p className="text-xs font-mono text-neutral-500">
                    Max size: {formatFileSize(maxSize)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            aria-label={label}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </FormField>

      {/* Image Metadata */}
      {imageData && (
        <Card className="p-4">
          <h4 className="font-mono font-medium text-black mb-2">Image Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm font-mono text-neutral-600">
            <div>
              <span className="font-medium">Dimensions:</span>
              <div>{imageData.width} × {imageData.height}</div>
            </div>
            <div>
              <span className="font-medium">Size:</span>
              <div>{formatFileSize(imageData.size)}</div>
            </div>
            <div>
              <span className="font-medium">Type:</span>
              <div>{imageData.type}</div>
            </div>
            <div>
              <span className="font-medium">Filename:</span>
              <div className="truncate">{imageData.filename}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Alt Text Input */}
      {showAltText && (
        <FormField
          label="Alt Text"
          description="Describe the image for screen readers"
          required={required}
        >
          <div className="space-y-2">
            <FormInput
              value={altTextValue}
              onChange={handleAltTextChange}
              placeholder="Describe the image..."
              maxLength={200}
              disabled={disabled}
            />
            <CharacterCounter current={altTextValue.length} max={200} />
          </div>
        </FormField>
      )}

      {/* Caption Input */}
      {showCaption && (
        <FormField
          label="Caption"
          description="Optional caption to display with the image"
        >
          <div className="space-y-2">
            <FormInput
              value={captionValue}
              onChange={handleCaptionChange}
              placeholder="Add a caption..."
              maxLength={300}
              disabled={disabled}
            />
            <CharacterCounter current={captionValue.length} max={300} />
          </div>
        </FormField>
      )}
    </div>
  )
}

// Multiple image upload component
interface MultipleImageUploadProps extends Omit<ImageUploadProps, 'value' | 'onChange' | 'multiple'> {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxFiles?: number
}

export function MultipleImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  className,
  ...props
}: MultipleImageUploadProps) {
  const [images, setImages] = useState<string[]>(value)

  useEffect(() => {
    setImages(value)
  }, [value])

  const handleImageAdd = useCallback((url: string) => {
    if (images.length >= maxFiles) return
    
    const newImages = [...images, url]
    setImages(newImages)
    onChange?.(newImages)
  }, [images, maxFiles, onChange])

  const handleImageRemove = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onChange?.(newImages)
  }, [images, onChange])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-black shadow-brutal">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload New Image */}
      {images.length < maxFiles && (
        <ImageUpload
          {...props}
          onChange={handleImageAdd}
          showAltText={false}
          showCaption={false}
        />
      )}

      {/* Upload Limit Info */}
      <p className="text-xs font-mono text-neutral-500">
        {images.length} of {maxFiles} images uploaded
      </p>
    </div>
  )
}

// Icon components
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}