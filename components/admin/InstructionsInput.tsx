'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, FormTextarea, CharacterCounter } from './FormValidation'
import { useArrayField } from '@/hooks/useFormValidation'
import { cn } from '@/lib/utils'

interface InstructionsInputProps {
  value: string[]
  onChange: (instructions: string[]) => void
  className?: string
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
  maxInstructions?: number
  placeholder?: string
}

export function InstructionsInput({
  value = [],
  onChange,
  className,
  label = 'Instructions',
  required,
  error,
  disabled,
  maxInstructions = 30,
  placeholder = 'Enter cooking instruction...',
}: InstructionsInputProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragItemRef = useRef<HTMLDivElement>(null)

  const {
    items: instructions,
    errors: instructionErrors,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    setItemError,
    clearItemError,
  } = useArrayField<string>(value, {})

  // Update parent when instructions change
  React.useEffect(() => {
    onChange(instructions)
  }, [instructions, onChange])

  const handleAddInstruction = useCallback(() => {
    if (instructions.length < maxInstructions) {
      addItem('')
    }
  }, [instructions.length, maxInstructions, addItem])

  const handleRemoveInstruction = useCallback((index: number) => {
    removeItem(index)
  }, [removeItem])

  const handleInstructionChange = useCallback((index: number, value: string) => {
    updateItem(index, value)
    
    // Clear error when user starts typing
    if (instructionErrors[index]) {
      clearItemError(index)
    }
    
    // Validate instruction
    if (value.trim().length === 0) {
      setItemError(index, 'Instruction cannot be empty')
    } else if (value.length > 500) {
      setItemError(index, 'Instruction must not exceed 500 characters')
    }
  }, [updateItem, instructionErrors, clearItemError, setItemError])

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      moveItem(index, index - 1)
    }
  }, [moveItem])

  const handleMoveDown = useCallback((index: number) => {
    if (index < instructions.length - 1) {
      moveItem(index, index + 1)
    }
  }, [moveItem, instructions.length])

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    if (dragIndex !== null && dragIndex !== index) {
      moveItem(dragIndex, index)
    }
    
    setDragIndex(null)
    setDropIndex(null)
  }, [dragIndex, moveItem])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <FormField
        label={label}
        required={required}
        error={error}
        description={`Step-by-step cooking instructions (${instructions.length}/${maxInstructions})`}
      >
        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white border-2 border-black shadow-brutal transition-all duration-200',
                dragIndex === index && 'opacity-50 scale-95',
                dropIndex === index && 'border-blue-500 bg-blue-50'
              )}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-mono font-bold text-sm">
                  {index + 1}
                </div>

                {/* Instruction Input */}
                <div className="flex-1 space-y-2">
                  <FormTextarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                    maxLength={500}
                    disabled={disabled}
                    error={instructionErrors[index]}
                    className="resize-none border-none shadow-none bg-transparent p-0 focus:shadow-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <CharacterCounter 
                      current={instruction.length} 
                      max={500} 
                      className="text-xs" 
                    />
                    
                    {instructionErrors[index] && (
                      <span className="text-xs font-mono text-red-600">
                        {instructionErrors[index]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  {/* Drag Handle */}
                  <button
                    type="button"
                    className="p-1 text-neutral-400 hover:text-neutral-600 cursor-move"
                    disabled={disabled}
                  >
                    <DragIcon className="w-4 h-4" />
                  </button>

                  {/* Move Up */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={disabled || index === 0}
                    className="p-1 h-auto"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </Button>

                  {/* Move Down */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={disabled || index === instructions.length - 1}
                    className="p-1 h-auto"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </Button>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInstruction(index)}
                    disabled={disabled || instructions.length <= 1}
                    className="p-1 h-auto text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Instruction Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddInstruction}
            disabled={disabled || instructions.length >= maxInstructions}
            className="w-full font-mono"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Instruction Step
          </Button>
        </div>
      </FormField>
    </div>
  )
}

// Bulk import instructions component
interface BulkInstructionsImportProps {
  onImport: (instructions: string[]) => void
  className?: string
  disabled?: boolean
}

export function BulkInstructionsImport({ 
  onImport, 
  className,
  disabled 
}: BulkInstructionsImportProps) {
  const [bulkText, setBulkText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleImport = useCallback(() => {
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')) // Remove leading numbers
      .slice(0, 30) // Limit to 30 instructions

    if (lines.length > 0) {
      onImport(lines)
      setBulkText('')
      setIsOpen(false)
    }
  }, [bulkText, onImport])

  const handleCancel = useCallback(() => {
    setBulkText('')
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={cn('font-mono', className)}
      >
        <ImportIcon className="w-4 h-4 mr-2" />
        Import Instructions
      </Button>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <FormField
        label="Bulk Import Instructions"
        description="Paste instructions, one per line. Numbers will be automatically removed."
      >
        <FormTextarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="1. Preheat oven to 350°F&#10;2. Mix ingredients in bowl&#10;3. Bake for 30 minutes"
          rows={8}
          className="font-mono text-sm"
        />
      </FormField>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleImport}
          disabled={!bulkText.trim()}
          className="font-mono"
        >
          Import {bulkText.split('\n').filter(line => line.trim()).length} Instructions
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="font-mono"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Instructions template component
interface InstructionsTemplateProps {
  onApplyTemplate: (instructions: string[]) => void
  className?: string
  disabled?: boolean
}

export function InstructionsTemplate({ 
  onApplyTemplate, 
  className,
  disabled 
}: InstructionsTemplateProps) {
  const templates = [
    {
      name: 'Baking Recipe',
      instructions: [
        'Preheat oven to the required temperature',
        'Prepare baking pan by greasing or lining with parchment',
        'Mix dry ingredients in a large bowl',
        'In separate bowl, combine wet ingredients',
        'Gradually combine wet and dry ingredients',
        'Pour batter into prepared pan',
        'Bake for specified time until golden brown',
        'Cool completely before serving'
      ]
    },
    {
      name: 'Stovetop Cooking',
      instructions: [
        'Heat oil in large skillet or pan over medium heat',
        'Add aromatics (onion, garlic) and cook until fragrant',
        'Add main ingredients to pan',
        'Season with salt, pepper, and desired spices',
        'Cook, stirring occasionally, until done',
        'Adjust seasoning to taste',
        'Serve hot'
      ]
    },
    {
      name: 'Soup Recipe',
      instructions: [
        'Heat oil in large pot over medium heat',
        'Sauté vegetables until softened',
        'Add liquid and bring to boil',
        'Add main ingredients and seasonings',
        'Reduce heat and simmer covered',
        'Stir occasionally and adjust seasoning',
        'Serve hot with desired garnishes'
      ]
    },
    {
      name: 'Salad Recipe',
      instructions: [
        'Wash and dry all vegetables thoroughly',
        'Chop vegetables into bite-sized pieces',
        'Prepare dressing by whisking ingredients together',
        'Combine vegetables in large bowl',
        'Add dressing and toss gently',
        'Let marinate for a few minutes',
        'Serve immediately'
      ]
    }
  ]

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-mono font-medium text-black">
        Instruction Templates
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {templates.map((template, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            onClick={() => onApplyTemplate(template.instructions)}
            disabled={disabled}
            className="font-mono text-sm p-2 h-auto text-left"
          >
            <div>
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-neutral-500 mt-1">
                {template.instructions.length} steps
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

// Icon components
function DragIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
  )
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function ImportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  )
}